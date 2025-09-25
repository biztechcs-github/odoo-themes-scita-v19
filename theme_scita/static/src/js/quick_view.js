/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

odoo.define("theme_scita.quick_view", [], function () {
    "use strict";

    publicWidget.registry.quickView = publicWidget.Widget.extend({
        selector: "#wrapwrap",
        events: {
            "click .quick_view_sct_btn": "_onQuickViewClick",
            "click .cart_view_sct_btn": "_onCartViewClick",
            "mouseenter .css_attribute_color": "_onMouseEnterSwatch",
            "click .css_attribute_color": "_onClickSwatch",
            "change input[name='add_qty']": "_onQtyChange",
            "click #add_to_cart, click a.js_add_cart_json": "_onAddToCart",
        },

        //----------------------------------------------------------------------
        // Handlers
        //----------------------------------------------------------------------

        async _onQuickViewClick(ev) {
            ev.preventDefault();
            const productId = $(ev.currentTarget).data("id");

            try {
                const data = await rpc("/theme_scita/shop/quick_view", { product_id: productId });
                const $modal = $("#shop_quick_view_modal");
                $modal.html(data).modal("show");
                $(".quick_cover").show();

                // Cleanup modal when closed
                $modal.off("hidden.bs.modal.quickview").on("hidden.bs.modal.quickview", () => {
                    $modal.html("").off(".quickview");
                });
            } catch (err) {
                console.error("Quick view RPC error", err);
            }
        },

        async _onCartViewClick(ev) {
            ev.preventDefault();
            const productId = $(ev.currentTarget).data("id");

            try {
                const data = await rpc("/theme_scita/shop/cart_view", { product_id: productId });
                $("#shop_cart_view_modal").html(data).modal("show");
            } catch (err) {
                console.error("Cart view RPC error", err);
            }
        },

        _onMouseEnterSwatch(ev) {
            const $swatch = $(ev.currentTarget);
            const previewSrc =
                $swatch.find("label").data("previewImgSrc") ||
                $swatch.find("img").attr("src");
            const $product = $swatch.closest(".js_product");
            const $img = $product.find("img").first();

            if (previewSrc && $img.length) {
                $img.attr("src", previewSrc);
            }

            $product.find(".css_attribute_color").removeClass("active");
            $swatch.addClass("active");
        },

        _onClickSwatch(ev) {
            ev.preventDefault();
            const $swatch = $(ev.currentTarget);
            const $input = $swatch.find("input[type=radio], input[type=checkbox]");

            if ($input.length) {
                $input.prop("checked", true).trigger("change");
            }
        },

        _onQtyChange(ev) {
            const qty = parseInt($(ev.currentTarget).val() || 1, 10);
            if (qty < 1) {
                $(ev.currentTarget).val(1);
            }
        },

        async _onAddToCart(ev) {
            ev.preventDefault();
            const $form = $(ev.currentTarget).closest("form");

            if ($form.length) {
                $form.submit(); // default Odoo behavior
                return;
            }

            // Fallback: manual RPC if no form exists
            const productId = $(ev.currentTarget).data("id");
            const qty = parseInt($("input[name='add_qty']").val() || 1, 10);

            try {
                const res = await rpc("/shop/cart/update_json", {
                    product_id: productId,
                    add_qty: qty,
                });
                console.log("Added to cart (quick view)", res);
            } catch (err) {
                console.error("Add to cart failed", err);
            }
        },
    });
});
