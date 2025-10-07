/** @odoo-module **/

import publicWidget from '@web/legacy/js/public/public_widget';
import wishlistUtils from '@website_sale_wishlist/js/website_sale_wishlist_utils';
import { rpc } from '@web/core/network/rpc';

publicWidget.registry.ThemeWishlistFix = publicWidget.Widget.extend({
    selector: "#wrapwrap",
    events: {
        'click a[data-action="o_wishlist"]': '_onAddToWishlist',
    },

    async _onAddToWishlist(ev) {
        ev.preventDefault();
        const el = ev.currentTarget;
        const productId = parseInt(el.dataset.productProductId);

        if (!productId) {
            console.warn("❌ No product ID found for wishlist");
            return;
        }

        try {
            await rpc('/shop/wishlist/add', { product_id: productId });
            wishlistUtils.addWishlistProduct(productId);
            wishlistUtils.updateWishlistNavBar();
            wishlistUtils.updateDisabled(el, true);

            el.querySelector('span')?.classList.add('text-danger');
            console.log(`❤️ Added to wishlist: ${productId}`);
        } catch (err) {
            console.error("Wishlist add failed:", err);
        }
    },
});
