/** @odoo-module **/

import publicWidget from '@web/legacy/js/public/public_widget';
import wishlistUtils from '@website_sale_wishlist/js/website_sale_wishlist_utils';
import { rpc } from '@web/core/network/rpc';
import wSaleUtils from '@website_sale/js/website_sale_utils';

publicWidget.registry.ThemeWishlistFix = publicWidget.Widget.extend({
    selector: "#wrapwrap",
    events: {
        'click a[data-action="o_wishlist"]': '_onAddToWishlist',
    },

    async _onAddToWishlist(ev) {
        ev.preventDefault();
        const el = ev.currentTarget;
        const productId = parseInt(el.dataset.productProductId);
        const form = wSaleUtils.getClosestProductForm(el);

        if (!productId) {
            console.warn("❌ No product ID found for wishlist");
            return;
        }

        if (!productId || wishlistUtils.getWishlistProductIds().includes(productId)) return;

        try {
            await rpc('/shop/wishlist/add', { product_id: productId });
            wishlistUtils.addWishlistProduct(productId);
            wishlistUtils.updateWishlistNavBar();
            wishlistUtils.updateDisabled(el, true);
            await wSaleUtils.animateClone(
                $(document.querySelector('.o_wsale_my_wish')),
                $(document.querySelector('#product_detail_main') ?? el.closest('.o_cart_product') ?? form),
                25,
                40,
            );
            if (el.classList.contains('o_add_wishlist')) {
                const iconEl = el.querySelector('.fa');
                if (iconEl) {
                    iconEl.classList.remove('fa-heart-o');
                    iconEl.classList.add('fa-heart');
                }
            }
        } catch (err) {
            // console.error("Wishlist add failed:", err);
        }
    },
});
