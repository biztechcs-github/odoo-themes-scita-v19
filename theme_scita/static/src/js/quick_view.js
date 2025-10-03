// /** @odoo-module **/

// import animation from "@website/js/content/snippets.animation";
// import { rpc, RPCError } from '@web/core/network/rpc';
// import { WebsiteSale } from '@website_sale/interactions/website_sale';
// import wSaleUtils from "@website_sale/js/website_sale_utils";
// import publicWidget from "@web/legacy/js/public/public_widget";
// import VariantMixin from '@website_sale/js/variant_mixin';
// import { cartHandlerMixin } from '@website_sale/js/website_sale_utils';
// // import {extraMenuUpdateCallbacks} from "@website/js/content/menu";
// // import '@website_sale_wishlist/js/website_sale_wishlist';
// import { Interaction } from '@web/public/interaction';

// odoo.define('theme_scita.quick_view',[], function(require) {
//     'use strict';

// // For quickview Start
// publicWidget.registry.quickView = publicWidget.Widget.extend({
//     selector: "#wrapwrap",
//     events: {
//         'click .quick_view_sct_btn': 'quickViewData',
//         'click .cart_view_sct_btn': 'cartViewData',
//         "click .css_attribute_color": "_onMouseEnterSwatch",
//         // "click .css_attribute_color": "_onMouseLeave",
//     },
//     quickViewData: function(ev) {
//         var element = ev.currentTarget;
//         var product_id = $(element).attr('data-id');
//         this.wishlistProductIDs = JSON.parse(sessionStorage.getItem('website_sale_wishlist_product_ids') || '[]');
//         rpc('/theme_scita/shop/quick_view',{'product_id':product_id}).then(function(data) {
//             var WebsiteSale = publicWidget.registry.WebsiteSale;

//                     $("#shop_quick_view_modal").html(data);
//                     $("#shop_quick_view_modal").modal('show');
//                     var WebsiteSale =  publicWidget.registry.WebsiteSale;
//                     var ProductWishlist =  publicWidget.registry.ProductWishlist;
//                     // WebsiteSale.init();
//                     // ProductWishlist.init();
//                     var combination = [];
//                     $(".quick_cover").css("display", "block");
//                     $("[data-attribute_exclusions]").on("change", function(ev) {
//                         WebsiteSale.onChangeVariant(ev);
//                     });
//                     $("a.js_add_cart_json").on("click", function(ev) {
//                         console.log('aaaaaaaa')
//                         WebsiteSale._onChangeQuantity(ev);
//                     });
//                     $("#add_to_cart").on("click", function(ev) {
//                         $(this).closest('form').submit();
//                     });


//                    $("button.o_add_wishlist_dyn").on("click", function(ev){
//                         ev.preventDefault(); 
//                         const $btn = $(this);

//                         const wishlistWidget = publicWidget.registry.ProductWishlist;
//                         if (!wishlistWidget) {
//                             console.warn("ProductWishlist widget not found!");
//                             return;
//                         }
//                         wishlistWidget._addNewProducts($btn);
//                         wishlistWidget._onChangeVariant(ev);
//                     });


//                 $(document).on('change', 'input[name="add_qty"]', function(ev){
//                     websiteSaleInstance._onChangeAddQuantity(ev);
//                 });
//                 $( ".list-inline-item .css_attribute_color" ).change(function(ev) {
//                     var $parent = $(ev.target).closest('.js_product');
//                     $parent.find('.css_attribute_color').removeClass("active");
//                     $parent.find('.css_attribute_color').filter(':has(input:checked)').addClass("active");
//                 });
//             return document.querySelector("#product_detail_main").dataset.image_layout;
//         });
//     },
//     _onMouseEnterSwatch: function (ev) {
//         const $swatch = $(ev.currentTarget);
//         const $product = $swatch.closest('#product_detail');
//         const $img = $product.find('img').first();      
//         console.log("Swatch mouse enter event triggered", $swatch, $img);
//         console.log($product,"<<<<<<<<<<<<<<<<<<< Product", );
        
              
//         // this.image= $img;
    
//         this.defaultSrc = $img.attr('data-default-img-src');      
//         console.log("Default image source:", this.defaultSrc);
//         const previewSrc = $swatch.find('label').data('previewImgSrc');
//         console.log("Preview image source:", previewSrc);

//         // if (previewSrc) {
//         //     this._updateImgSrc(previewSrc, $img);
//         //     $swatch.addClass("active");
//         // }
//     },
    
//     // _onMouseLeave: function () {
//     //      this._updateImgSrc(this.defaultSrc,this.image);
//     // },
    
//     // _updateImgSrc: function (src, $img) {        
//     //     if ($img && src) {
//     //         $img.attr('src', src);
//     //     } else {
//     //         console.warn("Image element or source is missing.");
//     //     }
//     // },
//     cartViewData: function(ev) {
//         var element = ev.currentTarget;
//         var product_id = $(element).attr('data-id');
//         rpc('/theme_scita/shop/cart_view',{'product_id':product_id}).then(function(data) {
//             $("#shop_cart_view_modal").html(data);
//             $("#shop_cart_view_modal").modal('show');
//         });
//     },
// });
// });;
/** @odoo-module **/

// import animation from "@website/js/content/snippets.animation";
// import { rpc, RPCError } from '@web/core/network/rpc';
// import { WebsiteSale } from '@website_sale/interactions/website_sale';
// import wSaleUtils from "@website_sale/js/website_sale_utils";
// import publicWidget from "@web/legacy/js/public/public_widget";
// import VariantMixin from '@website_sale/js/variant_mixin';
// import { Interaction } from '@web/public/interaction';
// import wishlistUtils from '@website_sale_wishlist/js/website_sale_wishlist_utils';

// odoo.define('theme_scita.quick_view', [], function(require) {
//     'use strict';

//     publicWidget.registry.quickView = publicWidget.Widget.extend({
//         selector: "#wrapwrap",
//         events: {
//             'click .quick_view_sct_btn': 'quickViewData',
//             'click .cart_view_sct_btn': 'cartViewData',
//             "click .css_attribute_color": "_onMouseEnterSwatch",
//             // "click button.o_add_wishlist_dyn": "_onClickWishlistButton",
//         },

//         quickViewData: function(ev) {
//             const self = this;
//             const element = ev.currentTarget;
//             const product_id = $(element).attr('data-id');

//             rpc('/theme_scita/shop/quick_view', {'product_id': product_id}).then(function(data) {
//                 $("#shop_quick_view_modal").html(data);
//                 $("#shop_quick_view_modal").modal('show');

//                 const WebsiteSale = publicWidget.registry.WebsiteSale;

//                 $(".quick_cover").css("display", "block");

//                 // Variant change events
//                 $("[data-attribute_exclusions]").on("change", function(ev) {
//                     WebsiteSale.onChangeVariant(ev);
//                 });

//                 // Add to cart
//                 $("a.js_add_cart_json").on("click", function(ev) {
//                     WebsiteSale.onChangeQuantity(ev);
//                 });
//                 $("#add_to_cart").on("click", function(ev) {
//                     $(this).closest('form').submit();
//                 });

//                 // Wishlist button click
//                 $("button.o_add_wishlist_dyn").on("click", function(ev) {
//                     ev.preventDefault();
//                     const el = ev.currentTarget;
//                     const form = wSaleUtils.getClosestProductForm(el);
//                     let productId = parseInt(el.dataset.productProductId);

//                     // If variant not selected, create it
//                     const getVariant = async () => {
//                         if (!productId) {
//                             productId = await rpc('/sale/create_product_variant', {
//                                 product_template_id: parseInt(el.dataset.productTemplateId),
//                                 product_template_attribute_value_ids: wSaleUtils.getSelectedAttributeValues(form),
//                             });
//                         }
//                         return productId;
//                     };

//                     getVariant().then((pid) => {
//                         if (!pid || wishlistUtils.getWishlistProductIds().includes(pid)) return;

//                         rpc('/shop/wishlist/add', { product_id: pid }).then(() => {
//                             wishlistUtils.addWishlistProduct(pid);
//                             wishlistUtils.updateWishlistNavBar();
//                             wishlistUtils.updateDisabled(el, true);
//                             wSaleUtils.animateClone(
//                                 $(document.querySelector('.o_wsale_my_wish')),
//                                 $(document.querySelector('#product_detail_main') ?? el.closest('.o_cart_product') ?? form),
//                                 25,
//                                 40
//                             );
//                         });
//                     });
//                 });

//                 // Quantity change in quickview
//                 $(document).on('change', 'input[name="add_qty"]', function(ev){
//                     WebsiteSale._onChangeAddQuantity(ev);
//                 });

//                 // Color swatch selection
//                 $(".list-inline-item .css_attribute_color").change(function(ev) {
//                     const $parent = $(ev.target).closest('.js_product');
//                     $parent.find('.css_attribute_color').removeClass("active");
//                     $parent.find('.css_attribute_color').filter(':has(input:checked)').addClass("active");
//                 });
//             });

//             return document.querySelector("#product_detail_main")?.dataset.image_layout;
//         },

//         _onMouseEnterSwatch: function (ev) {
//             const $swatch = $(ev.currentTarget);
//             const $product = $swatch.closest('#product_detail');
//             const $img = $product.find('img').first();      

//             this.defaultSrc = $img.attr('data-default-img-src');      
//             const previewSrc = $swatch.find('label').data('previewImgSrc');
//         },

//         cartViewData: function(ev) {
//             const element = ev.currentTarget;
//             const product_id = $(element).attr('data-id');
//             rpc('/theme_scita/shop/cart_view', {'product_id': product_id}).then(function(data) {
//                 $("#shop_cart_view_modal").html(data);
//                 $("#shop_cart_view_modal").modal('show');
//             });
//         },
//     });
// });
/** @odoo-module **/

import animation from "@website/js/content/snippets.animation";
import { rpc } from '@web/core/network/rpc';
import wSaleUtils from "@website_sale/js/website_sale_utils";
import publicWidget from '@web/legacy/js/public/public_widget';
import wishlistUtils from '@website_sale_wishlist/js/website_sale_wishlist_utils';


odoo.define('theme_scita.quick_view', [], function(require) {
    'use strict';

    publicWidget.registry.quickView = publicWidget.Widget.extend({
        selector: "#wrapwrap",
        events: {
            'click .quick_view_sct_btn': 'quickViewData',
            'click .cart_view_sct_btn': 'cartViewData',
            "click .css_attribute_color": "_onMouseEnterSwatch",
        },
        
        quickViewData: function(ev) {
            const self = this;
            const element = ev.currentTarget;
            const product_id = $(element).attr('data-id');
            
            rpc('/theme_scita/shop/quick_view', {'product_id': product_id}).then(function(data) {
                $("#shop_quick_view_modal").html(data);
                $("#shop_quick_view_modal").modal('show');
                
                // const WebsiteSale = publicWidget.registry.WebsiteSale;
                
                $(".quick_cover").css("display", "block");
                const WebsiteSale = publicWidget.registry.WebsiteSale;
                // Variant change events
                $("[data-attribute_exclusions]").on("change", function(ev) {
                    WebsiteSale.onChangeVariant(ev);
                });
                
                // Add to cart buttons
                $("a.js_add_cart_json").on("click", function(ev) {
                    const $form = $(ev.currentTarget).closest('form')[0];
                    const websiteSaleInstance = registry.category('public.interactions')
                    .get('website_sale.website_sale')?.__instances?.find(inst => inst.el.contains($form));
                    if (websiteSaleInstance) {
                        websiteSaleInstance.onChangeQuantity(ev);
                    } else {
                        console.warn("WebsiteSale instance not found for quickview form.");
                    }
                });
                
                
                $("#add_to_cart").on("click", function(ev) {
                    $(this).closest('form').submit();
                });
                
                // Wishlist button click
                $("button.o_add_wishlist_dyn").on("click", async function(ev) {
                    ev.preventDefault();
                    const el = ev.currentTarget;
                    const form = wSaleUtils.getClosestProductForm(el);
                    let productId = parseInt(el.dataset.productProductId);

                    // If variant not selected, create it
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

                    // Animate product clone to wishlist icon
                    wSaleUtils.animateClone(
                        $(document.querySelector('.o_wsale_my_wish')),
                        $(document.querySelector('#product_detail_main') ?? el.closest('.o_cart_product') ?? form),
                        25,
                        40
                    );
                });

                // Quantity change in quickview
                $(document).on('change', '.js_main_product input[name="add_qty"]', function(ev){
                        WebsiteSale.onChangeAddQuantity(ev);
                    });

                // Color swatch selection
                $(".list-inline-item .css_attribute_color").change(function(ev) {
                    const $parent = $(ev.target).closest('.js_product');
                    $parent.find('.css_attribute_color').removeClass("active");
                    $parent.find('.css_attribute_color').filter(':has(input:checked)').addClass("active");
                });
            });

            return document.querySelector("#product_detail_main")?.dataset.image_layout;
        },

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

        cartViewData: function(ev) {
            const element = ev.currentTarget;
            const product_id = $(element).attr('data-id');
            rpc('/theme_scita/shop/cart_view', {'product_id': product_id}).then(function(data) {
                $("#shop_cart_view_modal").html(data);
                $("#shop_cart_view_modal").modal('show');
            });
        },
    });
});
