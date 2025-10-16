/** @odoo-module **/

import { rpc } from '@web/core/network/rpc';
import wSaleUtils from "@website_sale/js/website_sale_utils";
import publicWidget from '@web/legacy/js/public/public_widget';
import wishlistUtils from '@website_sale_wishlist/js/website_sale_wishlist_utils';

odoo.define('theme_scita.quick_view', [], function (require) {
    'use strict';

    publicWidget.registry.quickView = publicWidget.Widget.extend({
        selector: "#wrapwrap",
        events: {
            'click .quick_view_sct_btn': 'quickViewData',
            'click .cart_view_sct_btn': 'cartViewData',
            "click .css_attribute_color": "_onMouseEnterSwatch",
        },


        //----------------------------------------------------------------------
        // Quick View Modal
        //----------------------------------------------------------------------
        quickViewData: function (ev) {
            const element = ev.currentTarget;
            const product_id = $(element).attr('data-id');
            async function updateCartNavBar(data) {
                sessionStorage.setItem('website_sale_cart_quantity', data.cart_quantity);

                // Update navbar quantity
                const cartQuantityElements = document.querySelectorAll('.my_cart_quantity');
                for (const cartQuantityElement of cartQuantityElements) {
                    if (data.cart_quantity === 0) {
                        cartQuantityElement.classList.add('d-none');
                    } else {
                        const cartIconElement = document.querySelector('li.o_wsale_my_cart');
                        if (cartIconElement) {
                            cartIconElement.classList.remove('d-none');
                        }
                        cartQuantityElement.classList.remove('d-none');
                        cartQuantityElement.classList.add('o_mycart_zoom_animation');
                        setTimeout(() => {
                            cartQuantityElement.textContent = data.cart_quantity;
                            cartQuantityElement.classList.remove('o_mycart_zoom_animation');
                        }, 300);
                    }
                }

                // Update cart lines if exists
                const cartLinesContainer = document.querySelector(".js_cart_lines");
                if (cartLinesContainer) {
                    $(cartLinesContainer).first().before(data['website_sale.cart_lines']).end().remove();
                }

                // Update total
                const cartTotal = document.querySelector("#cart_total");
                if (cartTotal) {
                    $(cartTotal).replaceWith(data['website_sale.total']);
                }

                // Adjust cart column if present
                const cartContainer = document.querySelector('.oe_cart');
                if (cartContainer) {
                    cartContainer.classList.toggle('col-lg-7', !!data.cart_quantity);
                }

                // Enable/disable main checkout button
                const mainButton = document.querySelector("a[name='website_sale_main_button']");
                if (mainButton) {
                    if (data.cart_ready) {
                        mainButton.classList.remove('disabled');
                    } else {
                        mainButton.classList.add('disabled');
                    }
                }
            }
            // Update cart lines if exists
            const cartLinesContainer = document.querySelector(".js_cart_lines");
            if (cartLinesContainer) {
                $(cartLinesContainer).first().before(data['website_sale.cart_lines']).end().remove();
            }

            // Update total
            const cartTotal = document.querySelector("#cart_total");
            if (cartTotal) {
                $(cartTotal).replaceWith(data['website_sale.total']);
            }

            // Adjust cart column if present
            const cartContainer = document.querySelector('.oe_cart');
            if (cartContainer) {
                cartContainer.classList.toggle('col-lg-7', !!data.cart_quantity);
            }

            // Enable/disable main checkout button
            const mainButton = document.querySelector("a[name='website_sale_main_button']");
            if (mainButton) {
                if (data.cart_ready) {
                    mainButton.classList.remove('disabled');
                } else {
                    mainButton.classList.add('disabled');
                }
            }


            rpc('/theme_scita/shop/quick_view', { product_id }).then((data) => {
                $("#shop_quick_view_modal").html(data).modal("show");

                $(".quick_cover").css("display", "block");

                //------------------------------------------------------------------
                // Quantity + / - Buttons in Quick View Modal
                //------------------------------------------------------------------
                $("#shop_quick_view_modal").off("click", ".js_quantity_plus, .js_quantity_minus")
                    .on("click", ".js_quantity_plus, .js_quantity_minus", function (ev) {
                        ev.preventDefault();
                        const $btn = $(ev.currentTarget);
                        const $input = $btn.closest('.js_main_product').find('input[name=\"add_qty\"]');
                        let currentQty = parseFloat($input.val()) || 1;

                        if ($btn.hasClass('js_quantity_plus')) {
                            currentQty += 1;
                        } else if ($btn.hasClass('js_quantity_minus') && currentQty > 1) {
                            currentQty -= 1;
                        }

                        $input.val(currentQty).trigger('change');
                    });



                $("#shop_quick_view_modal").off("click", "a.js_add_cart_json, #add_to_cart")
                    .on("click", "#add_to_cart", async function (ev) {
                        ev.preventDefault();

                        const form = wSaleUtils.getClosestProductForm(ev.currentTarget);
                        const product_id = parseInt(form.querySelector("input[name=product_id]").value);
                        const quantityInput = form.querySelector("input[name=add_qty]");
                        const quantity = parseFloat(quantityInput?.value || 1);

                        try {
                            // Step 1: Add or update cart line via custom controller
                            const response = await rpc("/custom/cart/add_or_update", {
                                product_id: product_id,
                                quantity: quantity
                            });

                            if (response.error) {
                                return;
                            }

                            const line_id = response.line_id;
                            const qty = response.quantity;

                            // Step 2: Update cart via official Odoo 19 cart update
                            const params = {
                                product_id: product_id,
                                quantity: qty,
                                line_id: line_id
                            };

                            const data = await rpc("/shop/cart/update", params);

                            // Step 3: Update cart navbar safely
                            // await updateCartNavBar(data);

                            // Optional: Update quantity input in modal
                            if (quantityInput) {
                                quantityInput.value = quantity;
                            }

                            // redirect('/shop/cart');
                            window.location.href = "/shop/cart";

                        } catch (err) {
                            console.error("❌ RPC call failed:", err);
                        }
                    });

                //------------------------------------------------------------------
                // Wishlist Button
                //------------------------------------------------------------------
                $("#shop_quick_view_modal").off("click", "button.o_add_wishlist_dyn")
                    .on("click", "button.o_add_wishlist_dyn", async function (ev) {
                        ev.preventDefault();
                        const el = ev.currentTarget;
                        const form = wSaleUtils.getClosestProductForm(el);
                        let productId = parseInt(el.dataset.productProductId);

                        if (!productId) {
                            productId = await rpc('/sale/create_product_variant', {
                                product_template_id: parseInt(el.dataset.productTemplateId),
                                product_template_attribute_value_ids: wSaleUtils.getSelectedAttributeValues(form),
                            });
                        }

                        if (!productId || wishlistUtils.getWishlistProductIds().includes(productId)) return;

                        await rpc('/shop/wishlist/add', { product_id: productId });
                        wishlistUtils.addWishlistProduct(productId);
                        wishlistUtils.updateWishlistNavBar();
                        wishlistUtils.updateDisabled(el, true);

                        wSaleUtils.animateClone(
                            $(document.querySelector('.o_wsale_my_wish')),
                            $(document.querySelector('#product_detail_main') ?? el.closest('.o_cart_product') ?? form),
                            25,
                            40
                        );
                    });

                //------------------------------------------------------------------
                // Quantity Change
                //------------------------------------------------------------------
                $("#shop_quick_view_modal").on("change", ".js_main_product input[name='add_qty']", function (ev) {
                    // Just trigger change, WebsiteSale listens inside page,
                    // but here we can refresh price explicitly if needed
                    $(ev.currentTarget).closest("form").trigger("change");
                });

                //------------------------------------------------------------------
                // Variant Change
                //------------------------------------------------------------------
                $("#shop_quick_view_modal").on("change", "[data-attribute_exclusions]", function (ev) {
                    $(ev.currentTarget).closest("form").trigger("change");
                });

                // Highlight active swatch
                $("#shop_quick_view_modal").on("change", ".list-inline-item .css_attribute_color", function (ev) {
                    const $parent = $(ev.target).closest('.js_product');
                    $parent.find('.css_attribute_color').removeClass("active");
                    $parent.find('.css_attribute_color').filter(':has(input:checked)').addClass("active");
                });
                $('#shop_quick_view_modal').find('span.attribute_value').each(function () {
                    const $span = $(this);
                    if ($span.closest('li[name="variant_attribute"]').length) {
                        $span.hide();
                    }
                });
            });
        },

           _onMouseEnterSwatch: async function (ev) {
            const $swatch = $(ev.currentTarget);
            const $product = $swatch.closest('.js_main_product, #product_detail');

            $product.find('.css_attribute_color').removeClass("active");
            $swatch.addClass("active");
            const combination = wSaleUtils.getSelectedAttributeValues($product[0]);
            // Fetch variant info from Odoo
            const combinationInfo = await rpc('/website_sale/get_combination_info', {
                product_template_id: parseInt($product.find('input[name="product_template_id"]').val()),
                product_id: parseInt($product.find('input[name="product_id"]').val()),
                combination: combination,
                add_qty: parseInt($product.find('input[name="add_qty"]').val()) || 1,
            });
            if (combinationInfo.product_id) {
                $product.find('input[name="product_id"]').val(combinationInfo.product_id);
                
            }
         
            if (combinationInfo.display_name) {
                $product.find('.product_detail_name').text(combinationInfo.display_name);
            }
            if (combinationInfo.price) {
                $product.find('.oe_price .oe_currency_value').text(combinationInfo.price);
            }
    },




        //----------------------------------------------------------------------
        // Cart View Modal
        //----------------------------------------------------------------------
        cartViewData: function (ev) {
            const element = ev.currentTarget;
            const product_id = $(element).attr('data-id');
            rpc('/theme_scita/shop/cart_view', { product_id }).then(function (data) {
                $("#shop_cart_view_modal").html(data).modal("show");
            });
        },
    });

     publicWidget.registry.RequestQuoteCompare = publicWidget.Widget.extend({
         selector: '#request_for_quote_button',
         events: {
             'click': '_onRequestQuoteClick',
            },
            
        _onRequestQuoteClick(ev) {
            ev.preventDefault();
            const $btn = $(ev.currentTarget);
            const productId = $btn.data('product_id');
            // Set this ID in the modal before it opens
            const $modal = $('#cfp_pop_up');
            $modal.find('#product_id').val(productId);
        },
    });
});
