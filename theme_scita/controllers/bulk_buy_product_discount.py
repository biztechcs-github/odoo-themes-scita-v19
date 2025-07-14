# # -*- coding: utf-8 -*-
# # Part of AppJetty. See LICENSE file for full copyright and licensing details.

# from odoo import http
# from odoo.http import request
# from odoo.addons.website_sale.controllers.main import WebsiteSale


# class WebsiteSaleExtended(WebsiteSale):

#     @http.route(['/shop/<model("product.template"):product>'], type='http', auth="public", website=True,
#                 sitemap=WebsiteSale.sitemap_products, readonly=True)
#     def product(self, product, category='', search='', **kwargs):
#         # First check access as original method
#         if not request.website.has_ecommerce_access():
#             return request.redirect('/web/login')

#         # Call the original method to get the default values
#         values = self._prepare_product_values(product, category, search=search, **kwargs)

#         # Fetch or create current sale order (cart)
#         order_sudo = request.website.sale_get_order(force_create=True)
#         if order_sudo.state != 'draft':
#             request.website.sale_reset()
#             order_sudo = request.website.sale_get_order(force_create=True)

#         # Add the order to the template context
#         values.update({
#             'website_sale_order': order_sudo,
#         })
#         return request.render("website_sale.product", values)
# -*- coding: utf-8 -*-
# Part of AppJetty. See LICENSE file for full copyright and licensing details.

from odoo import http
from odoo.http import request, route
from odoo.addons.website_sale.controllers.main import WebsiteSale
from odoo.addons.website_sale.const import SHOP_PATH


class WebsiteSaleExtended(WebsiteSale):

    @route(
        [
            f'{SHOP_PATH}/<model("product.template"):product>',
            f'{SHOP_PATH}/<model("product.public.category"):category>/<model("product.template"):product>',
        ],
        type='http',
        auth='public',
        website=True,
       
    )
    def product(self, product, category=None, pricelist=None, **kwargs):
        # First check access as original method
        if not request.website.has_ecommerce_access():
            return request.redirect('/web/login')

        search = request.httprequest.args.get('search', '')

        # Call the original method to get the default values
        values = self._prepare_product_values(product, category,  search=search, **kwargs)

        # Fetch or create current sale order (cart) - Updated for Odoo 19
        order_sudo = request.cart or request.website._create_cart()
        if order_sudo.state != 'draft':
            request.website.sale_reset()
            order_sudo = request.cart or request.website._create_cart()

        # Add the order to the template context
        values.update({
            'website_sale_order': order_sudo,
        })
        print("values", values) 
        return request.render("website_sale.product", values)
