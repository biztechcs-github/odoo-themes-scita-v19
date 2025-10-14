/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.LazyLoadButton = publicWidget.Widget.extend({
    selector: '.s_ajax_load_btn',

    events: {
        'click': '_onClickLazyLoad',
    },

    init: function () {
        this._super.apply(this, arguments);
        this.product_grid = document.querySelector('#o_wsale_products_grid');
        this.ppg = parseInt(this.product_grid?.getAttribute('data-ppg'));
        this.product_count = this.product_grid?.querySelectorAll('.oe_product').length;
        this.offset = 0;
    },

    start: function () {
        this._super.apply(this, arguments);
        if (this.ppg >= this.product_count) {
            document.querySelector('.s_ajax_load_btn').classList.remove('d-none');
        }
    },

    _onClickLazyLoad: function (ev) {
        this.offset += this.ppg;

        let category = $(".selected_filters .selected_category").attr("data-index") || 0;
        let attributes = $(".selected_filters .attributes .attrib_list").attr("data-list") || null;

        const url = new URL(window.location.href);
        const search = url.searchParams.get('search') || "";
        const order = url.searchParams.get('order') || "";
        const max_price = parseFloat(url.searchParams.get('max_price') || 0);
        const min_price = parseFloat(url.searchParams.get('min_price') || 0);

        rpc('/lazy/load', {
            search,
            ppg: this.ppg,
            offset: this.offset,
            category_selected: category,
            attributes,
            initialppg: this.ppg,
            order,
            min_price,
            max_price,
        }).then((data) => {
            if (data) {
                const new_product_grid = document.createElement('div');
                new_product_grid.innerHTML = data.data_grid;
                for (let node of new_product_grid.querySelectorAll('.oe_product')) {
                    this.product_grid.appendChild(node);
                }
                if (data.count < this.ppg) {
                    document.querySelector('.s_ajax_load_btn').classList.add('d-none');
                }
            }
        });
    },
});
