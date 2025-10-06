// // // // // /** @odoo-module **/

// // // // // import publicWidget from "@web/legacy/js/public/public_widget";
// // // // // import { rpc } from "@web/core/network/rpc";

// // // // // odoo.define("theme_scita.quick_view", [], function () {
// // // // //     "use strict";

// // // // //     publicWidget.registry.quickView = publicWidget.Widget.extend({
// // // // //         selector: "#wrapwrap",
// // // // //         events: {
// // // // //             "click .quick_view_sct_btn": "_onQuickViewClick",
// // // // //             "click .cart_view_sct_btn": "_onCartViewClick",
// // // // //             "mouseenter .css_attribute_color": "_onMouseEnterSwatch",
// // // // //             "click .css_attribute_color": "_onClickSwatch",
// // // // //             "change input[name='add_qty']": "_onQtyChange",
// // // // //             "click #add_to_cart, click a.js_add_cart_json": "_onAddToCart",
// // // // //         },

// // // // //         //----------------------------------------------------------------------
// // // // //         // Handlers
// // // // //         //----------------------------------------------------------------------

// // // // //         async _onQuickViewClick(ev) {
// // // // //             ev.preventDefault();
// // // // //             const productId = $(ev.currentTarget).data("id");

// // // // //             try {
// // // // //                 const data = await rpc("/theme_scita/shop/quick_view", { product_id: productId });
// // // // //                 const $modal = $("#shop_quick_view_modal");
// // // // //                 $modal.html(data).modal("show");
// // // // //                 $(".quick_cover").show();

// // // // //                 // Cleanup modal when closed
// // // // //                 $modal.off("hidden.bs.modal.quickview").on("hidden.bs.modal.quickview", () => {
// // // // //                     $modal.html("").off(".quickview");
// // // // //                 });
// // // // //             } catch (err) {
// // // // //                 console.error("Quick view RPC error", err);
// // // // //             }
// // // // //         },

// // // // //         async _onCartViewClick(ev) {
// // // // //             ev.preventDefault();
// // // // //             const productId = $(ev.currentTarget).data("id");

// // // // //             try {
// // // // //                 const data = await rpc("/theme_scita/shop/cart_view", { product_id: productId });
// // // // //                 $("#shop_cart_view_modal").html(data).modal("show");
// // // // //             } catch (err) {
// // // // //                 console.error("Cart view RPC error", err);
// // // // //             }
// // // // //         },

// // // // //         _onMouseEnterSwatch(ev) {
// // // // //             const $swatch = $(ev.currentTarget);
// // // // //             const previewSrc =
// // // // //                 $swatch.find("label").data("previewImgSrc") ||
// // // // //                 $swatch.find("img").attr("src");
// // // // //             const $product = $swatch.closest(".js_product");
// // // // //             const $img = $product.find("img").first();

// // // // //             if (previewSrc && $img.length) {
// // // // //                 $img.attr("src", previewSrc);
// // // // //             }

// // // // //             $product.find(".css_attribute_color").removeClass("active");
// // // // //             $swatch.addClass("active");
// // // // //         },

// // // // //         _onClickSwatch(ev) {
// // // // //             ev.preventDefault();
// // // // //             const $swatch = $(ev.currentTarget);
// // // // //             const $input = $swatch.find("input[type=radio], input[type=checkbox]");

// // // // //             if ($input.length) {
// // // // //                 $input.prop("checked", true).trigger("change");
// // // // //             }
// // // // //         },

// // // // //         _onQtyChange(ev) {
// // // // //             const qty = parseInt($(ev.currentTarget).val() || 1, 10);
// // // // //             if (qty < 1) {
// // // // //                 $(ev.currentTarget).val(1);
// // // // //             }
// // // // //         },

// // // // //         async _onAddToCart(ev) {
// // // // //             ev.preventDefault();
// // // // //             const $form = $(ev.currentTarget).closest("form");

// // // // //             if ($form.length) {
// // // // //                 $form.submit(); // default Odoo behavior
// // // // //                 return;
// // // // //             }

// // // // //             // Fallback: manual RPC if no form exists
// // // // //             const productId = $(ev.currentTarget).data("id");
// // // // //             const qty = parseInt($("input[name='add_qty']").val() || 1, 10);

// // // // //             try {
// // // // //                 const res = await rpc("/shop/cart/update", {
// // // // //                     product_id: productId,
// // // // //                     add_qty: qty,
// // // // //                 });
// // // // //                 console.log("Added to cart (quick view)", res);
// // // // //             } catch (err) {
// // // // //                 console.error("Add to cart failed", err);
// // // // //             }
// // // // //         },
// // // // //     });
// // // // // });

// // // // /** @odoo-module **/

// // // // import animation from "@website/js/content/snippets.animation";
// // // // import { rpc, RPCError } from '@web/core/network/rpc';
// // // // import { WebsiteSale } from '@website_sale/interactions/website_sale';
// // // // import wSaleUtils from "@website_sale/js/website_sale_utils";
// // // // import publicWidget from "@web/legacy/js/public/public_widget";


// // // // odoo.define('theme_scita.quick_view',[], function(require) {
// // // //     'use strict';

// // // //     // For quickview Start
// // // //     publicWidget.registry.quickView = publicWidget.Widget.extend({
// // // //         selector: "#wrapwrap",
// // // //         events: {
// // // //             'click .quick_view_sct_btn': 'quickViewData',
// // // //             'click .cart_view_sct_btn': 'cartViewData',
// // // //             "click .css_attribute_color": "_onMouseEnterSwatch",
// // // //             // "click .css_attribute_color": "_onMouseLeave",

// // // //         },
// // // //         quickViewData: function(ev) {
// // // //             var element = ev.currentTarget;
// // // //             var product_id = $(element).attr('data-id');
// // // //             this.wishlistProductIDs = JSON.parse(sessionStorage.getItem('website_sale_wishlist_product_ids') || '[]');
// // // //             rpc('/theme_scita/shop/quick_view',{'product_id':product_id}).then(function(data) {
// // // //                 var sale = new publicWidget.registry.WebsiteSale();

// // // //                     $("#shop_quick_view_modal").html(data);
// // // //                     $("#shop_quick_view_modal").modal('show');
// // // //                     var WebsiteSale = new publicWidget.registry.WebsiteSale();
// // // //                     var ProductWishlist = new publicWidget.registry.ProductWishlist();
// // // //                     WebsiteSale.init();
// // // //                     ProductWishlist.init();
// // // //                     var combination = [];
// // // //                     $(".quick_cover").css("display", "block");
// // // //                     $("[data-attribute_exclusions]").on("change", function(ev) {
// // // //                         WebsiteSale.onChangeVariant(ev);
// // // //                     });
// // // //                     $("a.js_add_cart_json").on("click", function(ev) {
// // // //                         WebsiteSale._onClickAddCartJSON(ev);
// // // //                     });
// // // //                     $("a#add_to_cart").on("click", function(ev) {
// // // //                         $(this).closest('form').submit();
// // // //                     });


// // // //                     $("button.o_add_wishlist_dyn").on("click",function(ev){
// // // //                         this.wishlistProductIDs = JSON.parse(sessionStorage.getItem('website_sale_wishlist_product_ids') || '[]');
// // // //                         ProductWishlist._onClickAddWish(ev);
// // // //                         ProductWishlist._onChangeVariant(ev);
// // // //                     });


// // // //                     $(document).on('change', 'input[name="add_qty"]', function(ev){
// // // //                         WebsiteSale._onChangeAddQuantity(ev);
// // // //                     });
// // // //                     $( ".list-inline-item .css_attribute_color" ).change(function(ev) {
// // // //                         var $parent = $(ev.target).closest('.js_product');
// // // //                         $parent.find('.css_attribute_color').removeClass("active");
// // // //                         $parent.find('.css_attribute_color').filter(':has(input:checked)').addClass("active");
// // // //                     });
// // // //                 return document.querySelector("#product_detail_main").dataset.image_layout;
// // // //             });
// // // //         },
// // // //         _onMouseEnterSwatch: function (ev) {
// // // //             const $swatch = $(ev.currentTarget);
// // // //             const $product = $swatch.closest('#product_detail');
// // // //             const $img = $product.find('img').first();      
// // // //             console.log("Swatch mouse enter event triggered", $swatch, $img);
// // // //             console.log($product,"<<<<<<<<<<<<<<<<<<< Product", );


// // // //             // this.image= $img;

// // // //             this.defaultSrc = $img.attr('data-default-img-src');      
// // // //             console.log("Default image source:", this.defaultSrc);
// // // //             const previewSrc = $swatch.find('label').data('previewImgSrc');
// // // //             console.log("Preview image source:", previewSrc);

// // // //             // if (previewSrc) {
// // // //             //     this._updateImgSrc(previewSrc, $img);
// // // //             //     $swatch.addClass("active");
// // // //             // }
// // // //         },

// // // //         // _onMouseLeave: function () {
// // // //         //      this._updateImgSrc(this.defaultSrc,this.image);
// // // //         // },

// // // //         // _updateImgSrc: function (src, $img) {        
// // // //         //     if ($img && src) {
// // // //         //         $img.attr('src', src);
// // // //         //     } else {
// // // //         //         console.warn("Image element or source is missing.");
// // // //         //     }
// // // //         // },
// // // //         cartViewData: function(ev) {
// // // //             var element = ev.currentTarget;
// // // //             var product_id = $(element).attr('data-id');
// // // //             rpc('/theme_scita/shop/cart_view',{'product_id':product_id}).then(function(data) {
// // // //                 $("#shop_cart_view_modal").html(data);
// // // //                 $("#shop_cart_view_modal").modal('show');
// // // //             });
// // // //         },
// // // //     });
// // // // });;

// // // /** @odoo-module **/

// // // import publicWidget from "@web/legacy/js/public/public_widget";
// // // import { rpc } from "@web/core/network/rpc";

// // // odoo.define("theme_scita.quick_view", [], function () {
// // //     "use strict";

// // //     publicWidget.registry.quickView = publicWidget.Widget.extend({
// // //         selector: "#wrapwrap",
// // //         events: {
// // //             "click .quick_view_sct_btn": "_onQuickViewClick",
// // //             "click .cart_view_sct_btn": "_onCartViewClick",
// // //             "mouseenter .css_attribute_color": "_onMouseEnterSwatch",
// // //             "click .css_attribute_color": "_onClickSwatch",
// // //             "change input[name='add_qty']": "_onQtyChange",
// // //             "click #add_to_cart, click a.js_add_cart_json ": "_onAddToCart",
// // //         },

// // //         //----------------------------------------------------------------------
// // //         // Handlers
// // //         //----------------------------------------------------------------------

// // //         async _onQuickViewClick(ev) {
// // //             ev.preventDefault();
// // //             const productId = $(ev.currentTarget).data("id");

// // //             try {
// // //                 const data = await rpc("/theme_scita/shop/quick_view", { product_id: productId });
// // //                 const $modal = $("#shop_quick_view_modal");
// // //                 $modal.html(data).modal("show");
// // //                 $(".quick_cover").show();

// // //                 // Cleanup modal when closed
// // //                 $modal.off("hidden.bs.modal.quickview").on("hidden.bs.modal.quickview", () => {
// // //                     $modal.html("").off(".quickview");
// // //                 });
// // //             } catch (err) {
// // //                 console.error("Quick view RPC error", err);
// // //             }
// // //         },

// // //         async _onCartViewClick(ev) {
// // //             ev.preventDefault();
// // //             const productId = $(ev.currentTarget).data("id");

// // //             try {
// // //                 const data = await rpc("/theme_scita/shop/cart_view", { product_id: productId });
// // //                 $("#shop_cart_view_modal").html(data).modal("show");
// // //             } catch (err) {
// // //                 console.error("Cart view RPC error", err);
// // //             }
// // //         },

// // //         _onMouseEnterSwatch(ev) {
// // //             const $swatch = $(ev.currentTarget);
// // //             const previewSrc =
// // //                 $swatch.find("label").data("previewImgSrc") ||
// // //                 $swatch.find("img").attr("src");
// // //             const $product = $swatch.closest(".js_product");
// // //             const $img = $product.find("img").first();

// // //             if (previewSrc && $img.length) {
// // //                 $img.attr("src", previewSrc);
// // //             }

// // //             $product.find(".css_attribute_color").removeClass("active");
// // //             $swatch.addClass("active");
// // //         },

// // //         _onClickSwatch(ev) {
// // //             ev.preventDefault();
// // //             const $swatch = $(ev.currentTarget);
// // //             const $input = $swatch.find("input[type=radio], input[type=checkbox]");

// // //             if ($input.length) {
// // //                 $input.prop("checked", true).trigger("change");
// // //             }
// // //         },

// // //         _onQtyChange(ev) {
// // //             const qty = parseInt($(ev.currentTarget).val() || 1, 10);
// // //             if (qty < 1) {
// // //                 $(ev.currentTarget).val(1);
// // //             }
// // //         },
// // //         async _onAddToCart(ev) {
// // //             ev.preventDefault();
// // //             const $form = $(ev.currentTarget).closest("form");

// // //             if ($form.length) {
// // //                 // ✅ Normal Odoo flow – let the form handle it
// // //                 $form.submit();
// // //                 return;
// // //             }

// // //             // Fallback: manual ajax post
// // //             const productId = $(ev.currentTarget).data("id");
// // //             const qty = parseInt($("input[name='add_qty']").val() || 1, 10);

// // //             try {
// // //                 const res = await rpc("/shop/cart/update", {
// // //                     product_id: productId,
// // //                     quantity: qty,   // ⚠️ use add_qty, not "quantity"
// // //                 });
// // //                 console.log("Added to cart (quick view)", res);

// // //                 // ✅ Reload cart snippet after update
// // //                 $(document).trigger("cart_updated", [res]);
// // //             } catch (err) {
// // //                 console.error("Add to cart failed", err);
// // //             }
// // //         }

// // //     });
// // // });

// // /** @odoo-module **/

// // import { Interaction } from '@web/public/interaction';
// // import { registry } from '@web/core/registry';
// // import { rpc } from '@web/core/network/rpc';
// // import { WebsiteSale } from '@website_sale/interactions/website_sale';
// // import VariantMixin from "@website_sale/js/variant_mixin";

// // export class QuickView extends Interaction {
// //     static selector = "#wrapwrap";

// //     dynamicContent = {
// //         ".quick_view_sct_btn": { "t-on-click": this.quickViewData },
// //         ".cart_view_sct_btn": { "t-on-click": this.cartViewData },
// //         ".css_attribute_color": { "t-on-click": this.onClickSwatch },
// //     };

// //     setup() {
// //         super.setup(); // ✅ FIX: init env + services
// //         this.wishlistProductIDs = JSON.parse(
// //             sessionStorage.getItem("website_sale_wishlist_product_ids") || "[]"
// //         );
// //     }

// //     async quickViewData(ev) {
// //         const productId = ev.currentTarget.dataset.id;
// //         const data = await rpc("/theme_scita/shop/quick_view", { product_id: productId });

// //         const modal = document.querySelector("#shop_quick_view_modal");
// //         modal.innerHTML = data;

// //         const myModal = new Modal(modal);
// //         myModal.show();

// //         // Init WebsiteSale after modal is loaded
// //         const websiteSale = new WebsiteSale();
// //         Object.assign(websiteSale, VariantMixin);
// //         websiteSale.init?.();

// //         // Quantity events
// //         modal.querySelectorAll('input[name="add_qty"]').forEach(input => {
// //             input.addEventListener("change", (ev) => websiteSale.onChangeAddQuantity(ev));
// //         });

// //         modal.querySelectorAll("a.js_add_cart_json").forEach(btn => {
// //             btn.addEventListener("click", (ev) => websiteSale.onChangeQuantity(ev));
// //         });

// //         modal.querySelectorAll("a#add_to_cart").forEach(btn => {
// //             btn.addEventListener("click", (ev) => {
// //                 ev.preventDefault();
// //                 btn.closest("form").submit();
// //             });
// //         });
// //     }

// //     async cartViewData(ev) {
// //         const productId = ev.currentTarget.dataset.id;
// //         const data = await rpc("/theme_scita/shop/cart_view", { product_id: productId });
// //         const modal = document.querySelector("#shop_cart_view_modal");
// //         modal.innerHTML = data;

// //         const myModal = new Modal(modal);
// //         myModal.show();
// //     }

// //     onClickSwatch(ev) {
// //         const swatch = ev.currentTarget;
// //         const product = swatch.closest("#product_detail");
// //         const img = product.querySelector("img");
// //         const previewSrc = swatch.querySelector("label")?.dataset.previewImgSrc;

// //         if (img && previewSrc) {
// //             img.src = previewSrc;
// //             product.querySelectorAll(".css_attribute_color").forEach(el => {
// //                 el.classList.remove("active");
// //             });
// //             swatch.classList.add("active");
// //         }
// //     }
// // }

// // registry.category("public.interactions").add("theme_scita.quick_view", QuickView);
// /** @odoo-module **/

// import { Interaction } from "@web/public/interaction";
// import { registry } from "@web/core/registry";
// import { rpc } from "@web/core/network/rpc";

// export class QuickView extends Interaction {
//     static selector = "#wrapwrap";

//     dynamicContent = {
//         ".quick_view_sct_btn": { "t-on-click": this.quickViewData },
//         ".cart_view_sct_btn": { "t-on-click": this.cartViewData },
//         ".css_attribute_color": { "t-on-click": this.onClickSwatch },
//     };

//     setup() {
//         super.setup();
//         this.cart = this.env.services.cart;   // ✅ new way
//     }

//     async quickViewData(ev) {
//         const productId = ev.currentTarget.dataset.id;
//         const data = await rpc("/theme_scita/shop/quick_view", { product_id: productId });

//         const modal = document.querySelector("#shop_quick_view_modal");
//         modal.innerHTML = data;

//         const myModal = new Modal(modal);
//         myModal.show();

//         // Quantity input
//         modal.querySelectorAll('input[name="add_qty"]').forEach(input => {
//             input.addEventListener("change", (ev) => {
//                 const qty = parseFloat(ev.target.value || 1);
//                 this.cart.update(productId, { quantity: qty });
//             });
//         });

//         // Add to cart
//         modal.querySelectorAll("a.js_add_cart_json").forEach(btn => {
//             btn.addEventListener("click", (ev) => {
//                 ev.preventDefault();
//                 this.cart.add(productId, { quantity: 1 });
//             });
//         });

//         modal.querySelectorAll("a#add_to_cart").forEach(btn => {
//             btn.addEventListener("click", (ev) => {
//                 ev.preventDefault();
//                 btn.closest("form").submit();
//             });
//         });
//     }

//     async cartViewData(ev) {
//         const productId = ev.currentTarget.dataset.id;
//         const data = await rpc("/theme_scita/shop/cart_view", { product_id: productId });
//         const modal = document.querySelector("#shop_cart_view_modal");
//         modal.innerHTML = data;

//         const myModal = new Modal(modal);
//         myModal.show();
//     }

//     onClickSwatch(ev) {
//         const swatch = ev.currentTarget;
//         const product = swatch.closest("#product_detail");
//         const img = product.querySelector("img");
//         const previewSrc = swatch.querySelector("label")?.dataset.previewImgSrc;

//         if (img && previewSrc) {
//             img.src = previewSrc;
//             product.querySelectorAll(".css_attribute_color").forEach(el => {
//                 el.classList.remove("active");
//             });
//             swatch.classList.add("active");
//         }
//     }
// }

// registry.category("public.interactions").add("theme_scita.quick_view", QuickView);
/** @odoo-module **/
/** @odoo-module **/

import { rpc } from '@web/core/network/rpc';
import wSaleUtils from "@website_sale/js/website_sale_utils";
import publicWidget from '@web/legacy/js/public/public_widget';
import wishlistUtils from '@website_sale_wishlist/js/website_sale_wishlist_utils';
import { redirect } from '@web/core/utils/urls';

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
            // Add to Cart (Ajax, no refresh)
            //------------------------------------------------------------------
            // $("#shop_quick_view_modal").off("click", "a.js_add_cart_json, #add_to_cart")
            //     .on("click", "a.js_add_cart_json, #add_to_cart", async function(ev) {
            //         ev.preventDefault();

            //         const form = wSaleUtils.getClosestProductForm(ev.currentTarget);
            //         const product_id = parseInt(form.querySelector("input[name=product_id]").value);
            //         const quantity = parseFloat(form.querySelector("input[name=add_qty]")?.value || 1);

            //         try {
            //             const response = await rpc("/custom/cart/add_or_update", {
            //                 product_id: product_id,
            //                 quantity: quantity
            //             });

            //             if (response.error) {
            //                 console.error("❌ Cart error:", response.error);
            //                 return;
            //             }

            //             console.log("✅ Cart line_id:", response.line_id);
            //             console.log("🛒 Updated cart:", response.cart);

            //             const params = {
            //                 product_id,
            //                 quantity,
            //                 line_id: response.line_id,
            //             };
            //             console.log("🔍 Updating cart with params:", params);

            //             const data =  await rpc("/shop/cart/update", params);
            //             console.log(data);

            //             // Update cart navbar
            //             await wSaleUtils.updateCartNavBar(data);  
            //         } catch (err) {
            //             console.error("❌ RPC call failed:", err);
            //         }
            //     });
            $("#shop_quick_view_modal").off("click", "a.js_add_cart_json, #add_to_cart")
            .on("click", "#add_to_cart", async function (ev) {
                ev.preventDefault();

                const form = wSaleUtils.getClosestProductForm(ev.currentTarget);
                const product_id = parseInt(form.querySelector("input[name=product_id]").value);
                // const quantityInput = form.querySelector("input[name=add_qty]");
                // const quantity = parseFloat(quantityInput?.value || 1);

                let quantity = parseFloat(form.querySelector("input[name=add_qty]")?.value || 1);
                    if (ev.currentTarget.classList.contains('fa-plus') || ev.currentTarget.id === 'add_to_cart') {
                        quantity = 1;  // increment
                    } else if (ev.currentTarget.classList.contains('fa-minus')) {
                        quantity = -1; // decrement
                    }
                try {
                    // Step 1: Add or update cart line via custom controller
                    const response = await rpc("/custom/cart/add_or_update", {
                        product_id: product_id,
                        quantity: quantity
                    });

                    if (response.error) {
                        console.error("❌ Cart error:", response.error);
                        return;
                    }

                    const line_id = response.line_id;
                    const qty = response.quantity;
                    console.log("✅ Cart line_id:", line_id);

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

                    console.log("✅ Product added to cart:", data);

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
        });
    },

        //----------------------------------------------------------------------
        // Color Swatch Preview
        //----------------------------------------------------------------------
        _onMouseEnterSwatch: function (ev) {
            const $swatch = $(ev.currentTarget);
            const $product = $swatch.closest('#product_detail');
            const $img = $product.find('img').first();
            this.defaultSrc = $img.attr('data-default-img-src');
            const previewSrc = $swatch.find('label').data('previewImgSrc');
            if (previewSrc) {
                $img.attr('src', previewSrc);
                $swatch.addClass("active");
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
});


// import { Interaction } from '@web/public/interaction';
// import { registry } from '@web/core/registry';
// import { rpc } from '@web/core/network/rpc';
// import wSaleUtils from '@website_sale/js/website_sale_utils';
// import VariantMixin from '@website_sale/js/variant_mixin';

// export class QuickView extends Interaction {
//     static selector = "#wrapwrap";

//     dynamicContent = {
//         ".quick_view_sct_btn": { "t-on-click": this.quickViewData },
//         ".cart_view_sct_btn": { "t-on-click": this.cartViewData },
//         ".css_attribute_color": { "t-on-click": this.onClickSwatch },
//         "a.js_add_cart_json": { "t-on-click": this.onClickAdd },
//         ".o_add_qty, .o_remove_qty": { "t-on-click": this.onChangeQuantity },
//         "input[name='add_qty']": { "t-on-change": this.onChangeAddQuantity },
//     };

//     setup() {
//         super.setup();
//         this.cart = this.env.services.cart; // Odoo 19 cart service
//     }

//     // ------------------------------
//     // Add to cart
//     // ------------------------------
//     async onClickAdd(ev) {
//         const el = ev.currentTarget;
//         const form = this._getClosestProductForm(el);
//         debugger;
//         if (form?.querySelector(".js_add_cart_variants")?.children?.length) {
//             await this.waitFor(this._getCombinationInfo(ev));
//             if (!ev.target.closest(".js_product")?.classList.contains("css_not_available")) {
//                 return this._addToCart(el);
//             }
//         } else {
//             return this._addToCart(el);
//         }
//     }

//     async _addToCart(el) {
//         const form = this._getClosestProductForm(el);

//         // fallback if form is missing (e.g., quick view modal)
//         if (!form && !el.dataset.productId) {
//             console.warn("No product form or data-product-id found for add to cart button", el);
//             return;
//         }

//         const isBuyNow = el.classList.contains("o_we_buy_now");
//         const isConfigured = el.parentElement?.id === "add_to_cart_wrap";
//         const showQuantity = Boolean(el.dataset.showQuantity);

//         // Use _updateRootProduct to prepare the rootProduct object
//         if (form) {
//             this._updateRootProduct(form);
//         } else {
//             // fallback if form is missing, build minimal product object
//             this.rootProduct = {
//                 productId: parseInt(el.dataset.productId, 10),
//                 quantity: parseFloat(el.dataset.quantity || 1),
//             };
//         }

//         return this.cart.add(this.rootProduct, {
//             isBuyNow,
//             isConfigured,
//             showQuantity,
//         });
//     }

//     // ------------------------------
//     // Helpers
//     // ------------------------------
//     _getClosestProductForm(el) {
//         return el.closest("form.js_product");
//     }

//     _updateRootProduct(form) {
//         // Follows Odoo 19 WebsiteSale pattern
//         const productId = parseInt(form.querySelector('input[name="product_id"]')?.value);
//         const quantity = parseFloat(form.querySelector('input[name="add_qty"]')?.value || 1);
//         const productTemplateId = parseInt(form.querySelector('input[name="product_template_id"]')?.value);
//         const uomId = form.querySelector('input[name="product_uom_id"]')?.value;

//         const isCombo = form.querySelector('input[name="product_type"]')?.value === 'combo';
//         this.rootProduct = {
//             ...(productId ? { productId } : {}),
//             ...(productTemplateId ? { productTemplateId } : {}),
//             ...(quantity ? { quantity } : {}),
//             ...(uomId ? { uomId } : {}),
//             ptavs: this._getSelectedPTAV(form),
//             productCustomAttributeValues: this._getCustomPTAVValues(form),
//             noVariantAttributeValues: this._getSelectedNoVariantPTAV(form),
//             ...(isCombo ? { isCombo } : {}),
//         };
//     }

//     _getSelectedPTAV(form) {
//         const selected = form.querySelectorAll('input.js_variant_change:not(.no_variant):checked, select.js_variant_change:not(.no_variant)');
//         return Array.from(selected).map(el => parseInt(el.value));
//     }

//     _getCustomPTAVValues(form) {
//         const customEls = form.querySelectorAll('.variant_custom_value');
//         return Array.from(customEls).map(el => ({
//             custom_product_template_attribute_value_id: parseInt(el.dataset.customProductTemplateAttributeValueId),
//             custom_value: el.value,
//         }));
//     }

//     _getSelectedNoVariantPTAV(form) {
//         const selected = form.querySelectorAll('input.no_variant.js_variant_change:checked, select.no_variant.js_variant_change');
//         return Array.from(selected).map(el => parseInt(el.value));
//     }

//     // ------------------------------
//     // Quantity change
//     // ------------------------------
//     onChangeQuantity(ev) {
//         const input = ev.currentTarget.closest('.input-group').querySelector('input');
//         const min = parseFloat(input.dataset.min || 0);
//         const max = parseFloat(input.dataset.max || Infinity);
//         const previousQty = parseFloat(input.value || 0);
//         const quantity = (ev.currentTarget.name === "remove_one" ? -1 : 1) + previousQty;
//         const newQty = Math.min(Math.max(quantity, min), max);

//         if (newQty !== previousQty) {
//             input.value = newQty;
//             input.dispatchEvent(new Event("change", { bubbles: true }));
//         }
//     }

//     onChangeAddQuantity(ev) {
//         const form = this._getClosestProductForm(ev.currentTarget);
//         if (form) {
//             const productId = form.querySelector('input[name="product_id"]')?.value;
//             const qty = parseFloat(ev.currentTarget.value || 1);
//             if (qty > 0) this.cart.update(productId, { quantity: qty });
//         }
//     }

//     // ------------------------------
//     // Quick View Modal
//     // ------------------------------
//     async quickViewData(ev) {
//         const productId = ev.currentTarget.dataset.id;
//         const data = await rpc("/theme_scita/shop/quick_view", { product_id: productId });

//         const modal = document.querySelector("#shop_quick_view_modal");
//         modal.innerHTML = data;
//         const myModal = new Modal(modal);
//         myModal.show();
//     }

//     async cartViewData(ev) {
//         const productId = ev.currentTarget.dataset.id;
//         const data = await rpc("/theme_scita/shop/cart_view", { product_id: productId });

//         const modal = document.querySelector("#shop_cart_view_modal");
//         modal.innerHTML = data;
//         const myModal = new Modal(modal);
//         myModal.show();
//     }

//     onClickSwatch(ev) {
//         const swatch = ev.currentTarget;
//         const product = swatch.closest("#product_detail");
//         const img = product.querySelector("img");
//         const previewSrc = swatch.querySelector("label")?.dataset.previewImgSrc;

//         if (img && previewSrc) {
//             img.src = previewSrc;
//             product.querySelectorAll(".css_attribute_color").forEach(el => el.classList.remove("active"));
//             swatch.classList.add("active");
//         }
//     }
// }

// // Apply VariantMixin if needed
// Object.assign(QuickView.prototype, VariantMixin);

// registry.category("public.interactions").add("theme_scita.quick_view", QuickView);

