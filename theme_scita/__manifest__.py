# -*- coding: utf-8 -*-
{
    'name': 'Theme Scita',
    'summary': '''Mobile-first & versatile Odoo theme — perfect for eCommerce and all CMS-based industries.''',
    'author': 'AppJetty',
    'website': 'https://www.appjetty.com/',
    'category': 'Theme/Ecommerce',
    'version': '1.0',
    'license': 'OPL-1',
    'description': '''Theme Scita
Business theme
Furniture theme
Web To Print theme
Grocery theme
Single Page theme
Electronics Theme
Digital security theme
Event theme
Medical equipments theme
multipurpose template for industry
multipurpose template for all industries
odoo custom theme
customizable odoo theme
multi industry odoo theme
multi purpose responsive odoo theme
multipurpose website template for odoo
odoo multipurpose theme for industry
multipurpose templates for odoo
odoo ecommerce templates
odoo ecommerce theme
odoo ecommerce themes
odoo responsive themes
odoo website themes
odoo ecommerce website theme
odoo theme for ecommerce store
odoo bootstrap themes
customize odoo theme
odoo ecommerce store theme for business
odoo theme for business
odoo responsive website theme
Scita Theme
Odoo Scita Theme
Scita theme for Odoo
odoo 18 theme
multipurpose theme
odoo multipurpose theme
odoo responsive theme
responsive theme
odoo theme
odoo themes
ecommerce theme
odoo ecommerce themes
odoo website themes
odoo bootstrap themes
bootstrap themes
bootstrap theme
customize odoo theme
ecommerce store theme
theme for business
theme for ecommerce store
Shop by category
publish unpublish product
    ''',
    'depends': [
        'sale_management',
        'website_sale',
        'website_sale_stock',
        'website_sale_comparison',
        'website_sale_wishlist',
        'hr',
        'website_blog',
        'website_sale_loyalty'
    ],
    'data': [
        'security/ir.model.access.csv',
        'data/ir_asset.xml',
        'data/theme_scita_data.xml',
        'data/extra_pages_data.xml',
        'data/scita_image_data.xml',
        'views/theme.xml',
        'views/footer_option.xml',
        'views/header_option.xml',
        'views/res_config_view.xml',
        'views/views.xml',
        'views/res_company_view.xml',
        'views/sliders_view.xml',
        'views/website_view.xml',
        'views/brand_snippets.xml',
        'views/blogs_snippets.xml',
        'views/banner_snippets.xml',
        'views/case_study_snippets.xml',
        'views/service_snippets.xml',
        'views/testinomials_snippets.xml',
        'views/pricing_tables_snippets.xml',
        'views/our_team_snippets.xml',
        'views/policy_trust_snippets.xml',
        'views/newsletter_snippets.xml',
        'views/letstalk_snippets.xml',
        'views/how_it_work_snippets.xml',
        'views/expertise_statistics_snippets.xml',
        'views/contact_us_snippets.xml',
        'views/template.xml',
        'views/content_snippets.xml',
        'views/promo_banner_snippets.xml',
        'views/about_us_snippets.xml',
        'views/deal_of_day_snippets.xml',
        'views/client_snippets.xml',
        'views/category_snippets.xml',
        'views/timeline_snippets.xml',
        'views/protflio_snippets.xml',
        'views/snippet_google_map.xml',
        'views/trending_products_snippet.xml',
        'views/top_dealer_snippets.xml',
        'views/deal_of_the_day_config_view.xml',
        'views/snippets.xml',
        'views/product_details_template.xml',
        # 'views/shop_page_amp_template.xml',
        'views/shop_by_category.xml',
        'views/deal_of_day_page.xml',
        'views/pwa_config_view.xml',
        'views/pwa_template.xml',
        'views/header_option_extended.xml',
        'views/my_account_changes.xml',
        'views/new_snippets.xml',
        'views/shop_page_attribute.xml',
        'views/theme_cusomization.xml',
        'views/bulk_buy_product_discount.xml',
        'views/snippets/snippets.xml',  
        'views/snippets/test_snippet.xml',
        'views/image_hotspot_views.xml',
        'views/playground_template.xml',
        'views/brand_template.xml',
        'views/playground_preview.xml',
        'views/request_quote_custom_templates.xml',
        'views/request_for_quote_views.xml',
        'views/similar_products.xml',
    ],
    'support': 'support@appjetty.com',
    'live_test_url': 'https://theme-scita-v18.appjetty.com/',
    'images': [
        'static/description/splash-screen.png',
        'static/description/splash-screen_screenshot.gif',
    ],
    "cloc_exclude": [
        "static/**/*",
        "data/**/*",
        "views/**/*"
    ],
    'application': True,
    'price': 165.00,
    'currency': 'EUR',
    'installable': True,
    'assets': {
        'web.assets_frontend': [
            'theme_scita/static/src/css/owl.carousel.css',
            'theme_scita/static/src/fonts/line-icons.css',
            'theme_scita/static/src/skins/alexis/alexis.css',
            'theme_scita/static/src/scss/variable.scss',
            'theme_scita/static/src/scss/mixins.scss',
            'theme_scita/static/src/scss/comman.scss',
            'theme_scita/static/src/scss/playground.scss',
            'theme_scita/static/src/scss/snippets.scss',
            'theme_scita/static/src/scss/megamenu_style.scss',
            'theme_scita/static/src/scss/product_style.scss',
            'theme_scita/static/src/scss/checkout_style.scss',
            'theme_scita/static/src/scss/cms_pages.scss',
            'theme_scita/static/src/scss/header/default_header.scss',
            'theme_scita/static/src/scss/header/header_styles.scss',
            'theme_scita/static/src/scss/footer/default_footer.scss',
            'theme_scita/static/src/scss/mobile_category.scss',
            'theme_scita/static/src/scss/footer/footer_styles.scss',
            'theme_scita/static/src/js/owl.carousel.min.js',
            'theme_scita/static/src/js/scita_fronted.js',
            'theme_scita/static/src/js/timer_fronted.js',
            'theme_scita/static/src/js/new_scita_frontend.js',
            'theme_scita/static/src/js/shop_attribute.js',
            'theme_scita/static/src/js/product_details.js',
            'theme_scita/static/src/js/see_more_brand.js',
            'theme_scita/static/src/js/header.js',
            'theme_scita/static/src/js/bulk_price_btn.js',
            'theme_scita/static/src/scss/pwa_design.scss',
            'theme_scita/static/src/js/lazy_load_button.js',
            'theme_scita/static/src/js/pwa_implementation.js',
            'theme_scita/static/src/js/quick_view.js',
            'theme_scita/static/src/js/mobile_view.js',
            'theme_scita/static/src/js/snippet_preview.js',
            'theme_scita/static/src/js/feather_init.js',
            'theme_scita/static/src/js/pg_slider.js',
            'theme_scita/static/src/js/similar_products_sidebar.js',
            'theme_scita/static/src/scss/mobile_category.scss',
            ('before', '/theme_scita/static/src/scss/comman.scss',
             'theme_scita/static/src/scss/button/button_styles.scss'),
            ('before', '/theme_scita/static/src/scss/comman.scss',
             'theme_scita/static/src/scss/product_hover_effect.scss'),
        ],
        'website.assets_wysiwyg': [
            'theme_scita/static/src/js/scita_editor.js',
            'theme_scita/static/src/js/new_scita_editor.js',
            'theme_scita/static/src/js/timer_editor.js',
            '/theme_scita/static/src/xml/**/*',
        ],
        'website.assets_editor': [
          'theme_scita/static/src/xml/scita_header_option.xml',
          'theme_scita/static/src/xml/scita_footer_option.xml',
        ],
        'website.website_builder_assets': [
            'theme_scita/static/src/js/snippet/fashionMultiCatSnippetPlugin.js',
            'theme_scita/static/src/js/snippet/dynamicVideoSnippetPlugin.js',
            'theme_scita/static/src/js/snippet/dealSellerMultiProductSnippetPlugin.js',
            'theme_scita/static/src/js/snippet/dealOfTheDaySnippetPlugin.js',
            'theme_scita/static/src/js/snippet/brandsSnippetPlugin.js',
            'theme_scita/static/src/js/snippet/sctProductSnippet1Plugin.js',
            'theme_scita/static/src/js/snippet/trendingProductsModifyPlugin.js',
            'theme_scita/static/src/js/snippet/googleMapSnippetPlugin.js',
            'theme_scita/static/src/js/snippet/blogSnippetPlugin.js',
            'theme_scita/static/src/xml/theme_scita.xml',
            'theme_scita/static/src/xml/s_google_snippet_modal.xml',
        ],
    }
}
