# -*- coding: utf-8 -*-
# Part of AppJetty. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, tools


class WebsiteInherit(models.Model):
    _inherit = 'website'

    is_app_pwa = fields.Boolean(string='Enable PWA', help="PWA Enabled.", default=True)
    pwa_app_name = fields.Char("Application Name", translate=True, default='Appjetty PWA')
    pwa_app_short_name = fields.Char("Application Short Name", translate=True, default='Appjetty')
    pwa_app_back_color = fields.Char("Background Color", default='#7C7BAD')
    pwa_app_theme_color = fields.Char("Application Theme Color", default='#ffffff')
    pwa_app_start_url = fields.Char(string='Start URL', default='/')
    pwa_app_icon_512 = fields.Binary(string="Application Image(Size 512x512)",
                                     help="""Upload Image Size(512x512) and its must be PNG format""")


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    is_app_pwa = fields.Boolean(related='website_id.is_app_pwa', readonly=False)
    pwa_app_name = fields.Char(related='website_id.pwa_app_name', readonly=False)
    pwa_app_short_name = fields.Char(related='website_id.pwa_app_short_name', readonly=False)
    pwa_app_back_color = fields.Char(related='website_id.pwa_app_back_color', readonly=False)
    pwa_app_theme_color = fields.Char(related='website_id.pwa_app_theme_color', readonly=False)
    pwa_app_start_url = fields.Char(related='website_id.pwa_app_start_url', readonly=False)
    pwa_app_icon_512 = fields.Binary(related='website_id.pwa_app_icon_512', readonly=False)

    website_hide_price = fields.Boolean(
        string="Hide prices on website",
        related="website_id.website_hide_price",
        readonly=False,
    )
    website_hide_price_default_message = fields.Char(
        related="website_id.website_hide_price_default_message",
        readonly=False,
    )
    login_see_price = fields.Boolean(
        string="Login to see price",
        related="website_id.login_see_price",
        readonly=False,
    )

    @api.onchange('login_see_price')
    def _onchange_login_see_price(self):
        if self.login_see_price and self.website_hide_price:
            return {
                'warning': {
                    'title': "Conflict Detected",
                    'message': (
                        "‘Hide prices on website (Request Quote)’ is already active.\n"
                        "you only displayed request quote button on the website.\n"
                    ),
                }
            }