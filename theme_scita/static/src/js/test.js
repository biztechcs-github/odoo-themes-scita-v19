/** @odoo-module **/

import { ProductRow as OriginalProductRow } from '@website_sale_comparison/js/product_row/product_row';
import { registry } from '@web/core/registry';
debugger;
const ProductRowWithQuote = OriginalProductRow => {
    return class extends OriginalProductRow {
        
        setup() {
            super.setup();
            // Initialize the new quote_request prop
            this.props.quote_request = this.props.quote_request || false;
        }
        
        /**
         * Example method to toggle quote request
         */
        toggleQuoteRequest() {
            this.props.quote_request = !this.props.quote_request;
        }

        /**
         * Example computed property
         */
        get quoteRequestText() {
            return this.props.quote_request ? "Quote Requested" : "Request Quote";
        }
    }
};

// Register the extended component
registry.category('components').add('website_sale_comparison.ProductRow', ProductRowWithQuote(OriginalProductRow), { override: true });
