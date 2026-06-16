/** @odoo-module **/

import publicWidget from '@web/legacy/js/public/public_widget';
import { patch } from '@web/core/utils/patch';
import { WebsiteSale } from '@website_sale/interactions/website_sale';

publicWidget.registry.BulkPriceButtonWidget = publicWidget.Widget.extend({
    selector: '.js_product',
    events: { 'click .o_bulk_price_btn': '_onBulkPriceClick' },

    _onBulkPriceClick: function (ev) {
        ev.preventDefault();
        $(".o_bulk_price_btn").removeClass("active");
        const $btn = $(ev.currentTarget).addClass("active");
        const qty = parseInt($btn.attr('qty')) || 1;
        const price = parseFloat($btn.attr('price')) || 0;
        const $parent = $btn.closest('.js_product');
        const el = $parent[0];

        // Store the active bulk selection so _onChangeCombination can restore it
        el.dataset.bulkActiveQty = qty;
        el.dataset.bulkActivePrice = price;

        // Set qty input
        const $qtyInput = $parent.find('input[name="add_qty"]');
        $qtyInput.val(qty);

        // Immediately update price display (preserve .oe_currency_value DOM structure)
        const currencyVal = el.querySelector('.oe_price .oe_currency_value');
        if (currencyVal) {
            currencyVal.textContent = price.toFixed(2);
        }

        // Trigger Odoo's _getCombinationInfo so the dialog also gets the correct price.
        // The server-side controller overrides combination.price with the bulk price,
        // so _onChangeCombination will confirm the correct price.
        $qtyInput.trigger('change');
        const variantEl = el.querySelector('ul[data-attribute-exclusions]');
        if (variantEl) {
            variantEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
    },
});

patch(WebsiteSale.prototype, {
    // Inject the bulk quantity into rootProduct so the configurator dialog
    // receives the correct qty and our server-side fix can apply the bulk price.
    // Without this, input[name="add_qty"] may not exist on the page, causing
    // quantity to default to 1 and the dialog to show the regular price.
    _updateRootProduct(form) {
        super._updateRootProduct(form);
        if (!form) return;
        const jsProduct = form.closest('.js_product') ?? form;
        if (!jsProduct) return;
        const activeQty = parseInt(jsProduct.dataset.bulkActiveQty) || 0;
        if (activeQty >= 2) {
            this.rootProduct = { ...this.rootProduct, quantity: activeQty };
        }
    },

    _onChangeCombination(ev, parent, combination) {
        super._onChangeCombination(...arguments);

        const bulkSection = parent.querySelector('#o_bulk_price_section');
        if (!bulkSection) return;

        const bulkPrices = combination.bulk_prices || [];
        const wrapper = bulkSection.querySelector('.o_bulk_price_wrapper');

        // Detect actual variant switch (product_id changed)
        const newProductId = combination.product_id;
        const prevProductId = parent.dataset.bulkLastProductId
            ? parseInt(parent.dataset.bulkLastProductId) : null;
        const variantChanged = prevProductId && newProductId && newProductId !== prevProductId;
        if (newProductId) {
            parent.dataset.bulkLastProductId = newProductId;
        }

        // On a real variant change, clear the stored bulk selection
        if (variantChanged) {
            delete parent.dataset.bulkActiveQty;
            delete parent.dataset.bulkActivePrice;
        }

        const activeQty = parseInt(parent.dataset.bulkActiveQty) || 0;
        const activePrice = parseFloat(parent.dataset.bulkActivePrice) || 0;

        if (!bulkPrices.length || !wrapper) {
            bulkSection.classList.add('d-none');
            return;
        }

        bulkSection.classList.remove('d-none');

        // Rebuild buttons, re-applying active class if same variant
        wrapper.innerHTML = bulkPrices.map(rule =>
            `<a class="btn btn-outline-primary o_bulk_price_btn${(!variantChanged && activeQty === rule.min_quantity) ? ' active' : ''}"
                 qty="${rule.min_quantity}"
                 price="${rule.fixed_price}"
                 href="#">
                <span class="buy-tag">Buy ${rule.min_quantity}</span>
                at
                <span class="buy-price">${rule.fixed_price.toFixed(2)}</span>
                / Unit
            </a>`
        ).join('');

        // Restore bulk price after super._onChangeCombination may have overwritten it.
        // (The server controller now also overrides combination.price, so this is a
        //  safety net in case the pricelist computation path differs.)
        if (!variantChanged && activeQty > 0 && activePrice > 0) {
            const currencyVal = parent.querySelector('.oe_price .oe_currency_value');
            if (currencyVal) {
                currencyVal.textContent = activePrice.toFixed(2);
            }
        }
    },
});
