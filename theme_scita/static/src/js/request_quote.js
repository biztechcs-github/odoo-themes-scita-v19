/** @odoo-module **/

import publicWidget from '@web/legacy/js/public/public_widget';

publicWidget.registry.SetProductIdModal = publicWidget.Widget.extend({
    selector: '#wrapwrap',

    events: {
        'click .request_for_quote_button': '_onRequestQuoteClick',
    },

    _onRequestQuoteClick(ev) {
        ev.preventDefault();

        const $btn = $(ev.currentTarget);
        const productId = $btn.data('product-id');
        $('#cfp_pop_up').find('#product_id').val(productId);
    },
});
