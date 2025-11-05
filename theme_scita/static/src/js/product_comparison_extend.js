/** @odoo-module **/

import publicWidget from '@web/legacy/js/public/public_widget';
import { rpc } from '@web/core/network/rpc';
import { _t } from '@web/core/l10n/translation';
import comparisonUtils from '@website_sale_comparison/js/website_sale_comparison_utils';
import wSaleUtils from '@website_sale/js/website_sale_utils';

publicWidget.registry.ComparePopupNotification = publicWidget.Widget.extend({
    selector: '#wrapwrap',
    events: {
        'click a[data-action="scita_comparelist"]': '_onAddToCompare',
        'click .compare_link': '_onCompareIconClick',
    },

    /**
     * @override
     */
    start: function () {
        // Update count immediately
        this._updateCompareCount();
        
        setTimeout(() => {
            this._updateCompareCount();
        }, 100);
        
        setTimeout(() => {
            this._updateCompareCount();
        }, 300);
        
        setTimeout(() => {
            this._updateCompareCount();
        }, 800);
        
        // Listen for window load event
        if (document.readyState === 'loading') {
            window.addEventListener('load', () => {
                this._updateCompareCount();
            });
        }
        
        // Listen for storage changes (when compare list is updated in other tabs or by Odoo's comparison widget)
        this._onStorageChange = this._onStorageChange.bind(this);
        window.addEventListener('storage', this._onStorageChange);
        
        // Listen for custom compare count update events
        this._onCompareCountEvent = this._onCompareCountEvent.bind(this);
        document.addEventListener('compareCountUpdated', this._onCompareCountEvent);
        
        // Setup a polling interval as final backup (every 2 seconds)
        this._pollInterval = setInterval(() => {
            const currentCount = comparisonUtils.getComparisonProductIds().length;
            const badgeCount = parseInt(document.querySelector('.compare_quantity')?.getAttribute('data-compare-count') || '0');
            if (currentCount !== badgeCount) {
                this._updateCompareCount();
            }
        }, 2000);
        
        return this._super.apply(this, arguments);
    },

    /**
     * @override
     */
    destroy: function () {
        if (this._pollInterval) {
            clearInterval(this._pollInterval);
        }
        window.removeEventListener('storage', this._onStorageChange);
        document.removeEventListener('compareCountUpdated', this._onCompareCountEvent);
        return this._super.apply(this, arguments);
    },

    // =============== Event Handlers ===============
    _onStorageChange(event) {
        // Update count when localStorage changes (e.g., from another tab or Odoo's widget)
        if (event.key === 'product_comparison_ids' || event.key === null) {
            this._updateCompareCount();
        }
    },

    _onCompareCountEvent(event) {
        // Handle custom event - no need to update again as it's already updated
        console.log('Compare count updated:', event.detail);
    },

    // =============== Main Add-to-Compare Logic ===============
    async _onAddToCompare(ev) {
        ev.preventDefault();
        const el = ev.currentTarget;

        // check max 4 products
        if (this._checkMaxComparisonProducts()) return;

        let productId = parseInt(el.dataset.productProductId);
        const templateId = parseInt(el.dataset.productTemplateId);

        if (!productId && templateId) {
            try {
                const form = el.closest('form') || document.querySelector('form[action^="/shop/cart/update"]');
                productId = await rpc('/sale/create_product_variant', {
                    product_template_id: templateId,
                    product_template_attribute_value_ids: wSaleUtils.getSelectedAttributeValues(form),
                });
            } catch (error) {
                console.error('Error creating variant:', error);
                return;
            }
        }

        if (!productId) return;

        const currentIds = comparisonUtils.getComparisonProductIds();

        // If already in list
        if (currentIds.includes(productId)) {
            this._showNotification(_t('This product is already in your comparison list.'), 'warning');
            return;
        }

        // Add product
        comparisonUtils.addComparisonProduct(productId);
        comparisonUtils.updateDisabled(el, true);
        el.querySelector('span')?.classList.add('text-primary');

        // Update compare count in header (with small delay to ensure localStorage is updated)
        setTimeout(() => {
            this._updateCompareCount();
        }, 50);

        // Success notification
        this._showNotification(_t('Product added to your comparison list.'), 'success');
    },

    // =============== Validation ===============
    _checkMaxComparisonProducts() {
        if (comparisonUtils.getComparisonProductIds().length >= comparisonUtils.MAX_COMPARISON_PRODUCTS) {
            this._showNotification(_t('You can compare up to 4 products only.'), 'warning');
            return true;
        }
        return false;
    },

    // =============== Notification Popup ===============
    _showNotification(message, type = 'info') {
        // Remove existing popup if open
        document.querySelector('.o_compare_popup_overlay')?.remove();

        const comparisonIds = comparisonUtils.getComparisonProductIds();
        const compareUrl = comparisonIds.length
            ? `/shop/compare?products=${encodeURIComponent(comparisonIds.join(','))}`
            : '/shop/compare';

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'o_compare_popup_overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(0, 0, 0, 0.4);
            display: flex; align-items: center; justify-content: center;
            z-index: 20000;
        `;

        // Popup box
        const popup = document.createElement('div');
        popup.className = 'o_compare_popup card shadow-lg';
        popup.style.cssText = `
            width: 400px; background: #fff; border-radius: 10px; overflow: hidden;
            animation: fadeIn 0.3s ease-out;
        `;

        const headerColor =
            type === 'success'
                ? '#28a745'
                : type === 'warning'
                ? '#ffc107'
                : '#0d6efd';

        popup.innerHTML = `
            <div style="position:relative; background:${headerColor}; color:white; padding:16px 20px; font-weight:600; font-size:16px; text-align:center; border-radius:10px 10px 0 0;" class="compare_popup_header">
                ${_t('Product Comparison')}
                <button class="btn-close-popup" style="position:absolute; top:8px; right:8px; background:none; border:none; color:white; font-size:20px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; border-radius:4px; transition:background 0.2s;" 
                        onmouseover="this.style.background='rgba(255,255,255,0.2)'" 
                        onmouseout="this.style.background='none'">
                    ×
                </button>
            </div>
            <div style="padding:24px 20px; background:#fff;">
                <p style="margin:0 0 20px 0; color:#333; font-size:15px; line-height:1.6;">
                    ${message} ${_t('Check your compare list.')}
                </p>
                <div style="display:flex; justify-content:flex-end; align-items:center; gap:12px;">
                    <a href="${compareUrl}" class="btn-view compare_btn" style="
                        background:#6f42c1; 
                        color:white; 
                        padding:10px 24px; 
                        border-radius:6px; 
                        text-decoration:none; 
                        font-weight:500; 
                        font-size:14px;
                        transition:background 0.3s;
                        display:inline-block;
                    " onmouseover="this.style.background='#5a32a3'" onmouseout="this.style.background='#6f42c1'">
                        ${_t('View')}
                    </a>
                </div>
            </div>
            <div class="timer-bar" style="
                height:4px; 
                background:${headerColor}; 
                width:100%; 
                transform-origin:left; 
                transform:scaleX(1);
                transition:transform 4s linear;
                border-radius:0 0 10px 10px;
            "></div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Animate timer bar
        requestAnimationFrame(() => {
            const bar = popup.querySelector('.timer-bar');
            bar.style.transform = 'scaleX(0)';
        });

        // Event handlers
        const closePopup = () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        };

        popup.querySelector('.btn-view').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = compareUrl;
        });

        popup.querySelector('.btn-close-popup').addEventListener('click', closePopup);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePopup();
        });

        // ESC key closes popup
        const escHandler = (ev) => {
            if (ev.key === 'Escape') {
                closePopup();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Auto close after 4 seconds
        setTimeout(() => {
            closePopup();
            document.removeEventListener('keydown', escHandler);
        }, 4000);
    },

    // =============== Update Compare Count in Header ===============
    _updateCompareCount() {
        // Force read from localStorage to get latest count
        let comparisonIds = comparisonUtils.getComparisonProductIds();
        
        // Double-check localStorage directly as backup
        if (!comparisonIds || comparisonIds.length === 0) {
            try {
                const stored = localStorage.getItem('product_comparison_ids');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed && Array.isArray(parsed)) {
                        comparisonIds = parsed;
                    }
                }
            } catch (e) {
                console.warn('Failed to read comparison IDs from localStorage:', e);
            }
        }
        
        const count = comparisonIds.length;
        const compareBadges = document.querySelectorAll('.compare_quantity');
                
        // Update all compare count badges
        compareBadges.forEach((badge, index) => {
            badge.textContent = count;
            badge.setAttribute('data-compare-count', count);
            if (count > 0) {
                badge.classList.remove('d-none', 'hidden');
                badge.style.display = 'flex';
                badge.style.visibility = 'visible';
                badge.style.opacity = '1';
            } else {
                badge.classList.add('d-none');
                badge.style.display = 'none';
            }
        });

        // Update compare link href with current product IDs
        const compareLinks = document.querySelectorAll('.ab-compare .compare_link, .ab-compare .redirect-compare-page, a.compare_link, a.redirect-compare-page');
        const compareUrl = count > 0
            ? `/shop/compare?products=${encodeURIComponent(comparisonIds.join(','))}`
            : '/shop/compare';
                
        compareLinks.forEach(link => {
            // Extra safety check: skip if link contains cart-related classes or hrefs
            if (!link.classList.contains('redirect-cart-page') && !link.href.includes('/shop/cart')) {
                link.setAttribute('href', compareUrl);
            }
        });

        // Trigger a custom event for other widgets to listen
        document.dispatchEvent(new CustomEvent('compareCountUpdated', { 
            detail: { count: count, ids: comparisonIds }
        }));
    },

    // =============== Handle Compare Icon Click ===============
    _onCompareIconClick(ev) {
        const comparisonIds = comparisonUtils.getComparisonProductIds();
        if (comparisonIds.length > 0) {
            // Let the link handle the navigation with products parameter
            return;
        } else {
            // No products to compare, prevent navigation and show message
            ev.preventDefault();
            this._showNotification(_t('Your comparison list is empty. Please add products to compare.'), 'info');
        }
    },

});

// Widget to update compare count when products are removed from comparison page
publicWidget.registry.CompareCountUpdate = publicWidget.Widget.extend({
    selector: '.o_product_comparison_table',
    events: {
        'click .o_comparelist_remove': '_onRemoveProduct',
    },
    
    /**
     * @override
     */
    start: function () {
        this._updateCompareCount();
        
        // Create MutationObserver to watch for DOM changes (when products are removed)
        this._setupMutationObserver();
        
        return this._super.apply(this, arguments);
    },

    /**
     * @override
     */
    destroy: function () {
        if (this._observer) {
            this._observer.disconnect();
        }
        return this._super.apply(this, arguments);
    },

    _setupMutationObserver() {
        // Watch for changes in the comparison table
        this._observer = new MutationObserver(() => {
            this._updateCompareCount();
        });
        
        if (this.el) {
            this._observer.observe(this.el, {
                childList: true,
                subtree: true,
            });
        }
    },

    _onRemoveProduct(ev) {
        // Wait for removal to complete then update count
        setTimeout(() => {
            this._updateCompareCount();
        }, 200);
    },

    _updateCompareCount() {
        // Force read from localStorage to get latest count
        let comparisonIds = comparisonUtils.getComparisonProductIds();
        
        // Double-check localStorage directly as backup
        if (!comparisonIds || comparisonIds.length === 0) {
            try {
                const stored = localStorage.getItem('product_comparison_ids');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed && Array.isArray(parsed)) {
                        comparisonIds = parsed;
                    }
                }
            } catch (e) {
                console.warn('[CompareCountUpdate] Failed to read comparison IDs:', e);
            }
        }
        
        const count = comparisonIds.length;
        const compareBadges = document.querySelectorAll('.compare_quantity');
                
        compareBadges.forEach((badge, index) => {
            badge.textContent = count;
            badge.setAttribute('data-compare-count', count);
            if (count > 0) {
                badge.classList.remove('d-none', 'hidden');
                badge.style.display = 'flex';
                badge.style.visibility = 'visible';
                badge.style.opacity = '1';
            } else {
                badge.classList.add('d-none');
                badge.style.display = 'none';
            }
        });

        // Update compare link href
        const compareLinks = document.querySelectorAll('.ab-compare .compare_link, .ab-compare .redirect-compare-page, a.compare_link, a.redirect-compare-page');
        const compareUrl = count > 0
            ? `/shop/compare?products=${encodeURIComponent(comparisonIds.join(','))}`
            : '/shop/compare';
        
        compareLinks.forEach(link => {
            // Extra safety check: skip if link contains cart-related classes or hrefs
            if (!link.classList.contains('redirect-cart-page') && !link.href.includes('/shop/cart')) {
                link.setAttribute('href', compareUrl);
            }
        });
    },
});