# -*- coding: utf-8 -*-
# Part of AppJetty. See LICENSE file for full copyright and licensing details.

import re

import werkzeug
from lxml import etree
from odoo import models, api, fields
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale

PPG = 18


class WebsiteMenu(models.Model):
    _inherit = "website.menu"

    is_megamenu = fields.Boolean(string='Is megamenu...?')
    megamenu_view_type = fields.Selection([('cat_megamenu', 'Category Megamenu'),
                                           ('cat_img_megamenu',
                                            "Category Image Megamenu"),
                                           ('prod_megamenu', "Products Megamenu"),
                                           ('pages_megamenu', "Pages Megamenu"),
                                           ('service_page_megamenu',
                                            "Service Menu"),
                                           ('service_content_megamenu',
                                            "Service Content Menu"),
                                           ('service_banner_megamenu',
                                            "Service Banner Menu")
                                           ],
                                          default='cat_megamenu',
                                          string="Megamenu View Type")
    is_service_menu = fields.Boolean(
        string='Is service menu...?', default=False)
    is_service_content_menu = fields.Boolean(
        string='Is service content menu...?', default=False)
    megamenu_size = fields.Selection([('medium', 'Medium'),
                                      ('large', 'Large')],
                                     default='medium',
                                     string="Megamenu Size")

    megamenu_type = fields.Selection([
        ('2_col', '2 Columns'),
        ('3_col', '3 Columns'),
        ('4_col', '4 Columns')],
        default='3_col',
        string="Megamenu type")
    megamenu_type1 = fields.Selection([('1_col', '1 Columns'),
                                       ('2_col', '2 Columns'),
                                       ('3_col', '3 Columns'),
                                       ('4_col', '4 Columns')],
                                      default='3_col',
                                      string="Megamenu columns")
    category_slider = fields.Boolean(
        string='Want to display category slider', default=False)
    carousel_header_name = fields.Char(string="Slider label",
                                       default="Latest",
                                       translate=True,
                                       help="Header name for carousel slider in megamenu")
    category_slider_position = fields.Selection([('left', 'Left'), ('right', 'Right')],
                                                default='left', string="Category Slider Position")

    display_menu_footer = fields.Boolean(string="Display menu footer", default=False,
                                         help="For displaying footer in megamenu")
    menu_footer = fields.Text(string="Footer content",
                              translate=True,
                              help="Footer name for megamenu")
    megamenu_product_ids = fields.Many2many("product.template", string="Products", domain=[
        ('website_published', '=', True)])

    is_img_banner = fields.Boolean(
        string='Want to display Banner', default=False)
    img_banner = fields.Binary(
        string="image banner", help="Menu image banner for your menu")
    img_banner_position = fields.Selection(
        [('left', 'Left'), ('right', 'Right')], default='left', string="Image Banner Position")
    img_menu = fields.Binary(
        string="Menu image", help="Menu image  your menu")
    menu_desc = fields.Text(string="Menu description",
                            translate=True,
                            help="Menu description")
    service_content = fields.Text(string="Menu Content",
                                  translate=True,
                                  help="sub menu")
    banner_content = fields.Text(string="banner Content",
                                 translate=True,
                                 help="Banner description")
    img_grid = fields.Boolean(
        string='Want to display image grid', default=False)
    banner_images_ids = fields.One2many("banner.image", "website_menu_id", "Product Grid Images")

    @api.onchange('parent_id')
    def _on_change_parent(self):
        """ Password parent
        """
        if self.parent_id.megamenu_view_type == 'service_page_megamenu' or self.parent_id.megamenu_view_type == 'service_content_megamenu':
            self.is_service_menu = True
        else:
            self.is_service_menu = False


class website(models.Model):
    _inherit = 'website'

    header_logo = fields.Binary('Header Logo')
    footer_logo = fields.Binary('Footer Logo')
    shop_qty = fields.Boolean('Decimal Quantity')
    hide_price = fields.Boolean('Price Hide for Grid View')
    add_to_cart = fields.Boolean('Add Cart Button Hide')
    # For Multi image
    no_extra_options = fields.Boolean(string='Want to customize multi-image slider',
                                      default=False,
                                      help="Slider with all options for next, previous, play, pause, fullscreen, hide/show thumbnail panel.")
    interval_play = fields.Char(string='slideshow interval', default='5000',
                                help='With this field you can set the interval play time between two images.')
    enable_disable_text = fields.Boolean(string='Enable text panel',
                                         default=True,
                                         help='Enable/Disable text which is visible on the image in multi image.')
    color_opt_thumbnail = fields.Selection([
        ('default', 'Default'),
        ('b_n_w', 'B/W'),
        ('sepia', 'Sepia'),
        ('blur', 'Blur'), ],
        default='default',
        string="Thumbnail overlay effects")
    thumbnail_panel_position = fields.Selection([
        ('left', 'Left'),
        ('right', 'Right'),
        ('bottom', 'Bottom'),
    ], default='left',
        string='Thumbnails panel position',
        help="Select the position where you want to display the thumbnail panel in multi image.")
    change_thumbnail_size = fields.Boolean(
        string="Change thumbnail size", default=False)
    thumb_height = fields.Char(string='Thumb height', default=86)
    thumb_width = fields.Char(string='Thumb width', default=66)
    # For Brand setting
    is_brand_display = fields.Boolean(
        string="Brand display in product page", default=False)
    brand_display_option = fields.Selection([
        ('name', 'Name'),
        ('logo', 'Logo'),
    ], default='logo',
        string='Brand Display Option',
        help="Select the option for brand logo  or name display.")
    is_default_code = fields.Boolean(
        string="Default code display in product page", default=False)
    # is_amp_enable = fields.Boolean(
    #     string="Enable AMP", default=True)

    @api.model
    def theme_scita_payment_icons(self):
        return self.env['payment.method'].sudo().search([
            ('brand_ids.active', '=', True)], limit=5).brand_ids

    # for product brand
    def get_product_brands(self, category, **post):
        domain = []
        if category:
            cat_id = []
            if category != None:
                for ids in category:
                    cat_id.append(ids.id)
                domain += ['|', ('public_categ_ids.id', 'in', cat_id),
                           ('public_categ_ids.parent_id', 'in', cat_id)]
        else:
            domain = []
        product_ids = self.env["product.template"].sudo(
        ).search(domain)
        domain_brand = [
            ('product_ids', 'in', product_ids.ids or []), ('product_ids', '!=', False)]
        brands = self.env['product.brands'].sudo().search(domain_brand)
        return brands

    # for hr.employee
    def get_snippet_employee(self):
        employee = self.env['hr.employee'].sudo().search(
            [('include_inourteam', '=', 'True')])
        return employee

    def get_snippet_blog_post(self):
        post = self.env['blog.post'].sudo().search(
            [('website_published', '=', 'True')])
        return post

    # For pages megamenu
    def get_megamenu_pages(self, submenu):
        menus = self.env['website.menu'].sudo().search(
            [('parent_id', '=', submenu.id)])
        return menus

    # For pages megamenu count
    def get_megamenu_pages_count(self, submenu):
        page_menu_count = self.env['website.menu'].sudo().search_count(
            [('parent_id', '=', submenu.id)])
        return page_menu_count

    # For category megamenu
    def get_public_product_category(self, submenu):
        categories = self.env['product.public.category'].search(
            [('parent_id', '=', False), ("website_id", "in", (False, request.website.id)),
             ('include_in_megamenu',
              '!=', False),
             ('menu_id', '=', submenu.id)],
            order="name")
        return categories

    def get_all_public_product_category(self, submenu):
        categories = self.env['product.public.category'].search([("website_id", "in", (False, request.website.id)),
                                                                 ('include_in_megamenu',
                                                                  '!=', False),
                                                                 ('menu_id', '=', submenu.id)],
                                                                order="name")
        return categories

    # For child category megamenu
    def get_public_product_child_category(self, children):
        child_categories = []
        for child in children:
            categories = self.env['product.public.category'].search([
                ('id', '=', child.id),
                ("website_id", "in", (False, request.website.id)),
                ('include_in_megamenu', '!=', False)], order="name")
            if categories:
                child_categories.append(categories)
        return child_categories

    def get_parent_category_breadcum(self, category):
        data = []
        parent_cat = False
        if category:
            cat_data = self.env['product.public.category'].search(
                [('id', '=', int(category))])
            data.append(cat_data)
            parent_cat = cat_data
            if cat_data and cat_data.parent_id:
                parent_cat = cat_data.parent_id
                data.append(parent_cat)
                while parent_cat.parent_id:
                    parent_cat = parent_cat.parent_id
                    data.append(parent_cat)
            data.reverse()
        return data

    def get_user_address(self, user_id=None):
        address_details = {}
        if user_id:
            self.sudo().write({})
            address_details['street'] = user_id.street if user_id.street else None
            address_details['street2'] = user_id.street2 if user_id.street2 else None
            address_details['city'] = user_id.city if user_id.city else None
            address_details['state_id'] = user_id.state_id.code if user_id.state_id else None
            address_details['country_id'] = user_id.country_id.code if user_id.country_id else None
            address_details['zip'] = user_id.zip if user_id.zip else None
        return address_details

    def get_all_category(self):
        shop_category = request.env['product.public.category'].sudo().search([])
        return shop_category

    def get_multiple_images(self, product_id=None):
        productsss = False
        if product_id:
            products = self.env['scita.product.images'].search(
                [('biz_product_tmpl_id', '=', product_id)], order='sequence')
            if products:
                return products
        return productsss

    def get_all_categories(self):
        categoriess = self.env['product.public.category'].search(
            [('include_in_allcategory', "=", True), ('parent_id', '=', False),
             ("website_id", "in", [False, request.website.id])])
        return categoriess

    # For category menu in topmenu
    def get_child_all_categories(self, child_id):
        child_categories = self.env['product.public.category'].search(
            [('include_in_allcategory', "=", True), ('parent_id', '=', child_id.id),
             ("website_id", "in", [False, request.website.id])], order="sequence asc")
        return child_categories

    def get_categories(self, category=None):
        cat = {}
        shop_category = request.env['product.public.category'].sudo().search(
            [('parent_id', '=', None)], order='name asc')
        cat.update({'categ': shop_category})
        return cat

    website_hide_price = fields.Boolean(
        string="Hide prices on website",
        copy=False,
        help="Hide price at website level",
    )
    website_show_price = fields.Boolean(compute="_compute_website_show_price")
    website_hide_price_default_message = fields.Char(
        string="Default Hidden price message",
        help="When the price is hidden on the website we can give the customer"
        "some tips on how to find it out.",
        translate=True,
    )
    login_see_price = fields.Boolean(
        string="Login to see price",
        help="Require users to log in to view prices on this website",
        readonly=False,
    )

    def _compute_website_show_price(self):
        for rec in self:
            rec.website_show_price = (
                not rec.website_hide_price
                and request.env.user.partner_id.website_show_price
            )



    # A CSS background is the worst case for LCP: the browser cannot even ask
    # for it until the stylesheet has parsed and the element has been laid out.
    # On the electronics demo that put the hero banner's discovery 2.06s into
    # the load. <img> is cheaper to discover but still waits behind the
    # stylesheet. Whichever of the two appears first in the page's own markup
    # is the top of the page, so that is the one worth a preload hint.
    # Odoo-stored images (website-editable fields like
    # theme_scita.sct_banner_slider_image) are served as /web/image/<model>.
    # <field>, with no file extension at all - only static theme assets under
    # /theme_scita/static/... end in .png/.jpg/etc. Matching only the
    # extension form (as this used to) silently misses every dynamic hero
    # image and falls through to whatever static <img> happens to appear
    # first in the arch instead - on this site that was a 430x116 category-
    # slider thumbnail nowhere near the real hero, wasting the one preload
    # slot on the wrong 4KB image while the real ~200KB hero got none.
    _SCITA_URL_BODY = r'/(?:web/image/[^"\'()&\s]+|[^"\'()&\s]+\.(?:png|jpe?g|webp|gif))'
    _SCITA_BG_IMAGE_RE = re.compile(
        r'background-image:\s*url\(\s*(?:&#34;|&quot;|["\'])?'
        r'(' + _SCITA_URL_BODY + r')'
    )
    _SCITA_IMG_TAG_RE = re.compile(r'<img\b[^>]*?>')
    _SCITA_IMG_SRC_RE = re.compile(r'\ssrc="(' + _SCITA_URL_BODY + r')"')
    _SCITA_IMG_WIDTH_RE = re.compile(r'\swidth="(\d+)"')

    def _scita_lcp_preload_href(self, main_object):
        """URL of the page's likely LCP image, or False.

        Only literal, same-origin URLs are considered - t-att-src is evaluated
        too late to be useful here, and guessing would risk preloading
        something the page never requests. Any failure returns False: a
        performance hint must never be able to break a page.
        """
        try:
            self.ensure_one()
            if main_object is None or 'arch' not in getattr(main_object, '_fields', {}):
                return False
            arch = main_object.sudo().arch
            if not arch:
                return False

            candidates = []
            background = self._SCITA_BG_IMAGE_RE.search(arch)
            if background:
                candidates.append((background.start(), background.group(1)))

            for tag in self._SCITA_IMG_TAG_RE.finditer(arch):
                markup = tag.group(0)
                src = self._SCITA_IMG_SRC_RE.search(markup)
                if not src:
                    # .svg is deliberately excluded: in this theme they are
                    # arrows and other chrome, never the LCP element.
                    continue
                declared = self._SCITA_IMG_WIDTH_RE.search(markup)
                if declared and int(declared.group(1)) < 200:
                    continue
                candidates.append((tag.start(), src.group(1)))
                break

            href = min(candidates)[1] if candidates else False
            # Recorded so ir_qweb's eager-image hook (models/ir_qweb.py) can
            # tell whether this request already has a definitive LCP answer.
            # Without this, that hook falls back to "first <img> in rendered
            # document order" - wrong whenever the real LCP is a CSS
            # background (as on the homepage hero), where it ends up
            # eager-loading + fetchpriority=high'ing an unrelated first
            # <img> instead, stealing bandwidth from the actual LCP resource
            # on the throttled connection.
            request._scita_lcp_href = href
            return href
        except Exception:  # noqa: BLE001
            return False
    # The upright latin faces of the body font, which is shipped with the
    # theme (static/src/css/poppins.css). Text laid out in the fallback font
    # and then re-laid-out in the real one is a layout shift, and on this
    # theme a large one - 0.331 CLS on /shop on the 21 Aug 2026 mobile run,
    # 16 Lighthouse points, more than any byte-size win available on the
    # page. Google's stylesheets hard-code font-display: swap and Odoo stores
    # them verbatim, so the only way to avoid the reflow is for the font to
    # be there before first paint.
    #
    # Only these two: a preload is fetched at High priority, out of the same
    # budget as the LCP image. Italic and the 300 weight are used sparsely
    # enough that preloading them would cost more than the shift they save,
    # and latin-ext is not reachable at all from English content.
    _SCITA_FONT_PRELOAD_HREFS = (
        '/theme_scita/static/src/fonts/poppins/poppins-400-latin.woff2',
        '/theme_scita/static/src/fonts/poppins/poppins-700-latin.woff2',
    )

    # Fonts this module ships the woff2 files for. Kept in sync with
    # static/src/css/poppins.css and the list in
    # static/src/scss/font_source_override.scss, which is what actually stops
    # Odoo emitting an @import for them.
    _SCITA_SHIPPED_FONTS = ('Poppins',)

    _SCITA_GOOGLE_FONTS_RE = re.compile(r"'google-fonts':\s*\(([^)]*)\)")
    _SCITA_LOCAL_FONTS_RE = re.compile(r"'google-local-fonts':\s*\(([^)]*)\)")
    _SCITA_FONT_NAME_RE = re.compile(r"'([^']+)'")

    def _scita_font_preload_hrefs(self):
        """woff2 URLs to preload. Static: the theme ships these files."""
        return list(self._SCITA_FONT_PRELOAD_HREFS)

    def _scita_uses_remote_google_fonts(self):
        """True when some font on this site is still fetched from Google.

        Decides whether the fonts.googleapis.com / fonts.gstatic.com
        preconnects are worth emitting. Odoo's website.layout emits the
        gstatic one unconditionally; this theme replaces it (see
        theme_scita_fonts_preconnect) because on a default install the answer
        is now no - the body font is shipped in this module, so nothing is
        fetched cross-origin and a preconnect to an origin that is never
        contacted is pure connection setup that Lighthouse flags.

        It can still be yes: an admin who picks a different font in the
        website editor puts it in 'google-fonts', and every font in
        scita_fonts.scss other than the shipped ones carries a Google 'url'.
        So read the same setting the SCSS reads and subtract the two cases
        that never reach Google - the fonts this module ships, and the ones
        the database has downloaded into an attachment ("host fonts locally").

        Any failure returns False: emitting no preconnect costs one handshake
        on a font that may not even be used, while a wrong True costs one on
        every page load.
        """
        try:
            self.ensure_one()
            attachment = self.env['ir.attachment'].sudo().search([
                ('url', '=', self._SCITA_USER_VALUES_URL),
                ('website_id', 'in', (self.id, False)),
            ], order='website_id desc', limit=1)
            if not attachment:
                return False
            values = (attachment.raw or b'').decode('utf-8')

            def _names(regex):
                match = regex.search(values)
                if not match:
                    return set()
                return set(self._SCITA_FONT_NAME_RE.findall(match.group(1)))

            remote = _names(self._SCITA_GOOGLE_FONTS_RE)
            remote -= _names(self._SCITA_LOCAL_FONTS_RE)
            remote -= set(self._SCITA_SHIPPED_FONTS)
            return bool(remote)
        except Exception:  # noqa: BLE001
            return False

    _SCITA_USER_VALUES_URL = (
        '/_custom/web.assets_frontend'
        '/website/static/src/scss/options/user_values.scss'
    )
