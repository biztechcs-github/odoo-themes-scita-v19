/** @odoo-module **/

import publicWidget from '@web/legacy/js/public/public_widget';
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

