from odoo import http
from odoo.http import request

class SimilarProductController(http.Controller):
    @http.route('/get_similar_products', type='json', auth='public', methods=['POST'], website=True)
    def get_similar_products_sidebar(self, product_id):
            currency = request.website.currency_id
            Product = request.env['product.template'].sudo()
            product = Product.browse(product_id)

            if not product.exists():
                return {'error': 'Product not found', 'similar_products': []}

            similar_products = product.similar_product_ids or request.env['product.template']
            data = []

            for p in similar_products:
                data.append({
                    'id': p.id,
                    'name': p.name,
                    'price': p.list_price,
                    'image_url': f"/web/image/product.template/{p.id}/image_1920",
                    'product_url': f"/shop/product/{p.id}",
                    'rating_avg': p.rating_avg,
                    'rating_count': p.rating_count,
                    'compare_price' :p.compare_list_price,
                    'description_ecommerce':p.description_ecommerce,
                    'sku':p.default_code,
                })

            return {
                'similar_products': data,
                'currency': {
                'symbol': currency.symbol,
                'position': currency.position,
                'decimal_places': currency.decimal_places,
            }
            }
