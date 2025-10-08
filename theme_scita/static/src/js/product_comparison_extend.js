// // /** @odoo-module **/

// // import publicWidget from '@web/legacy/js/public/public_widget';
// // import { rpc } from '@web/core/network/rpc';
// // import { _t } from '@web/core/l10n/translation';
// // import comparisonUtils from '@website_sale_comparison/js/website_sale_comparison_utils';
// // import wSaleUtils from '@website_sale/js/website_sale_utils';

// // publicWidget.registry.ThemeCompareFix = publicWidget.Widget.extend({
// //     selector: '#wrapwrap',
// //     events: {
// //         'click a[data-action="o_comparelist"]': '_onAddToCompare',
// //     },

// //     /**
// //      * Handle "Add to Compare" button click.
// //      */
// //     async _onAddToCompare(ev) {
// //         ev.preventDefault();
// //         const el = ev.currentTarget;

// //         if (this._checkMaxComparisonProducts()) return;

// //         let productId = parseInt(el.dataset.productProductId);
// //         const templateId = parseInt(el.dataset.productTemplateId);
// //         const form = wSaleUtils.getClosestProductForm(el);

// //         // If no variant ID, create one dynamically (for configurable products)
// //         if (!productId && templateId) {
// //             try {
// //                 productId = await rpc('/sale/create_product_variant', {
// //                     product_template_id: templateId,
// //                     product_template_attribute_value_ids: wSaleUtils.getSelectedAttributeValues(form),
// //                 });
// //             } catch (error) {
// //                 console.error('❌ Error creating variant:', error);
// //                 return;
// //             }
// //         }

// //         if (!productId) {
// //             console.warn('⚠️ Missing product ID for comparison.');
// //             return;
// //         }

// //         // Avoid duplicates
// //         if (comparisonUtils.getComparisonProductIds().includes(productId)) {
// //             this.displayNotification({
// //                 title: _t('Already Added'),
// //                 message: _t('This product is already in your comparison list.'),
// //                 type: 'warning',
// //             });
// //             return;
// //         }

// //         try {
// //             // Add product to comparison
// //             comparisonUtils.addComparisonProduct(productId);
// //             comparisonUtils.updateDisabled(el, true);

// //             // Visual feedback
// //             el.querySelector('span')?.classList.add('text-primary');

// //             this.displayNotification({
// //                 title: _t('Added to Comparison'),
// //                 message: _t('Product added to your comparison list.'),
// //                 type: 'success',
// //             });
// //         } catch (err) {
// //             console.error('❌ Compare add failed:', err);
// //         }
// //     },

// //     /**
// //      * Prevent exceeding the comparison limit.
// //      */
// //     _checkMaxComparisonProducts() {
// //         if (
// //             comparisonUtils.getComparisonProductIds().length >=
// //             comparisonUtils.MAX_COMPARISON_PRODUCTS
// //         ) {
// //             this.displayNotification({
// //                 title: _t('Too many products'),
// //                 message: _t('You can compare up to 4 products only.'),
// //                 type: 'warning',
// //             });
// //             return true;
// //         }
// //         return false;
// //     },
// // });

// /** @odoo-module **/

// import publicWidget from '@web/legacy/js/public/public_widget';
// import { rpc } from '@web/core/network/rpc';
// import { _t } from '@web/core/l10n/translation';
// import { EventBus, mount } from '@odoo/owl';
// import comparisonUtils from '@website_sale_comparison/js/website_sale_comparison_utils';
// import wSaleUtils from '@website_sale/js/website_sale_utils';
// import { ProductComparisonBottomBar } from '@website_sale_comparison/js/product_comparison_bottom_bar/product_comparison_bottom_bar';

// publicWidget.registry.ThemeCompareFix = publicWidget.Widget.extend({
//     selector: '#wrapwrap',
//     events: {
//         'click a[data-action="o_comparelist"]': '_onAddToCompare',
//     },

//     start() {
//         this.bus = new EventBus();
//         this._bottomBarMounted = false;
//         return this._super(...arguments);
//     },

//     /**
//      * Handle "Add to Compare" button click.
//      */
//     async _onAddToCompare(ev) {
//         ev.preventDefault();
//         const el = ev.currentTarget;

//         if (this._checkMaxComparisonProducts()) return;

//         let productId = parseInt(el.dataset.productProductId);
//         const templateId = parseInt(el.dataset.productTemplateId);
//         const form = wSaleUtils.getClosestProductForm(el);

//         // Create variant if needed
//         if (!productId && templateId) {
//             try {
//                 productId = await rpc('/sale/create_product_variant', {
//                     product_template_id: templateId,
//                     product_template_attribute_value_ids: wSaleUtils.getSelectedAttributeValues(form),
//                 });
//             } catch (error) {
//                 console.error('❌ Error creating variant:', error);
//                 return;
//             }
//         }

//         if (!productId) return;

//         // Avoid duplicates
//         if (comparisonUtils.getComparisonProductIds().includes(productId)) {
//             this._notify('warning', _t('This product is already in your comparison list.'));
//             return;
//         }

//         // Mount sticky bar if not yet mounted
//         await this._mountBottomBarSafe();

//         // Add product to comparison
//         comparisonUtils.addComparisonProduct(productId, this.bus);
//         comparisonUtils.updateDisabled(el, true);
//         el.querySelector('span')?.classList.add('text-primary');

//         // Open sticky bar
//         this.bus.trigger('comparison_bar:open');

//         // Notify user
//         this._notify('success', _t('Product added to comparison list.'));
//     },

//     /**
//      * Mount sticky bottom bar safely
//      */
//     async _mountBottomBarSafe() {
//         if (this._bottomBarMounted) return;

//         // Wait until OWL template is ready
//         const waitForTemplate = async () => {
//             while (!window.owl || !window.owl.templates?.['website_sale_comparison.ProductComparisonBottomBar']) {
//                 await new Promise(resolve => setTimeout(resolve, 50));
//             }
//         };
//         await waitForTemplate();

//         const target = document.createElement('div');
//         document.body.appendChild(target);

//         mount(ProductComparisonBottomBar, {
//             target,
//             props: { bus: this.bus },
//         });

//         this._bottomBarMounted = true;
//     },

//     /**
//      * Check max comparison limit
//      */
//     _checkMaxComparisonProducts() {
//         if (comparisonUtils.getComparisonProductIds().length >= comparisonUtils.MAX_COMPARISON_PRODUCTS) {
//             this._notify('warning', _t('You can compare up to 4 products only.'));
//             return true;
//         }
//         return false;
//     },

//     /**
//      * Notification helper
//      */
//     _notify(type, message) {
//         if (window?.odoo?.notification) {
//             odoo.notification.add(_t(message), { type });
//         } else {
//             console.log(`[Compare] ${type}: ${message}`);
//         }
//     },
// });


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

    // _checkMaxComparisonProducts() {
    //     if (
    //         comparisonUtils.getComparisonProductIds().length >=
    //         comparisonUtils.MAX_COMPARISON_PRODUCTS
    //     ) {
    //         // Use Odoo 19 notification
    //        this.services.notification.add(
    //             _t("You can compare up to 4 products at a time."),
    //             {
    //                 type: 'warning',
    //                 sticky: false,
    //                 title: _t("Too many products to compare"),
    //             },
    //         );
    //         return true;
    //     }
    //     return false;
    // },
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
