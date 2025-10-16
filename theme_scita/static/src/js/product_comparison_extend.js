/** @odoo-module **/

import publicWidget from '@web/legacy/js/public/public_widget';
import { rpc } from '@web/core/network/rpc';
import { _t } from '@web/core/l10n/translation';
import comparisonUtils from '@website_sale_comparison/js/website_sale_comparison_utils';
import wSaleUtils from '@website_sale/js/website_sale_utils';
import { EventBus } from '@odoo/owl';
import {
    ProductComparisonBottomBar
} from '@website_sale_comparison/js/product_comparison_bottom_bar/product_comparison_bottom_bar';

publicWidget.registry.ThemeCompareFix = publicWidget.Widget.extend({
    selector: '#wrapwrap',
    events: {
        'click a[data-action="o_comparelist"]': '_onAddToCompare',
    },
    setup() {
        this.bus = new EventBus();
        // Mount the ProductComparisonBottomBar on pages with comparison functionality
        this.mountComponent(
            this.el,
            ProductComparisonBottomBar,
            {
                bus: this.bus,
            },
        );
    },
    async _onAddToCompare(ev) {
        console.log(this);
        
        ev.preventDefault();
        const el = ev.currentTarget;

        if (this._checkMaxComparisonProducts()) return;

        let productId = parseInt(el.dataset.productProductId);
        const templateId = parseInt(el.dataset.productTemplateId);

        if (!productId && templateId) {
            try {
                productId = await rpc('/sale/create_product_variant', {
                    product_template_id: templateId,
                    product_template_attribute_value_ids: wSaleUtils.getSelectedAttributeValues(form),
                });
            } catch (error) {
                console.error('❌ Error creating variant:', error);
                return;
            }
        }

        if (!productId) return;

        if (comparisonUtils.getComparisonProductIds().includes(productId)) {
            // Use Odoo 19 notification
            this.services.notification.add(
                _t('This product is already in your comparison list.'),
                { type: 'warning' }
            );
            return;
        }

        try {
            comparisonUtils.addComparisonProduct(productId);
            comparisonUtils.updateDisabled(el, true);
            el.querySelector('span')?.classList.add('text-primary');

            // Use Odoo 19 notification
            // ✅ Use safe notification in publicWidget
            if (window?.odoo?.notification) {
                odoo.notification.add(_t('Product added to your comparison list.'), { type: 'success' });
            } else {
                console.log('[Compare] success: Product added to your comparison list.');
            }
        } catch (err) {
            console.error('❌ Compare add failed:', err);
        }
    },

    _checkMaxComparisonProducts() {
        if (comparisonUtils.getComparisonProductIds().length >= comparisonUtils.MAX_COMPARISON_PRODUCTS) {
            this.displayNotification({
                title: _t('Too many products'),
                message: _t('You can compare up to 4 products only.'),
                type: 'warning',
            });
            return true;
        }
        return false;
    },

});
