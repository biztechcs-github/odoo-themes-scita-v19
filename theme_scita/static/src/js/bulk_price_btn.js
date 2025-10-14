// /** @odoo-module **/

// import publicWidget from "@web/legacy/js/public/public_widget";
// import { rpc } from '@web/core/network/rpc';
// import { _t } from "@web/core/l10n/translation";

// publicWidget.registry.BulkPriceButton = publicWidget.Widget.extend({
//     selector: '.o_bulk_price_btn',

//     events: {
//         'click': '_onClickBulkPrice',
//     },

//     /**
//      * Initialize widget
//      */
//     start: function () {
//         this.productId = this.$el.data('product-id');
//         this.variantId = this.$el.data('variant-id');
//         this.$qtyInput = this.$el.closest('.o_product_card, .product_detail').find('.js_qty');
//     },

//     /**
//      * Click handler
//      */
//     _onClickBulkPrice: async function (ev) {
//         alert("a");
//         console.log(ev);
        
//         ev.preventDefault();
//         console.log("Bulk price button clicked!"); // <-- should log now

//         const qty = this.$qtyInput.length ? parseFloat(this.$qtyInput.val() || "1") : 1;
//         const productId = parseInt(this.productId || this.variantId);

//         if (!productId) {
//             console.warn("No product id found on bulk price button element.");
//             return;
//         }

//         try {
//             this.$el.addClass('loading').prop('disabled', true);

//             const result = await rpc('/bulk_price/compute', {
//                 product_id: productId,
//                 quantity: qty,
//             });

//             if (result && result.price) {
//                 this._showNotification(
//                     _t("Bulk Price: ") + result.price.toFixed(2) + " " + (result.currency || "")
//                 );
//             } else {
//                 this._showNotification(_t("Unable to compute bulk price."));
//             }
//         } catch (error) {
//             console.error("BulkPriceButton RPC failed:", error);
//             this._showNotification(_t("Something went wrong while fetching bulk price."), "danger");
//         } finally {
//             this.$el.removeClass('loading').prop('disabled', false);
//         }
//     },

//     /**
//      * Simple notification
//      */
//     _showNotification: function (message, type = 'info') {
//         const notification = $('<div>', {
//             class: `bulk_price_notification alert alert-${type}`,
//             text: message,
//         }).css({
//             position: 'fixed',
//             top: '20px',
//             right: '20px',
//             zIndex: 1050,
//             padding: '8px 14px',
//             borderRadius: '6px',
//             background: type === 'danger' ? '#dc3545' : '#198754',
//             color: 'white',
//         });
//         $('body').append(notification);
//         setTimeout(() => notification.remove(), 3000);
//     },
// });

/** @odoo-module **/

import publicWidget from '@web/legacy/js/public/public_widget';
import { rpc } from '@web/core/network/rpc';
import { _t } from "@web/core/l10n/translation";

publicWidget.registry.BulkPriceButtonWidget = publicWidget.Widget.extend({
    selector: '.js_product', // Parent container of product card

    events: {
        'click .o_bulk_price_btn': '_onBulkPriceClick',
        // 'change input[name="add_qty"]': '_onChangeAddQuantity',
        // 'click .js_qty_control': 'onClickAddCartJSON', // Assuming your + / - buttons have this class
    },

    /**
     * Handle bulk price button click
     */
    _onBulkPriceClick: function (ev) {
        ev.preventDefault();
        $(".o_bulk_price_btn").removeClass("active");
        const $btn = $(ev.currentTarget).addClass("active");
        const qty = parseInt($btn.attr('qty')) || 1;
        const $parent = $btn.closest('.js_product');
        const $qtyInput = $parent.find('input[name="add_qty"]');
        $qtyInput.val(qty).trigger('change');
        // this._getCombinationInfo(ev);
    },

    /**
     * Handle manual quantity input change
     */
    _onChangeAddQuantity: function (ev) {
        var $input = $(ev.currentTarget);
        var newQty = parseFloat($input.val() || 0, 10);
        var $parent = $input.closest('.js_product');
        $parent.find('.o_bulk_price_btn').removeClass('active');
        $parent.find(`.o_bulk_price_btn[qty="${newQty}"]`).addClass('active');
        this.onChangeAddQuantity(ev);
    },

    /**
     * Handle +/- buttons click
     */
    onClickAddCartJSON: function (ev) {
        ev.preventDefault();
        var $link = $(ev.currentTarget);
        var $input = $link.closest('.input-group').find("input");
        var min = parseFloat($input.data("min") || 0);
        var max = parseFloat($input.data("max") || Infinity);
        var previousQty = parseFloat($input.val() || 0, 10);
        var quantity = ($link.has(".fa-minus").length ? -1 : 1) + previousQty;
        var newQty = quantity > min ? (quantity < max ? quantity : max) : min;
        if (newQty !== previousQty) {
            $input.val(newQty).trigger('change');
            var $parent = $input.closest('.js_product');
            $parent.find('.o_bulk_price_btn').removeClass('active');
            $parent.find(`.o_bulk_price_btn[qty="${newQty}"]`).addClass('active');
        }
        return false;
    },
});

