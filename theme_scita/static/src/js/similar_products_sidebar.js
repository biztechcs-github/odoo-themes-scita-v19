/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.SimilarProductsSidebar = publicWidget.Widget.extend({
    selector: '#wrapwrap',
    events: {
        'click .btn-similar-products': '_onClickSimilarProducts',
    },

    _onClickSimilarProducts: async function (ev) {
        ev.preventDefault();
        const $btn = $(ev.currentTarget);
        const productID = parseInt($btn.data('product-id'));
        if (!productID || isNaN(productID)) return;

        $('#similar-product-sidebar').removeClass('o_hidden').addClass('active');
        $('body').addClass('sidebar-open');

        $('#similar-products-list').html('<p>Loading...</p>');

        try {
            const result = await rpc('/get_similar_products', { product_id: productID });
            let html = '';
            result.similar_products?.forEach(prod => {
                const currency = result.currency;
                html += `
                    <div class="similar-product">
                        <img src="${prod.image_url}" alt="${prod.name}"/>
                        <div class="details">
                            <a href="${prod.product_url}">${prod.name}</a>
                            ${prod.description_ecommerce ? `<div class="desc">${prod.description_ecommerce}</div>` : ''}
                            ${prod.sku && prod.sku !== 'false' ? `<div class="sku"><b>SKU: </b>: ${prod.sku}</div>` : ''}
                            <div class="rating_count">⭐ ${prod.rating_count} | ${prod.rating_avg}</div>
                            <div class="price">
                                <span class="oe_price">${formatCurrency(prod.price, currency)}</span>
                                ${
                                    prod.compare_price && prod.compare_price > prod.price
                                        ? `<del class="text-muted ms-1 h5 oe_compare_list_price">
                                                <bdi dir="inherit">${formatCurrency(prod.compare_price, currency)}</bdi>
                                        </del>`
                                        : ''
                                }
                            </div>
                        </div>
                    </div>
                `;

            });

            $('#similar-products-list').html(html || '<p>No similar products found.</p>');
        } catch (e) {
            $('#similar-products-list').html('<p>Error loading similar products.</p>');
        }
    }
});

$(document).on('click', '#close-similar-sidebar', function (e) {
    e.preventDefault();
    closeSidebar();
});

$(document).on('click', function (e) {
    const $sidebar = $('#similar-product-sidebar');
    const isSidebar = $sidebar.hasClass('active');
    const isInside = $(e.target).closest('#similar-product-sidebar, .btn-similar-products').length;

    if (isSidebar && !isInside) {
        closeSidebar();
    }
});

function closeSidebar() {
    $('#similar-product-sidebar').removeClass('active').addClass('o_hidden');
    $('body').removeClass('sidebar-open');
}

function formatCurrency(amount, currency) {
    amount = parseFloat(amount).toFixed(currency.decimal_places || 2);
    return currency.position === 'before'
        ? `${currency.symbol}${amount}`
        : `${amount}${currency.symbol}`;
}


