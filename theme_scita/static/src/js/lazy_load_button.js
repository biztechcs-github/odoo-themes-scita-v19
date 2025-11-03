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
        this.loaded_product_ids = new Set();
        this.total_count = null; // Will be set from first API response
        // Track already loaded product IDs to prevent duplicates
        this.product_grid?.querySelectorAll('.oe_product').forEach((productEl) => {
            const productId = this._extractProductId(productEl);
            if (productId) {
                this.loaded_product_ids.add(productId);
            }
        });
    },

    start: function () {
        this._super.apply(this, arguments);
        // Check if we need to show the button based on initial load
        const loadButton = document.querySelector('.s_ajax_load_btn');
        if (loadButton) {
            if (this.product_count < this.ppg) {
                // If initial products are less than ppg, no more products to load
                loadButton.classList.add('d-none');
            } else {
                loadButton.classList.remove('d-none');
            }
        }
    },

    _extractProductId: function (productEl) {
        // Try multiple methods to extract product ID
        // Method 1: data-product-id attribute
        let productId = productEl.querySelector('[data-product-id]')?.getAttribute('data-product-id');
        if (productId) return productId;
        
        // Method 2: Extract from product link href
        const productLink = productEl.querySelector('a[href*="/product/"], a[href*="/shop/product/"]');
        if (productLink) {
            const href = productLink.getAttribute('href') || productLink.href;
            // Try to match product ID from URL patterns like /product/123 or /product/product-name-123
            const match = href.match(/(?:product|shop\/product)[\/-](\d+)/);
            if (match && match[1]) {
                return match[1];
            }
            // Also check for form action with product ID
            const form = productEl.closest('form') || productEl.querySelector('form');
            if (form && form.action) {
                const formMatch = form.action.match(/product[\/-](\d+)/);
                if (formMatch && formMatch[1]) {
                    return formMatch[1];
                }
            }
        }
        
        // Method 3: Check form data-product attributes
        const form = productEl.querySelector('form.oe_product_cart');
        if (form) {
            productId = form.getAttribute('data-product-id') || 
                       form.getAttribute('data-product-template-id');
            if (productId) return productId;
        }
        
        return null;
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
                const loadButton = document.querySelector('.s_ajax_load_btn');
                let newProductsAdded = 0;
                
                // Store total count from first response
                if (data.total_count !== undefined) {
                    this.total_count = data.total_count;
                }
                
                for (let node of new_product_grid.querySelectorAll('.oe_product')) {
                    // Check for duplicate products by product ID
                    const productId = this._extractProductId(node);
                    
                    // Only add if not already loaded
                    if (!productId || !this.loaded_product_ids.has(productId)) {
                        this.product_grid.appendChild(node);
                        if (productId) {
                            this.loaded_product_ids.add(productId);
                        }
                        newProductsAdded++;
                    }
                }
                
                // Update product count
                this.product_count = this.product_grid.querySelectorAll('.oe_product').length;
                
                // Hide button if:
                // 1. No new products were added (all were duplicates)
                // 2. Returned count is less than ppg (last page)
                // 3. Total count is known and we've loaded all products
                const shouldHide = newProductsAdded === 0 || 
                    data.count < this.ppg || 
                    (this.total_count !== null && this.product_count >= this.total_count);
                
                if (shouldHide && loadButton) {
                    loadButton.classList.add('d-none');
                }
            }
        });
    },
});
