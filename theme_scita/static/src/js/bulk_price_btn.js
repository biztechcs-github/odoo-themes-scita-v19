/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { WebsiteSale } from '@website_sale/interactions/website_sale';
import VariantMixin from '@website_sale/js/variant_mixin';

    WebsiteSale.include({
        events: Object.assign({}, WebsiteSale.prototype.events || {}, {
        'click .o_bulk_price_btn': '_onBulkPriceClick',
    }),

    _onBulkPriceClick: function (ev) {
        ev.preventDefault();
        $(".o_bulk_price_btn").removeClass("active");
        const $btn = $(ev.currentTarget).addClass("active");
        const qty = parseInt($btn.attr('qty')) || 1;
        const $parent = $btn.closest('.js_product');
        const $qtyInput = $parent.find('input[name="add_qty"]');
        $qtyInput.val(qty).trigger('change');
        this._getCombinationInfo(ev);
    },

    _onChangeAddQuantity: function (ev) {
        const $input = $(ev.currentTarget);
        const newQty = parseFloat($input.val() || 0, 10);
        const $parent = $input.closest('.js_product');
        $parent.find('.o_bulk_price_btn').removeClass('active');
        $parent.find(`.o_bulk_price_btn[qty="${newQty}"]`).addClass('active');
        return this._super.apply(this, arguments);
    },

    onClickAddCartJSON: function (ev) {
        ev.preventDefault();
        const $link = $(ev.currentTarget);
        const $input = $link.closest('.input-group').find("input");
        const min = parseFloat($input.data("min") || 0);
        const max = parseFloat($input.data("max") || Infinity);
        const previousQty = parseFloat($input.val() || 0, 10);
        const quantity = ($link.has(".fa-minus").length ? -1 : 1) + previousQty;
        const newQty = quantity > min ? (quantity < max ? quantity : max) : min;

        if (newQty !== previousQty) {
            $input.val(newQty).trigger('change');
            const $parent = $input.closest('.js_product');
            $parent.find('.o_bulk_price_btn').removeClass('active');
            $parent.find(`.o_bulk_price_btn[qty="${newQty}"]`).addClass('active');
        }
        return false;
    },
});
