# # -*- coding: utf-8 -*-
# # Part of AppJetty. See LICENSE file for full copyright and licensing details.

from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale


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
