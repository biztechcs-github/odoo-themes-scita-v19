# # -*- coding: utf-8 -*-
# # Part of AppJetty. See LICENSE file for full copyright and licensing details.

from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale
from odoo.addons.website_sale.controllers.variant import WebsiteSaleVariantController
from odoo.addons.website_sale.controllers.product_configurator import WebsiteSaleProductConfiguratorController


class WebsiteSaleExtended(WebsiteSale):

    @http.route(['/shop/<model("product.template"):product>'], type='http', auth="public", website=True,
                sitemap=WebsiteSale.sitemap_products)
    def product(self, product, category='', search='', **kwargs):
        if not request.website.has_ecommerce_access():
            return request.redirect('/web/login')

        values = self._prepare_product_values(product, category, search=search, **kwargs)

        order_sudo = request.cart or request.website._create_cart()
        if order_sudo.state != 'draft':
            request.website.sale_reset()
            order_sudo = request.cart or request.website._create_cart()

        # Add the order to the template context
        values.update({
            'website_sale_order': order_sudo,
        })
        return request.render("website_sale.product", values)


class ScitaBulkVariantController(WebsiteSaleVariantController):

    @http.route(
        '/website_sale/get_combination_info',
        type='jsonrpc',
        auth='public',
        methods=['POST'],
        website=True,
        readonly=True,
    )
    def get_combination_info_website(self, product_template_id, product_id, combination, add_qty, uom_id=None, **kwargs):
        combination_info = super().get_combination_info_website(
            product_template_id=product_template_id,
            product_id=product_id,
            combination=combination,
            add_qty=add_qty,
            uom_id=uom_id,
            **kwargs
        )

        bulk_prices = []
        pricelist = request.pricelist

        if pricelist and product_template_id:
            template = request.env['product.template'].browse(int(product_template_id))
            # Use the server-resolved variant, not the stale one from the JS hidden input
            variant = request.env['product.product'].browse(combination_info.get('product_id'))
            bulk_prices = template._scita_bulk_price_rules(pricelist, variant)

            # Override combination.price with the tier the quantity reaches, so
            # the price next to the buttons can never contradict them.
            if bulk_prices and add_qty:
                bulk_price = request.env['product.template']._scita_bulk_price_for_qty(
                    bulk_prices, int(float(add_qty))
                )
                if bulk_price is not None:
                    combination_info['price'] = bulk_price

        combination_info['bulk_prices'] = bulk_prices
        return combination_info


class ScitaBulkConfiguratorController(WebsiteSaleProductConfiguratorController):
    """Explicitly override the two product-configurator dialog routes so Odoo
    registers THIS class as the route handler.  Without @http.route the parent
    class keeps handling the requests and our _get_basic_product_information
    override is never reached."""

    @http.route(
        '/website_sale/product_configurator/get_values',
        type='jsonrpc',
        auth='public',
        website=True,
        readonly=True,
    )
    def website_sale_product_configurator_get_values(self, *args, **kwargs):
        result = super().website_sale_product_configurator_get_values(*args, **kwargs)

        quantity = int(float(kwargs.get('quantity', 0) or 0))
        product_template_id = kwargs.get('product_template_id')

        if result.get('products') and quantity >= 2 and product_template_id:
            main_product = result['products'][0]
            variant_id = main_product.get('id') or None
            bulk_price = self._scita_get_bulk_price(
                int(product_template_id), variant_id, quantity
            )
            if bulk_price is not None:
                main_product['price'] = bulk_price

        return result

    @http.route(
        '/website_sale/product_configurator/update_combination',
        type='jsonrpc',
        auth='public',
        methods=['POST'],
        website=True,
        readonly=True,
    )
    def website_sale_product_configurator_update_combination(self, *args, **kwargs):
        result = super().website_sale_product_configurator_update_combination(*args, **kwargs)

        quantity = int(float(kwargs.get('quantity', 0) or 0))
        product_template_id = kwargs.get('product_template_id')

        if result and quantity >= 2 and product_template_id:
            # result['id'] is the product.product id (or False for templates)
            variant_id = result.get('id') or None
            bulk_price = self._scita_get_bulk_price(
                int(product_template_id), variant_id, quantity
            )
            if bulk_price is not None:
                result['price'] = bulk_price

        return result

    def _scita_get_bulk_price(self, tmpl_id, variant_id, quantity):
        """Return the best-matching bulk fixed_price for the given product and
        quantity, or None if no rule qualifies."""
        pricelist = request.pricelist
        if not pricelist:
            return None

        template = request.env['product.template'].browse(tmpl_id)
        variant = request.env['product.product'].browse(variant_id) if variant_id else None
        bulk_rules = template._scita_bulk_price_rules(pricelist, variant)
        return request.env['product.template']._scita_bulk_price_for_qty(bulk_rules, quantity)
