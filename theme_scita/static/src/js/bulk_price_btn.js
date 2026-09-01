/** @odoo-module **/

import publicWidget from '@web/legacy/js/public/public_widget';
import { patch } from '@web/core/utils/patch';
import { WebsiteSale } from '@website_sale/interactions/website_sale';

/**
 * Quantity the bulk buttons have to price for.
 *
 * The "Select Quantity" website view is optional: when it is off there is no
 * input[name="add_qty"] on the page at all, so the quantity of the tier the
 * customer picked - kept on the .js_product element - is the only source left.
 *
 * @param {HTMLElement} product - the .js_product element
 * @returns {Number}
 */
function bulkQuantity(product) {
    const input = product?.querySelector('input[name="add_qty"]');
    if (input) {
        return parseInt(input.value) || 1;
    }
    return parseInt(product?.dataset.bulkActiveQty) || 1;
}

publicWidget.registry.BulkPriceButtonWidget = publicWidget.Widget.extend({
    selector: '.js_product',
    events: { 'click .o_bulk_price_btn': '_onBulkPriceClick' },

    _onBulkPriceClick: function (ev) {
        ev.preventDefault();
        const $btn = $(ev.currentTarget);
        const qty = parseInt($btn.attr('qty')) || 1;
        const price = parseFloat($btn.attr('price')) || 0;
        const el = $btn.closest('.js_product')[0];

        $(el).find('.o_bulk_price_btn').removeClass('active');
        $btn.addClass('active');

        // Store the selection: it is what _updateRootProduct adds to the cart
        // and, when the quantity input is not rendered, the only record of the
        // quantity the customer asked for.
        el.dataset.bulkActiveQty = qty;
        el.dataset.bulkActivePrice = price;

        // Immediate feedback; the combination info below confirms it with the
        // price the server computes for that quantity.
        const currencyVal = el.querySelector('.oe_price .oe_currency_value');
        if (currencyVal) {
            currencyVal.textContent = price.toFixed(2);
        }

        // Ask Odoo to reprice. Going through the quantity input keeps every
        // other listener (stock, tax toggle, ...) in step; without it, poke the
        // variant list directly. A native event is required: the interaction
        // listens with addEventListener, which jQuery's trigger does not reach.
        const qtyInput = el.querySelector('input[name="add_qty"]');
        if (qtyInput) {
            qtyInput.value = qty;
            qtyInput.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            el.querySelector('ul[data-attribute-exclusions]')
                ?.dispatchEvent(new Event('change', { bubbles: true }));
        }
    },
});

patch(WebsiteSale.prototype, {
    // Price the combination for the picked tier when the quantity input is not
    // on the page. The spread of this hook comes last in the RPC payload, so
    // add_qty here replaces the one read from the missing input.
    _getOptionalCombinationInfoParam(product) {
        const params = super._getOptionalCombinationInfoParam(...arguments);
        if (product && !product.querySelector('input[name="add_qty"]')) {
            const qty = parseInt(product.dataset.bulkActiveQty);
            if (qty) {
                params.add_qty = qty;
            }
        }
        return params;
    },

    // Add to cart the quantity of the picked tier. Needed for the same reason:
    // without the input, _updateRootProduct would fall back to 1 and the
    // customer would be charged the single-unit price.
    _updateRootProduct(form) {
        super._updateRootProduct(form);
        if (!form) return;
        const jsProduct = form.closest('.js_product') ?? form;
        if (!jsProduct) return;
        if (jsProduct.querySelector('input[name="add_qty"]')) return;
        const activeQty = parseInt(jsProduct.dataset.bulkActiveQty) || 0;
        if (activeQty >= 2) {
            this.rootProduct = { ...this.rootProduct, quantity: activeQty };
        }
    },

    _onChangeCombination(ev, parent, combination) {
        super._onChangeCombination(...arguments);

        const bulkSection = parent.querySelector('#o_bulk_price_section');
        if (!bulkSection) return;

        // Tiers of the variant the server just resolved, never of another one.
        const bulkPrices = combination.bulk_prices || [];
        const wrapper = bulkSection.querySelector('.o_bulk_price_wrapper');

        if (!bulkPrices.length || !wrapper) {
            bulkSection.classList.add('d-none');
            delete parent.dataset.bulkActiveQty;
            delete parent.dataset.bulkActivePrice;
            return;
        }

        bulkSection.classList.remove('d-none');

        // min_quantity is a threshold, so the tier in force is the highest one
        // the quantity has reached - the same one the server priced this
        // combination with, since Odoo orders pricelist items min_quantity desc
        // and stops at the first applicable rule. bulkPrices is sorted
        // ascending, so the last match is that tier.
        const qty = bulkQuantity(parent);
        const activeRule = bulkPrices.reduce(
            (best, rule) => (qty >= rule.min_quantity ? rule : best),
            null,
        );

        wrapper.innerHTML = bulkPrices.map(rule =>
            `<a class="btn btn-outline-primary o_bulk_price_btn${rule === activeRule ? ' active' : ''}"
                 qty="${rule.min_quantity}"
                 price="${rule.fixed_price}"
                 href="#">
                <span class="buy-tag">Buy ${rule.min_quantity}</span>
                at
                <span class="buy-price">${rule.fixed_price.toFixed(2)}</span>
                / Unit
            </a>`
        ).join('');

        if (activeRule) {
            parent.dataset.bulkActiveQty = qty;
            parent.dataset.bulkActivePrice = activeRule.fixed_price;
        } else {
            delete parent.dataset.bulkActivePrice;
        }
    },
});
