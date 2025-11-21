/** @odoo-module **/

// import animation from "@website/js/content/snippets.animation";
import { _t } from "@web/core/l10n/translation";
import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc, RPCError } from '@web/core/network/rpc';
import { browser } from '@web/core/browser/browser';

$(document).ready(function(){
    if($(".oe_website_sale").length === 0){
        $("div#wrap").addClass("oe_website_sale");
    }
    if($(".js_sale").length === 0){
        $("div#wrap").addClass("js_sale");
    }
    $('.how_it_work_v_5 .sct_content_div:first-child').addClass('open');
    $('.how_it_work_v_5 .sct_content_div').on("click",function() {
        $(this).removeClass('open'); // Close others
        $(this).addClass('open').siblings().removeClass("open"); // Open current
    });
   
});
    // Start
    publicWidget.registry.oe_cat_slider = publicWidget.Widget.extend({

        selector: ".oe_cat_slider",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has category-slider-section)
            var hasRenderedContent = self.$target.find('.category-slider-section, .sct-cs-box').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var slider_id = self.$target.attr('data-cat-slider-id');
                var cat_name = _t("Category Slider");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.find('.block-title h3, h3.fancy');
                if ($existingTitle.length) {
                    cat_name = $existingTitle.text().trim() || cat_name;
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="container">
                        <div class="block-title">
                            <h3 class="fancy">${cat_name}</h3>
                        </div>
                        <div class="category-slider-placeholder">
                            <img src="/theme_scita/static/src/img/cat_slide_4.png" alt="Category Slider" class="img-fluid"/>
                        </div>
                    </div>
                `);
                
                // Restore attributes
                if (slider_id) {
                    self.$target.attr('data-cat-slider-id', slider_id);
                }
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                var slider_id = self.$target.attr('data-cat-slider-id');
                rpc("/theme_scita/category_get_dynamic_slider", {
                    'slider-id': self.$target.attr('data-cat-slider-id') || '',
                }).then(function(data) {
                    if (data) {
                        self.$target.empty();
                        self.$target.append(data);
                        $(".oe_cat_slider").removeClass('o_hidden');
                    }
                });
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    // End

    // Image Hotspot start
    publicWidget.registry.oe_img_hotspot = publicWidget.Widget.extend({

        selector: ".oe_img_hotspot",
        disabledInEditableMode: false,
        start: function() {
            var self = this;
            if (this.editableMode) {
                var $cate_slider = $('#wrapwrap').find('#theme_scita_custom_image_hotspot');
                var cat_name = _t("Image Hotspot")
                $cate_slider.each(function(){

                    $(this).empty().append('<div class="container">\
                                                    <div class="block-title">\
                                                        <h3 class="fancy">' + cat_name + '</h3>\
                                                    </div>\
                                                </div>')
                });
            }
            if (!this.editableMode) {
                var slider_id = self.$target.attr('data-cat-slider-id');
                rpc("/theme_scita/get_image_hotspot", {
                    'slider-id': self.$target.attr('data-img-hotspot-id') || '',
                }).then(function(data) {
                    if (data) {
                        self.$target.empty();
                        self.$target.append(data);
                        $('[data-bs-toggle="popover"]').popover();
                        $(".oe_img_hotspot").removeClass('o_hidden');
                    }
                });
            }
        }
    });
    //End

    // Start
    publicWidget.registry.theme_scita_product_slider = publicWidget.Widget.extend({ 
        selector: ".oe_prod_slider",
        disabledInEditableMode: false,
        start: function() {
            var self = this;
            if (this.editableMode) {
                var $prod_slider = $('#wrapwrap').find('#theme_scita_custom_product_slider');
                var prod_name = _t("Products Slider")
                $prod_slider.each(function(){
                    $(this).empty().append('<div class="container">\
                                                    <div class="block-title">\
                                                        <h3 class="fancy">' + prod_name + '</h3>\
                                                    </div>\
                                                </div>')
                });
            }
            if (!this.editableMode) {
                var slider_id = self.$target.attr('data-prod-slider-id');
                rpc("/theme_scita/product_get_dynamic_slider",{
                    'slider-id': self.$target.attr('data-prod-slider-id') || '',
                }).then(function(data) {
                    if (data) {
                        self.$target.empty();
                        self.$target.append(data);
                        $(".oe_prod_slider").removeClass('o_hidden');
                        var sct_rtl = false;
                        if ($('#wrapwrap').hasClass('o_rtl')) {
                            sct_rtl = true;
                        }
                        rpc('/theme_scita/product_image_effect_config', {
                            'slider_id': slider_id
                        }).then(function(res) {
                            $('div#' + res.s_id).owlCarousel({
                                margin: 10,
                                responsiveClass: true,
                                items: res.counts,
                                loop: false,
                                rewind:true,
                                nav:true,
                                autoplay: res.auto_rotate,
                                autoplayTimeout:res.auto_play_time,
                                autoplayHoverPause:true,
                                rtl: sct_rtl,
                                responsive: {
                                    0: {
                                        items: 1,
                                    },
                                    420: {
                                        items: 2,
                                    },
                                    768: {
                                        items: 3,
                                    },
                                    1000: {
                                        items: res.counts,
                                    },
                                    1500: {
                                        items: res.counts,
                                    },
                                },
                            });
                            
                        });
                    }
                });
            }
        }
    });
    //End

    // Start
    publicWidget.registry.fashion_multi_cat_custom_snippet = publicWidget.Widget.extend({ 

        selector: ".fashion_multi_category_slider",
        disabledInEditableMode: false,
        events: {
            "mouseenter .scita_attribute_li": "_onMouseEnterSwatch",
            "mouseleave .css_attribute_color": "_onMouseLeave",
            "click .js_add_cart": "_onClickAddToCart",
            "click .js_add_cart_json": "_onClickUpdateQty",
            'click .cart_view_sct_btn': 'cartViewData',
        },
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has fashion product slider content)
            var hasRenderedContent = self.$target.find('.fashion_featured_product_1, .fashion_cro, .owl-carousel, .cs-product, .pwp-img, .lns-inner, .latest-news-section').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var slider_type = self.$target.attr('data-multi-cat-slider-type');
                var multi_cat_name = _t("Multi Product Slider");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.find('.title-block h2, .title-block h4, h2.section-title, h4.section-title, .section-title');
                if ($existingTitle.length) {
                    multi_cat_name = $existingTitle.text().trim() || multi_cat_name;
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="container">
                        <div class="row our-categories">
                            <div class="col-md-12">
                                <div class="title-block">
                                    <h4 id="snippet-title" class="section-title style1"><span>${multi_cat_name}</span></h4>
                                </div>
                                <div class="category-slider-placeholder">
                                    <img src="/theme_scita/static/src/img/feature-product.png" alt="Multi Product Slider" class="img-fluid"/>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                
                // Restore attributes
                if (slider_type) {
                    self.$target.attr('data-multi-cat-slider-type', slider_type);
                }
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                var slider_type = self.$target.attr('data-multi-cat-slider-type');
                rpc("/fashion/fashion_product_multi_get_dynamic_slider", {
                    'slider-type': self.$target.attr('data-multi-cat-slider-type') || '',
                }).then(function(data) {
                    if (data) {
                        self.$target.empty();
                        self.$target.append(data);
                        $(".fashion_multi_category_slider").removeClass('o_hidden');
                        var sct_rtl = false;
                        if ($('#wrapwrap').hasClass('o_rtl')) {
                            sct_rtl = true;
                        }
                        // var WebsiteSale = new publicWidget.registry.WebsiteSale();
                        // WebsiteSale.init();
                        rpc('/theme_scita/product_multi_image_effect_config', {
                            'slider_type': slider_type
                        }).then(function(res) {
                            $('div.fashion_featured_product_1 .fashion_cro ').owlCarousel({
                                loop:false,
                                rewind:true,
                                dots:false,
                                autoplay: false,
                                autoplayTimeout:res.auto_play_time,
                                autoplayHoverPause:true,
                                margin:0,
                                items: 5,
                                rtl: sct_rtl,
                                responsive: {
                                    0: {
                                        items: 1,
                                    },
                                    375: {
                                        items: 2,
                                        margin: 0
                                    },
                                    767: {
                                        items: 3,
                                    },
                                    1000: {
                                        items: 4,
                                    },
                                    1600: {
                                        items: 5,
                                    },
                                },
                            });
                        });
                       
                        $(document).on('click', '.dropdown-plus', function(ev){
                                ev.stopPropagation();
                                ev.stopImmediatePropagation();
                                $(ev.currentTarget).next().toggleClass("o_hidden")
                            });
                        
                        $(document).ajaxComplete(function() {
                            setTimeout(function(){
                                var divWidth = $('.fashion_featured_product_1 .cs-product .pwp-img a').width();
                                if (divWidth == 0) {
                                    divWidth = $('.retail_featured_product_1 .cs-product .pwp-img a:visible').width();
                                }
                                $('.fashion_featured_product_1 .cs-product .pwp-img a').height(divWidth);
                            },100);
                        });
                    }
                });
            }
        },
        cartViewData: function (ev) {
                const element = ev.currentTarget;
                const product_id = $(element).attr('data-id');
                rpc('/theme_scita/shop/cart_view', { product_id }).then(function (data) {
                    $("#shop_cart_view_modal").html(data).modal("show");
                });
            },
        
            // 🛒 ADD TO CART BUTTON (main "Add" button)
            _onClickAddToCart: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            
                const $btn = $(ev.currentTarget);
                const $cartWrapper = $btn.closest(".ajax_cart_template");
                const $qtyInput = $cartWrapper.find("input.quantity");
                
                const $productIDInput = $cartWrapper.find("input[name='product_id']");
                const productID = parseInt($productIDInput.val()); 
                const productTemplateID = parseInt($btn.data("templateId"));
                const addQuantity = parseInt($qtyInput.val()) || 1;
            
                const self = this;
                
                // Strategy: Use custom endpoint to get cart lines for this product
                rpc("/shop/cart/get_lines", {
                    product_id: productID
                }).then((cartLines) => {
                    // Check if product already exists in cart
                    const existingLine = cartLines.length > 0 ? cartLines[0] : null;
                    
                    if (existingLine) {
                        const newQuantity = existingLine.quantity + addQuantity;
                        
                        // Update existing line with new total quantity
                        return rpc("/shop/cart/update", {
                            line_id: existingLine.line_id,
                            product_id: productID,
                            quantity: newQuantity
                        });
                    } else {
                        // Product doesn't exist, add it
                        return rpc("/shop/cart/add", {
                            product_id: productID,
                            product_template_id: productTemplateID,
                            quantity: addQuantity,
                        });
                    }
                }).then((data) => {
                    if (data.cart_quantity) {
                        self._updateCartIcon(data.cart_quantity);
                    }
                    
                    if (data.notification_info) {
                        self._showCartNotification(self.call.bind(self), data.notification_info);
                    }
                    
                    if (data.quantity && data.tracking_info) {
                        self._trackProducts(data.tracking_info);
                    }
                    
                }).catch((err) => {
                    // Silent error handling
                });
            },

            
            _updateCartIcon: function (cartQuantity) {
                browser.sessionStorage.setItem('website_sale_cart_quantity', cartQuantity);
            
                // Update mobile and desktop cart quantities
                const cartQuantityElements = document.querySelectorAll('.my_cart_quantity, .o_wsale_my_cart_quantity');
                for (const cartQuantityElement of cartQuantityElements) {
                    if (cartQuantity === 0) {
                        cartQuantityElement.classList.add('d-none');
                    } else {
                        const cartIconElement = document.querySelector('li.o_wsale_my_cart');
                        if (cartIconElement) {
                            cartIconElement.classList.remove('d-none');
                        }
                        cartQuantityElement.classList.remove('d-none');
                        cartQuantityElement.classList.add('o_mycart_zoom_animation');
            
                        setTimeout(() => {
                            cartQuantityElement.textContent = cartQuantity;
                            cartQuantityElement.classList.remove('o_mycart_zoom_animation');
                        }, 300);
                    }
                }
            },

            _trackProducts(trackingInfo) {
                document.querySelector('.oe_website_sale').dispatchEvent(
                    new CustomEvent('add_to_cart_event', {'detail': trackingInfo})
                );
            },

            _onClickUpdateQty: function (ev) {
                ev.preventDefault();
                const $btn = $(ev.currentTarget);
                const $qtyInput = $btn.closest('.input-group').find('input.quantity');
            
                let qty = parseInt($qtyInput.val()) || 1;
                qty += $btn.attr('aria-label') === 'Remove one' ? -1 : 1;
            
                if (qty < 1) qty = 1;
                $qtyInput.val(qty).trigger('change');
            },

        _onMouseEnterSwatch: function (ev) {
            const $swatch = $(ev.currentTarget);
            const $product = $swatch.closest('.cs-product');
            const $img = $product.find('img').first();            
            this.image= $img;
        
            this.defaultSrc = $img.attr('data-default-img-src');
            const $element = $swatch.find('label, a.css_attribute_color').first();
            const previewSrc = $element.data('previewImgSrc');
            
            if (previewSrc) {
                this._updateImgSrc(previewSrc, $img);
                $swatch.addClass("active");
            }
        },
        
        _onMouseLeave: function () {
             this._updateImgSrc(this.defaultSrc,this.image);
        },
        
        _updateImgSrc: function (src, $img) {
            if ($img && src) {
                $img.attr('src', src);
            } else {
                console.warn("Image element or source is missing.");
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    //End

    // Start
    publicWidget.registry.brands_box_slider_4 = publicWidget.Widget.extend({ 
        selector: ".box_brand_slider",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has box_brand_snippet_4 or brand-logo-box)
            var hasRenderedContent = self.$target.find('.box_brand_snippet_4, .brand-logo-box, .sct-brand-slider-2').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var brand_type = self.$target.attr('data-brand-config-type');
                var brand_id = self.$target.attr('data-brand-config-id');
                var titleText = _t("Brands");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.find('.title-block h2, .section-title, h3.section-title');
                if ($existingTitle.length) {
                    titleText = $existingTitle.text().trim() || titleText;
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="container">
                        <div class="row our-brands">
                            <div class="col-md-12">
                                <h3 class="section-title style1" id="snippet-title">
                                    <span>${titleText}</span>
                                </h3>
                                <div class="category-slider-placeholder">
                                    <img src="/theme_scita/static/src/img/Brand2.png" alt="Category Slider" class="img-fluid"/>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                
                // Restore attributes
                if (brand_type) {
                    self.$target.attr('data-brand-config-type', brand_type);
                }
                if (brand_id) {
                    self.$target.attr('data-brand-config-id', brand_id);
                }
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                var slider_type = self.$target.attr('data-brand-config-type');
                rpc("/shop/get_box_brand_slider", {
                    'slider-type': slider_type || '',
                }).then(function(data) {
                    if (data) {
                        self.$target.empty().append(data);
                        var sct_rtl = false;
                        if ($('#wrapwrap').hasClass('o_rtl')) {
                            sct_rtl = true;
                        }
                        $(".box_brand_slider").removeClass('o_hidden');
                        $('.sct-brand-slider-2').owlCarousel({
                            margin: 10,
                            items:6,
                            loop:false,
                            autoplay:true,
                            rewind:true,
                            dots:false,
                            autoplayTimeout:5000,
                            autoplayHoverPause:true,
                            rtl: sct_rtl,
                            responsive: {
                                0: {
                                    items: 2
                                },
                                480: {
                                    items: 3
                                },
                                768: {
                                    items: 4
                                },
                                1024: {
                                    items: 6
                                },
                                1500: {
                                    items: 7
                                },
                            },
                        });
                    }
                });
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    //End

    // Start
    publicWidget.registry.it_prod_brands = publicWidget.Widget.extend({ 
        selector: ".it_brand_slider",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has it_brand_snippet_1 or brand-logo)
            var hasRenderedContent = self.$target.find('.it_brand_snippet_1, .brand-logo, .it_brand_border').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var brand_type = self.$target.attr('data-brand-config-type');
                var brand_id = self.$target.attr('data-brand-config-id');
                var titleText = _t("Brands");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.find('.title-block h2, .section-title, h3.section-title');
                if ($existingTitle.length) {
                    titleText = $existingTitle.text().trim() || titleText;
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="container">
                        <div class="row our-brands">
                            <div class="col-md-12">
                                <h3 class="section-title style1" id="snippet-title">
                                    <span>${titleText}</span>
                                </h3>
                                <div class="category-slider-placeholder">
                                    <img src="/theme_scita/static/src/img/brand1.png" alt="Category Slider" class="img-fluid"/>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                
                // Restore attributes
                if (brand_type) {
                    self.$target.attr('data-brand-config-type', brand_type);
                }
                if (brand_id) {
                    self.$target.attr('data-brand-config-id', brand_id);
                }
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                var slider_type = self.$target.attr('data-brand-config-type');
                rpc("/shop/get_it_brand", {
                    'slider-type': slider_type || '',
                }).then(function(data) {
                    if (data) {
                        self.$target.empty();
                        self.$target.empty().append(data);
                        $(".it_brand_slider").removeClass('o_hidden');
                    }
                });
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    //End 

    // Start
    publicWidget.registry.theme_scita_blog_custom_snippet = publicWidget.Widget.extend({ 
        selector: ".scita_blog_slider",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has blog content)
            var hasRenderedContent = self.$target.find('.it_blogs, .sct_top_row, .sct_mid_row').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var slider_type = self.$target.attr('data-blog-slider-type');
                var blog_name = _t("Blog Slider");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.find('.block-title h2, .block-title h3, h2.section-title, h3.fancy');
                if ($existingTitle.length) {
                    blog_name = $existingTitle.text().trim() || blog_name;
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="container">
                        <div class="block-title">
                            <h3 class="fancy">${blog_name}</h3>
                        </div>
                        <div class="category-slider-placeholder">
                            <img src="/theme_scita/static/src/img/blog1.png" alt="Blog Slider" class="img-fluid"/>
                        </div>
                    </div>
                `);
                
                // Restore attributes
                if (slider_type) {
                    self.$target.attr('data-blog-slider-type', slider_type);
                }
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                var slider_type = self.$target.attr('data-blog-slider-type');
                rpc("/theme_scita/blog_get_dynamic_slider", {
                    'slider-type': self.$target.attr('data-blog-slider-type') || '',
                }).then(function(data) {
                    if (data) {
                        self.$target.empty();
                        self.$target.append(data);
                        $(".scita_blog_slider").removeClass('hidden');
                    }
                });
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    // End

    // Start
    publicWidget.registry.blog_2_custom_snippet = publicWidget.Widget.extend({ 
        selector: ".blog_2_custom",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has blog content)
            var hasRenderedContent = self.$target.find('.owl-carousel, .sct_blog_box, #blog_2_owl_carosel').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var slider_type = self.$target.attr('data-blog-slider-type');
                var blog_name = _t("Blog Slider");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.find('.block-title h2, .block-title h3, h2.fancy, h3.fancy');
                if ($existingTitle.length) {
                    blog_name = $existingTitle.text().trim() || blog_name;
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="container">
                        <div class="block-title">
                            <h2 class="fancy">${blog_name}</h2>
                        </div>
                        <div class="category-slider-placeholder">
                            <img src="/theme_scita/static/src/img/blog2.png" alt="Blog Slider" class="img-fluid"/>
                        </div>
                    </div>
                `);
                
                // Restore attributes
                if (slider_type) {
                    self.$target.attr('data-blog-slider-type', slider_type);
                }
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                var slider_type = self.$target.attr('data-blog-slider-type');
                rpc("/theme_scita/second_blog_get_dynamic_slider", {
                    'slider-type': self.$target.attr('data-blog-slider-type') || '',
                }).then(function(data) {
                    if (data) {
                        self.$target.empty();
                        self.$target.append(data);
                        var sct_rtl = false;
                        if ($('#wrapwrap').hasClass('o_rtl')) {
                            sct_rtl = true;
                        }
                        $(".blog_2_custom").removeClass('hidden');
                        rpc('/theme_scita/blog_image_effect_config', {
                            'slider_type': slider_type
                        }).then(function(res) {
                            $('#blog_2_owl_carosel').owlCarousel({
                                margin: 30,
                                items: 4,
                                loop: false,
                                dots:false,
                                autoplay: res.auto_rotate,
                                autoplayTimeout:res.auto_play_time,
                                autoplayHoverPause:true,
                                rtl: sct_rtl,
                                nav: false,
                                rewind:true,
                                responsive: {
                                    0: {
                                        items: 1,
                                    },
                                    768: {
                                        items: 2,
                                    },
                                    992: {
                                        items: 3,
                                    },
                                    1400: {
                                        items: 4,
                                    }
                                },
                            });
                        });
                    }
                });
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    // End
    
    // Start
    publicWidget.registry.blog_4_custom_snippet = publicWidget.Widget.extend({ 
        selector: ".blog_4_custom",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has blog content)
            var hasRenderedContent = self.$target.find('.news_4_blogs, .sct_base_class, .sct_info_class').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var slider_type = self.$target.attr('data-blog-slider-type');
                var blog_name = _t("Blog Slider");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.find('.block-title h2, .block-title h3, h2.section-title, h3.fancy');
                if ($existingTitle.length) {
                    blog_name = $existingTitle.text().trim() || blog_name;
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="container">
                        <div class="block-title">
                            <h2 class="fancy">${blog_name}</h2>
                        </div>
                        <div class="category-slider-placeholder">
                            <img src="/theme_scita/static/src/img/blog3.png" alt="Blog Slider" class="img-fluid"/>
                        </div>
                    </div>
                `);
                
                // Restore attributes
                if (slider_type) {
                    self.$target.attr('data-blog-slider-type', slider_type);
                }
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                var slider_type = self.$target.attr('data-blog-slider-type');
                rpc("/theme_scita/forth_blog_get_dynamic_slider", {
                    'slider-type': self.$target.attr('data-blog-slider-type') || '',
                }).then(function(data) {
                    if (data) {
                        self.$target.empty();
                        self.$target.append(data);
                        $(".blog_4_custom").removeClass('hidden');
                    }
                });
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    // End

    // Start
    publicWidget.registry.blog_5_custom_snippet = publicWidget.Widget.extend({ 
        selector: ".blog_5_custom",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has blog content)
            var hasRenderedContent = self.$target.find('.owl-carousel, .sct_blog_box, #blog_5_owl_carosel, .blog_slider_wrap').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var slider_type = self.$target.attr('data-blog-slider-type');
                var blog_name = _t("Blog Slider");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.find('.block-title h2, .block-title h3, h2.fancy, h3.fancy, h3.sct_sub_title');
                if ($existingTitle.length) {
                    blog_name = $existingTitle.text().trim() || blog_name;
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="container">
                        <div class="block-title">
                            <h2 class="fancy">${blog_name}</h2>
                        </div>
                        <div class="category-slider-placeholder">
                            <img src="/theme_scita/static/src/img/blog4.png" alt="Blog Slider" class="img-fluid"/>
                        </div>
                    </div>
                `);
                
                // Restore attributes
                if (slider_type) {
                    self.$target.attr('data-blog-slider-type', slider_type);
                }
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                var slider_type = self.$target.attr('data-blog-slider-type');
                rpc("/theme_scita/fifth_blog_get_dynamic_slider", {
                    'slider-type': self.$target.attr('data-blog-slider-type') || '',
                }).then(function(data) {
                    if (data) {
                        self.$target.empty();
                        self.$target.append(data);
                        var sct_rtl = false;
                        if ($('#wrapwrap').hasClass('o_rtl')) {
                            sct_rtl = true;
                        }
                        $(".blog_5_custom").removeClass('hidden');
                        rpc('/theme_scita/blog_image_effect_config', {
                            'slider_type': slider_type
                        }).then(function(res) {
                            $('#blog_5_owl_carosel').owlCarousel({
                                margin: 45,
                                items: 3,
                                loop: false,
                                dots:false,
                                rewind:true,
                                autoplay: res.auto_rotate,
                                autoplayTimeout:res.auto_play_time,
                                autoplayHoverPause:true,
                                nav: false,
                                rtl: sct_rtl,
                                responsive: {
                                    0: {
                                        items: 1,
                                    },
                                    576: {
                                        items: 2,
                                    },
                                    992: {
                                        items: 3,
                                    },
                                    1500: {
                                        items: 4,
                                    }
                                },
                            });
                        });
                    }
                });
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    // End
    
    // Client sliders 2 Start
    publicWidget.registry.third_client_slider_snippet = publicWidget.Widget.extend({ 
        selector: ".testimonial-client-slider",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has client content)
            var hasRenderedContent = self.$target.find('.sct_client_wrap, .sct_client_box, .sct_client_not').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var titleText = _t("Our Partners");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.closest('section').find('.sct_test_title');
                if ($existingTitle.length) {
                    var title = $existingTitle.text().trim();
                    if (title && title !== "Testimonials") {
                        titleText = title;
                    }
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="category-slider-placeholder">
                        <img src="/theme_scita/static/src/img/third_client_slider.png" alt="Client Slider" class="img-fluid"/>
                    </div>
                `);
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                rpc("/theme_scita/third_get_clients_dynamically_slider", {}).then(function(data) {
                    if (data) {
                        self.$target.empty();
                        self.$target.append(data);
                    }
                });
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    // Client sliders 2 End
    
    // Our Team Start
    publicWidget.registry.it_our_team = publicWidget.Widget.extend({ 
        selector: ".our_team_1",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has team slider content)
            var hasRenderedContent = self.$target.find('.sct_team_slider, .owl-carousel, .myourteam, .image-container, .v-3-image-container, .v-5-image-container').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var titleText = _t("Our Awesome Team");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.closest('section').find('.section-title');
                if ($existingTitle.length) {
                    var title = $existingTitle.text().trim();
                    if (title) {
                        titleText = title;
                    }
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="category-slider-placeholder">
                        <img src="/theme_scita/static/src/img/scita-placeholder.png" alt="Our Team Slider" class="img-fluid"/>
                    </div>
                `);
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                rpc("/biztech_emp_data_one/employee_data", {}).then(function(data) {
                    self.$target.empty();
                    self.$target.append(data);
                    var sct_rtl = false;
                    if ($('#wrapwrap').hasClass('o_rtl')) {
                        sct_rtl = true;
                    }
                    $('#myourteam').owlCarousel({
                        loop:false,
                        margin:30,
                        nav:false,
                        items:4,
                        dots:false,
                        rewind:true,
                        autoplay:true,
                        autoplayTimeout:4000,
                        autoplayHoverPause:true,
                        autoHeight: false,
                        rtl: sct_rtl,
                        responsive:{
                            0:{
                                items:1
                            },
                            600:{
                                items:2
                            },
                            992:{
                                items:3
                            },
                            1200:{
                                items:4
                            }
                        }
                    });
                })
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    // Our Team End

    // Start
    publicWidget.registry.our_team_varient_3 = publicWidget.Widget.extend({ 
        selector: ".our_team_3",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has team slider content)
            var hasRenderedContent = self.$target.find('.sct_team_slider, .owl-carousel, .v_3_myourteam, .v-3-image-container').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var titleText = _t("Our Team");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.closest('section').find('.section-title');
                if ($existingTitle.length) {
                    var title = $existingTitle.text().trim();
                    if (title) {
                        titleText = title;
                    }
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="category-slider-placeholder">
                        <img src="/theme_scita/static/src/img/scita-placeholder.png" alt="Our Team Slider" class="img-fluid"/>
                    </div>
                `);
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                rpc("/biztech_emp_data_three/employee_data", {}).then(function(data) {
                    self.$target.empty();
                    self.$target.append(data);
                    var sct_rtl = false;
                    if ($('#wrapwrap').hasClass('o_rtl')) {
                        sct_rtl = true;
                    }
                    $('#v_3_myourteam').owlCarousel({
                        loop:false,
                        margin:30,
                        nav:false,
                        items:3,
                        dots:false,
                        rewind:true,
                        autoplay:true,
                        autoplayTimeout:4000,
                        autoplayHoverPause:true,
                        autoHeight: false,
                        rtl: sct_rtl,
                        responsive:{
                            0:{
                                items:1
                            },
                            576:{
                                items:2
                            },
                            992:{
                                items:3
                            },
                            1400:{
                                items:4
                            }
                        }
                    });
                })
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    // End

    // Start
    publicWidget.registry.our_team_varient_5 = publicWidget.Widget.extend({ 
        selector: ".our_team_5",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has team slider content)
            var hasRenderedContent = self.$target.find('.sct_team_slider, .owl-carousel, .v_5_myourteam, .v-5-image-container').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var titleText = _t("Meet Our Team");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.closest('section').find('.section-title');
                if ($existingTitle.length) {
                    var title = $existingTitle.text().trim();
                    if (title) {
                        titleText = title;
                    }
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="category-slider-placeholder">
                        <img src="/theme_scita/static/src/img/scita-placeholder.png" alt="Our Team Slider" class="img-fluid"/>
                    </div>
                `);
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                rpc("/biztech_emp_data_five/employee_data", {}).then(function(data) {
                    self.$target.empty();
                    self.$target.append(data);
                    var sct_rtl = false;
                    if ($('#wrapwrap').hasClass('o_rtl')) {
                        sct_rtl = true;
                    }
                    $('#v_5_myourteam').owlCarousel({
                        loop:false,
                        margin:30,
                        nav:false,
                        items:4,
                        autoplay:false,
                        rewind:true,
                        autoplayTimeout:4000,
                        autoplayHoverPause:true,
                        dots:false,
                        autoHeight: false,
                        rtl: sct_rtl,
                        responsive:{
                            0:{
                                items:1
                            },
                            600:{
                                items:2
                            },
                            768:{
                                items:3
                            },
                            992:{
                                items:4
                            }
                        }
                    });
                })
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    // End

    // Start
    publicWidget.registry.cat_slider_3 = publicWidget.Widget.extend({ 
        selector: ".cat_slider_3",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has owl-carousel or category-slider-section)
            var hasRenderedContent = self.$target.find('.owl-carousel, .category-slider, .section-title-wrapper').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var slider_id = self.$target.attr('data-cat-slider-id');
                var cat_name = _t("Category Slider");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.find('.section-title-wrapper h2, .section-title, .block-title h3');
                if ($existingTitle.length) {
                    cat_name = $existingTitle.text().trim() || cat_name;
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="container">
                        <div class="block-title">
                            <h3 class="fancy">${cat_name}</h3>
                        </div>
                        <div class="category-slider-placeholder">
                            <img src="/theme_scita/static/src/img/cat_slide_1.jpeg" alt="Category Slider" class="img-fluid"/>
                        </div>
                    </div>
                `);
                
                // Restore attributes
                if (slider_id) {
                    self.$target.attr('data-cat-slider-id', slider_id);
                }
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                var slider_id = self.$target.attr('data-cat-slider-id');
                rpc("/theme_scita/category_slider_3",{
                    'slider-id': self.$target.attr('data-cat-slider-id') || '',
                }).then(function(data) {
                    if (data) {
                        self.$target.empty();
                        self.$target.append(data);
                        var sct_rtl = false;
                        if ($('#wrapwrap').hasClass('o_rtl')) {
                            sct_rtl = true;
                        }
                        $(".cat_slider_3").removeClass('o_hidden');
                        $('div#carousel_category').owlCarousel({
                            loop:false,
                            margin:30,
                            nav:true,
                            autoplay:true,
                            rewind:true,
                            dots:false,
                            autoplayTimeout:2500,
                            autoplayHoverPause:true,
                            rtl: sct_rtl,
                            responsive:{
                                0:{
                                    items:2
                                },
                                767:{
                                    items:4
                                },
                                992:{
                                    items:5
                                },
                                1200:{
                                    items:6
                                },
                                1400:{
                                    items:7
                                }
                            }
                        })
                    }
                });
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    // End

    // Start
    publicWidget.registry.cat_slider_4 = publicWidget.Widget.extend({ 
        selector: ".cat_slider_4",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has owl-carousel or category-slider-section)
            var hasRenderedContent = self.$target.find('.owl-carousel, .category-slider, .title-block').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var slider_id = self.$target.attr('data-cat-slider-id');
                var cat_name = _t("Category Slider");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.find('.title-block h2, .section-title, .block-title h3');
                if ($existingTitle.length) {
                    cat_name = $existingTitle.text().trim() || cat_name;
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="container">
                        <div class="block-title">
                            <h3 class="fancy">${cat_name}</h3>
                        </div>
                        <div class="category-slider-placeholder">
                            <img src="/theme_scita/static/src/img/cat_slide_2.png" alt="Category Slider" class="img-fluid"/>
                        </div>
                    </div>
                `);
                
                // Restore attributes
                if (slider_id) {
                    self.$target.attr('data-cat-slider-id', slider_id);
                }
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                var slider_id = self.$target.attr('data-cat-slider-id');
                rpc("/theme_scita/category_slider_4", {
                    'slider-id': self.$target.attr('data-cat-slider-id') || '',
                }).then(function(data) {
                    if (data) {
                        self.$target.empty();
                        self.$target.append(data);
                        var sct_rtl = false;
                        if ($('#wrapwrap').hasClass('o_rtl')) {
                            sct_rtl = true;
                        }
                        $(".cat_slider_4").removeClass('o_hidden');
                        $('div#cat_slider_4_owl').owlCarousel({
                            loop:false,
                            nav:false,
                            autoplay:true,
                            rewind:true,
                            dots:false,
                            autoplayTimeout:2500,
                            autoplayHoverPause:true,
                            rtl: sct_rtl,
                            responsive:{
                                0:{
                                    items:2,
                                    margin:25,
                                },
                                767:{
                                    items:3,
                                    margin:35,
                                },
                                992:{
                                    items:4,
                                    margin:35,
                                },
                                1400:{
                                    items:6,
                                    margin:40,
                                }
                            }
                        })
                    }
                });
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    // End

    // Start
    publicWidget.registry.sct_product_snippet_1 = publicWidget.Widget.extend({ 
            selector: ".sct_product_snippet_1",
            disabledInEditableMode: false,
            events: {
                "mouseenter .scita_attribute_li": "_onMouseEnterSwatch",
                "mouseleave .css_attribute_color": "_onMouseLeave",
                "click .js_add_cart": "_onClickAddToCart",
                "click .js_add_cart_json": "_onClickUpdateQty",
                'click .cart_view_sct_btn': 'cartViewData',
            },
            
            _restorePlaceholder: function() {
                var self = this;
                // Check if this is rendered content (has product content)
                var hasRenderedContent = self.$target.find('.sct-snippet-full, .grid_product, .cs-product, .pwp-img, .pwd-desc').length > 0;
                var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
                
                // Only restore if we have rendered content and no placeholder
                if (hasRenderedContent && !hasPlaceholder) {
                    var slider_type = self.$target.attr('data-multi-cat-slider-type');
                    var slider_id = self.$target.attr('data-multi-cat-slider-id');
                    var titleText = _t("Product Configuration");
                    
                    // Get title from rendered content if exists
                    var $existingTitle = self.$target.find('.section-title, h2.section-title, h4.section-title');
                    if ($existingTitle.length) {
                        var title = $existingTitle.first().text().trim();
                        if (title) {
                            titleText = title;
                        }
                    }
                    
                    // Restore placeholder structure
                    self.$target.html(`
                        <div class="container">
                            <div class="row our-config-products">
                                <div class="col-md-12">
                                    <div class="title-block">
                                        <h4 id="snippet-title" class="section-title style1">
                                            <span>${titleText}</span>
                                        </h4>
                                        <div class="category-slider-placeholder">
                                            <img src="/theme_scita/static/src/img/sct-product-snippet.png" alt="Product Snippet" class="img-fluid"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `);
                    
                    // Restore attributes
                    if (slider_type) {
                        self.$target.attr('data-multi-cat-slider-type', slider_type);
                    }
                    if (slider_id) {
                        self.$target.attr('data-multi-cat-slider-id', slider_id);
                    }
                }
            },
            
            start: function() {
                var self = this;
                if (this.editableMode) {
                    // Restore placeholder when in editable mode
                    self._restorePlaceholder();
                    
                    // Also listen for when body gets editor_enable class (editable mode enabled)
                    var checkEditableMode = function() {
                        if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                            self._restorePlaceholder();
                        }
                    };
                    
                    // Check immediately
                    setTimeout(checkEditableMode, 100);
                    
                    // Also check when DOM changes (in case editable mode is enabled later)
                    if (typeof MutationObserver !== 'undefined') {
                        var observer = new MutationObserver(function(mutations) {
                            checkEditableMode();
                        });
                        observer.observe(document.body, {
                            attributes: true,
                            attributeFilter: ['class'],
                            subtree: true
                        });
                        this._observer = observer;
                    }
                }
                if (!this.editableMode) {
                    // Get slider type from data attribute or custom template data
                    var slider_type = self.$target.attr('data-multi-cat-slider-type') || 
                                    self.$target.attr('data-custom-template-data') || '';
                    
                    // Try to parse custom_template_data if it's JSON
                    if (!slider_type && self.$target.attr('data-custom-template-data')) {
                        try {
                            var customData = JSON.parse(self.$target.attr('data-custom-template-data'));
                            slider_type = customData['slider-type'] || customData.slider_type || '';
                        } catch(e) {
                            // Not JSON, use as-is
                        }
                    }
                    
                    if (slider_type) {
                        // Use rpc for Odoo 19 compatible route
                        rpc("/product_column_five", {
                            'slider-type': slider_type,
                        }).then(function(response) {
                            if (response && response.html) {
                                // Odoo 19 format - response has html property
                                var html = response.html;
                                self._injectContent(html);
                            } else if (response && typeof response === 'string') {
                                // Legacy format - direct HTML string
                                self._injectContent(response);
                            } else if (response) {
                                // Fallback
                                self._injectContent(response);
                            }
                        }).catch(function(error) {
                            console.error('Error loading product snippet data:', error);
                        });
                    }
                }
            },
            _injectContent: function(html) {
                var self = this;
                // For Odoo 19 dynamic snippet structure
                var $dynamicContent = self.$target.find('.dynamic_snippet_template');
                if ($dynamicContent.length) {
                    $dynamicContent.html(html);
                    self.$target.removeClass('o_dynamic_snippet_empty');
                } else {
                    // Legacy structure - replace entire content
                    self.$target.empty();
                    self.$target.append(html);
                }
                
                $(".sct_product_snippet_1").removeClass('hidden');
                setTimeout(function(){
                    var $imgLinks = $('.sct_product_snippet_1 .cs-product .pwp-img a');
                    if ($imgLinks.length) {
                        var divWidth = $imgLinks.first().width(); 
                        $imgLinks.height(divWidth);
                    }
                }, 400);
            },
            cartViewData: function (ev) {
                    const element = ev.currentTarget;
                    const product_id = $(element).attr('data-id');
                    rpc('/theme_scita/shop/cart_view', { product_id }).then(function (data) {
                        $("#shop_cart_view_modal").html(data).modal("show");
                    });
                },
            
                // 🛒 ADD TO CART BUTTON (main "Add" button)
                _onClickAddToCart: function (ev) {
                    ev.preventDefault();
                    ev.stopPropagation();
                
                    const $btn = $(ev.currentTarget);
                    const $cartWrapper = $btn.closest(".ajax_cart_template");
                    const $qtyInput = $cartWrapper.find("input.quantity");
                    
                    const $productIDInput = $cartWrapper.find("input[name='product_id']");
                    const productID = parseInt($productIDInput.val()); 
                    const productTemplateID = parseInt($btn.data("templateId"));
                    const addQuantity = parseInt($qtyInput.val()) || 1;
                
                    const self = this;
                    
                    // Strategy: Use custom endpoint to get cart lines for this product
                    rpc("/shop/cart/get_lines", {
                        product_id: productID
                    }).then((cartLines) => {
                        // Check if product already exists in cart
                        const existingLine = cartLines.length > 0 ? cartLines[0] : null;
                        
                        if (existingLine) {
                            const newQuantity = existingLine.quantity + addQuantity;
                            
                            // Update existing line with new total quantity
                            return rpc("/shop/cart/update", {
                                line_id: existingLine.line_id,
                                product_id: productID,
                                quantity: newQuantity
                            });
                        } else {
                            // Product doesn't exist, add it
                            return rpc("/shop/cart/add", {
                                product_id: productID,
                                product_template_id: productTemplateID,
                                quantity: addQuantity,
                            });
                        }
                    }).then((data) => {
                        if (data.cart_quantity) {
                            self._updateCartIcon(data.cart_quantity);
                        }
                        
                        if (data.notification_info) {
                            self._showCartNotification(self.call.bind(self), data.notification_info);
                        }
                        
                        if (data.quantity && data.tracking_info) {
                            self._trackProducts(data.tracking_info);
                        }
                        
                    }).catch((err) => {
                        // Silent error handling
                    });
                },

                _updateCartIcon: function (cartQuantity) {
                    browser.sessionStorage.setItem('website_sale_cart_quantity', cartQuantity);
                
                    // Update mobile and desktop cart quantities
                    const cartQuantityElements = document.querySelectorAll('.my_cart_quantity, .o_wsale_my_cart_quantity');
                    for (const cartQuantityElement of cartQuantityElements) {
                        if (cartQuantity === 0) {
                            cartQuantityElement.classList.add('d-none');
                        } else {
                            const cartIconElement = document.querySelector('li.o_wsale_my_cart');
                            if (cartIconElement) {
                                cartIconElement.classList.remove('d-none');
                            }
                            cartQuantityElement.classList.remove('d-none');
                            cartQuantityElement.classList.add('o_mycart_zoom_animation');
                
                            setTimeout(() => {
                                cartQuantityElement.textContent = cartQuantity;
                                cartQuantityElement.classList.remove('o_mycart_zoom_animation');
                            }, 300);
                        }
                    }
                },

                _trackProducts(trackingInfo) {
                    document.querySelector('.oe_website_sale').dispatchEvent(
                        new CustomEvent('add_to_cart_event', {'detail': trackingInfo})
                    );
                },

                _onClickUpdateQty: function (ev) {
                    ev.preventDefault();
                    const $btn = $(ev.currentTarget);
                    const $qtyInput = $btn.closest('.input-group').find('input.quantity');
                
                    let qty = parseInt($qtyInput.val()) || 1;
                    qty += $btn.attr('aria-label') === 'Remove one' ? -1 : 1;
                
                    if (qty < 1) qty = 1;
                    $qtyInput.val(qty).trigger('change');
                },

        _onMouseEnterSwatch: function (ev) {
            const $swatch = $(ev.currentTarget);
            const $product = $swatch.closest('.cs-product');
            const $img = $product.find('img').first();            
            this.image= $img;
        
            this.defaultSrc = $img.attr('data-default-img-src');        
            const previewSrc = $swatch.find('label').data('previewImgSrc');
            
            if (previewSrc) {
                this._updateImgSrc(previewSrc, $img);
                $swatch.addClass("active");
            }
        },
        
        _onMouseLeave: function () {
             this._updateImgSrc(this.defaultSrc,this.image);
        },
        
        _updateImgSrc: function (src, $img) {        
            if ($img && src) {
                $img.attr('src', src);
            } else {
                console.warn("Image element or source is missing.");
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        },
    });

    // Snippet 2 Widget - Replica of sct_product_snippet_1 with separate backend
    publicWidget.registry.sct_product_snippet_2 = publicWidget.Widget.extend({ 
            selector: ".sct_product_snippet_2",
            disabledInEditableMode: false,
            events: {
                "mouseenter .scita_attribute_li": "_onMouseEnterSwatch",
                "mouseleave .css_attribute_color": "_onMouseLeave",
                "click .js_add_cart": "_onClickAddToCart",
                "click .js_add_cart_json": "_onClickUpdateQty",
                'click .cart_view_sct_btn': 'cartViewData',
            },
            
            _restorePlaceholder: function() {
                var self = this;
                // Check if this is rendered content (has product content)
                var hasRenderedContent = self.$target.find('.sct-snippet-full, .grid_product, .cs-product, .pwp-img, .pwd-desc').length > 0;
                var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
                
                // Only restore if we have rendered content and no placeholder
                if (hasRenderedContent && !hasPlaceholder) {
                    var slider_type = self.$target.attr('data-multi-cat-slider-type');
                    var slider_id = self.$target.attr('data-multi-cat-slider-id');
                    var titleText = _t("Product Configuration");
                    
                    // Get title from rendered content if exists
                    var $existingTitle = self.$target.find('.section-title, h2.section-title, h4.section-title');
                    if ($existingTitle.length) {
                        var title = $existingTitle.first().text().trim();
                        if (title) {
                            titleText = title;
                        }
                    }
                    
                    // Restore placeholder structure
                    self.$target.html(`
                        <div class="container">
                            <div class="row our-config-products">
                                <div class="col-md-12">
                                    <div class="title-block">
                                        <h4 id="snippet-title" class="section-title style1">
                                            <span>${titleText}</span>
                                        </h4>
                                        <div class="category-slider-placeholder">
                                            <img src="/theme_scita/static/src/img/sct-product-snippet.png" alt="Product Snippet" class="img-fluid"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `);
                    
                    // Restore attributes
                    if (slider_type) {
                        self.$target.attr('data-multi-cat-slider-type', slider_type);
                    }
                    if (slider_id) {
                        self.$target.attr('data-multi-cat-slider-id', slider_id);
                    }
                }
            },
            
            start: function() {
                var self = this;
                if (this.editableMode) {
                    // Restore placeholder when in editable mode
                    self._restorePlaceholder();
                    
                    // Also listen for when body gets editor_enable class (editable mode enabled)
                    var checkEditableMode = function() {
                        if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                            self._restorePlaceholder();
                        }
                    };
                    
                    // Check immediately
                    setTimeout(checkEditableMode, 100);
                    
                    // Also check when DOM changes (in case editable mode is enabled later)
                    if (typeof MutationObserver !== 'undefined') {
                        var observer = new MutationObserver(function(mutations) {
                            checkEditableMode();
                        });
                        observer.observe(document.body, {
                            attributes: true,
                            attributeFilter: ['class'],
                            subtree: true
                        });
                        this._observer = observer;
                    }
                }
                if (!this.editableMode) {
                    // Get slider type from data attribute or custom template data
                    var slider_type = self.$target.attr('data-multi-cat-slider-type') || 
                                    self.$target.attr('data-custom-template-data') || '';
                    
                    // Try to parse custom_template_data if it's JSON
                    if (!slider_type && self.$target.attr('data-custom-template-data')) {
                        try {
                            var customData = JSON.parse(self.$target.attr('data-custom-template-data'));
                            slider_type = customData['slider-type'] || customData.slider_type || '';
                        } catch(e) {
                            // Not JSON, use as-is
                        }
                    }
                    
                    if (slider_type) {
                        // Use rpc for Odoo 19 compatible route
                        rpc("/product_column_five_two", {
                            'slider-type': slider_type,
                        }).then(function(response) {
                            if (response && response.html) {
                                // Odoo 19 format - response has html property
                                var html = response.html;
                                self._injectContent(html);
                            } else if (response && typeof response === 'string') {
                                // Legacy format - direct HTML string
                                self._injectContent(response);
                            } else if (response) {
                                // Fallback
                                self._injectContent(response);
                            }
                        }).catch(function(error) {
                            console.error('Error loading product snippet 2 data:', error);
                        });
                    }
                }
            },
            _injectContent: function(html) {
                var self = this;
                // For Odoo 19 dynamic snippet structure
                var $dynamicContent = self.$target.find('.dynamic_snippet_template');
                if ($dynamicContent.length) {
                    $dynamicContent.html(html);
                    self.$target.removeClass('o_dynamic_snippet_empty');
                } else {
                    // Legacy structure - replace entire content
                    self.$target.empty();
                    self.$target.append(html);
                }
                
                $(".sct_product_snippet_2").removeClass('hidden');
                setTimeout(function(){
                    var $imgLinks = $('.sct_product_snippet_2 .cs-product .pwp-img a');
                    if ($imgLinks.length) {
                        var divWidth = $imgLinks.first().width(); 
                        $imgLinks.height(divWidth);
                    }
                }, 400);
            },
            cartViewData: function (ev) {
                    const element = ev.currentTarget;
                    const product_id = $(element).attr('data-id');
                    rpc('/theme_scita/shop/cart_view', { product_id }).then(function (data) {
                        $("#shop_cart_view_modal").html(data).modal("show");
                    });
                },
            
                // 🛒 ADD TO CART BUTTON (main "Add" button)
                _onClickAddToCart: function (ev) {
                    ev.preventDefault();
                    ev.stopPropagation();
                
                    const $btn = $(ev.currentTarget);
                    const $cartWrapper = $btn.closest(".ajax_cart_template");
                    const $qtyInput = $cartWrapper.find("input.quantity");
                    
                    const $productIDInput = $cartWrapper.find("input[name='product_id']");
                    const productID = parseInt($productIDInput.val()); 
                    const productTemplateID = parseInt($btn.data("templateId"));
                    const addQuantity = parseInt($qtyInput.val()) || 1;
                
                    const self = this;
                    
                    // Strategy: Use custom endpoint to get cart lines for this product
                    rpc("/shop/cart/get_lines", {
                        product_id: productID
                    }).then((cartLines) => {
                        // Check if product already exists in cart
                        const existingLine = cartLines.length > 0 ? cartLines[0] : null;
                        
                        if (existingLine) {
                            const newQuantity = existingLine.quantity + addQuantity;
                            
                            // Update existing line with new total quantity
                            return rpc("/shop/cart/update", {
                                line_id: existingLine.line_id,
                                product_id: productID,
                                quantity: newQuantity
                            });
                        } else {
                            // Product doesn't exist, add it
                            return rpc("/shop/cart/add", {
                                product_id: productID,
                                product_template_id: productTemplateID,
                                quantity: addQuantity,
                            });
                        }
                    }).then((data) => {
                        if (data.cart_quantity) {
                            self._updateCartIcon(data.cart_quantity);
                        }
                        
                        if (data.notification_info) {
                            self._showCartNotification(self.call.bind(self), data.notification_info);
                        }
                        
                        if (data.quantity && data.tracking_info) {
                            self._trackProducts(data.tracking_info);
                        }
                        
                    }).catch((err) => {
                        // Silent error handling
                    });
                },

                _updateCartIcon: function (cartQuantity) {
                    browser.sessionStorage.setItem('website_sale_cart_quantity', cartQuantity);
                
                    // Update mobile and desktop cart quantities
                    const cartQuantityElements = document.querySelectorAll('.my_cart_quantity, .o_wsale_my_cart_quantity');
                    for (const cartQuantityElement of cartQuantityElements) {
                        if (cartQuantity === 0) {
                            cartQuantityElement.classList.add('d-none');
                        } else {
                            const cartIconElement = document.querySelector('li.o_wsale_my_cart');
                            if (cartIconElement) {
                                cartIconElement.classList.remove('d-none');
                            }
                            cartQuantityElement.classList.remove('d-none');
                            cartQuantityElement.classList.add('o_mycart_zoom_animation');
                
                            setTimeout(() => {
                                cartQuantityElement.textContent = cartQuantity;
                                cartQuantityElement.classList.remove('o_mycart_zoom_animation');
                            }, 300);
                        }
                    }
                },

                _trackProducts(trackingInfo) {
                    document.querySelector('.oe_website_sale').dispatchEvent(
                        new CustomEvent('add_to_cart_event', {'detail': trackingInfo})
                    );
                },

                _onClickUpdateQty: function (ev) {
                    ev.preventDefault();
                    const $btn = $(ev.currentTarget);
                    const $qtyInput = $btn.closest('.input-group').find('input.quantity');
                
                    let qty = parseInt($qtyInput.val()) || 1;
                    qty += $btn.attr('aria-label') === 'Remove one' ? -1 : 1;
                
                    if (qty < 1) qty = 1;
                    $qtyInput.val(qty).trigger('change');
                },

        _onMouseEnterSwatch: function (ev) {
            const $swatch = $(ev.currentTarget);
            const $product = $swatch.closest('.cs-product');
            const $img = $product.find('img').first();            
            this.image= $img;
        
            this.defaultSrc = $img.attr('data-default-img-src');        
            const previewSrc = $swatch.find('label').data('previewImgSrc');
            
            if (previewSrc) {
                this._updateImgSrc(previewSrc, $img);
                $swatch.addClass("active");
            }
        },
        
        _onMouseLeave: function () {
             this._updateImgSrc(this.defaultSrc,this.image);
        },
        
        _updateImgSrc: function (src, $img) {        
            if ($img && src) {
                $img.attr('src', src);
            } else {
                console.warn("Image element or source is missing.");
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        },
    });
    
    // // Dynamic Video banner js start
    // animation.registry.dynamic_video_banner = animation.Class.extend({
    publicWidget.registry.dynamic_video_banner = publicWidget.Widget.extend({ 
        selector: ".dynamic_video_banner",
        disabledInEditableMode: false,
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has video tag or rendered video content)
            var hasRenderedContent = self.$target.find('video, source').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var video_url = self.$target.attr('data-video-url');
                var titleText = _t("Video Banner");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.find('.section-title, h3, h4');
                if ($existingTitle.length) {
                    var title = $existingTitle.text().trim();
                    if (title) {
                        titleText = title;
                    }
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="container">
                        <div class="row sct-video-row">
                            <div class="col-md-12">
                                <h3 class="section-title style1" id="snippet-title">
                                    <span>${titleText}</span>
                                </h3>
                                <div class="category-slider-placeholder">
                                    <img src="/theme_scita/static/src/img/scita-placeholder.png" alt="Video Banner" class="img-fluid"/>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                
                // Restore attributes
                if (video_url) {
                    self.$target.attr('data-video-url', video_url);
                }
            }
        },
        
        start: function() {
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                $.get("/video/video_url_get", {
                    'video_url': self.$target.attr('data-video-url'),
                }).then(function(data) {
                    if (data) {
                        self.$target.empty().append(data);
                        $(".dynamic_video_banner").removeClass('o_hidden');
                    }
                });
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    // Dynamic Video banner js End

    // Dynamic Top Dealers Snippet Start
    publicWidget.registry.dynamic_top_dealers = publicWidget.Widget.extend({ 
            selector: ".oe_top_dealers_section",
            disabledInEditableMode: false,
            
            _restorePlaceholder: function() {
                var self = this;
                // Check if this is rendered content (has dealers content)
                var hasRenderedContent = self.$target.find('.dealers-block-wrapper, .dealers-block, .dealers-block-inner').length > 0;
                var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
                
                // Only restore if we have rendered content and no placeholder
                if (hasRenderedContent && !hasPlaceholder) {
                    var dealer_name = _t("Top Dealers");
                    
                    // Get title from rendered content if exists
                    var $existingTitle = self.$target.find('.section-title-wrapper h2, h2.section-title, h3.fancy');
                    if ($existingTitle.length) {
                        dealer_name = $existingTitle.text().trim() || dealer_name;
                    }
                    
                    // Restore placeholder structure
                    self.$target.html(`
                        <div class="container">
                           <div class="section-title-wrapper d-flex flex-wrap  justify-content-between align-items-center">
                                <h2 class="section-title style1">${dealer_name}</h2>
                                <div class="category-slider-placeholder">
                                    <img src="/theme_scita/static/src/img/client.jpeg" alt="Top Dealers" class="img-fluid"/>
                                </div>
                            </div>
                        </div>
                    `);
                }
            },
            
            start: function(){
                var self = this;
                if (this.editableMode) {
                    // Restore placeholder when in editable mode
                    self._restorePlaceholder();
                    
                    // Also listen for when body gets editor_enable class (editable mode enabled)
                    var checkEditableMode = function() {
                        if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                            self._restorePlaceholder();
                        }
                    };
                    
                    // Check immediately
                    setTimeout(checkEditableMode, 100);
                    
                    // Also check when DOM changes (in case editable mode is enabled later)
                    if (typeof MutationObserver !== 'undefined') {
                        var observer = new MutationObserver(function(mutations) {
                            checkEditableMode();
                        });
                        observer.observe(document.body, {
                            attributes: true,
                            attributeFilter: ['class'],
                            subtree: true
                        });
                        this._observer = observer;
                    }
                }
                if (!this.editableMode) {
                    $.get("/theme_scita/top_dealers", {
                    }).then(function(data) {
                        self.$target.empty();
                        self.$target.append(data);
                        $(".oe_top_dealers_section").removeClass('hidden');
                    });
                }
            },
            
            destroy: function() {
                // Clean up observer if it exists
                if (this._observer) {
                    this._observer.disconnect();
                    this._observer = null;
                }
                return this._super.apply(this, arguments);
            },
    });
    // Dynamic Top Dealers Snippet End
    
    // Dynamic Trending Products Snippet Start
    publicWidget.registry.dynamic_trending_products = publicWidget.Widget.extend({ 
        selector: ".oe_trending_products_section",
        disabledInEditableMode: false,
        events: {
            "mouseenter .scita_attribute_li": "_onMouseEnterSwatch",
            "mouseleave .css_attribute_color": "_onMouseLeave",
            "click .js_add_cart": "_onClickAddToCart",
            "click .js_add_cart_json": "_onClickUpdateQty",
            'click .cart_view_sct_btn': 'cartViewData',
        },
        
        _restorePlaceholder: function() {
            var self = this;
            // Check if this is rendered content (has trending products content)
            var hasRenderedContent = self.$target.find('.trending_products_categories, .trend_prod_tab, #product_slider, .owl-carousel, .cs-product, .retail_trending_products, .latest-trendy-section, .lns-inner').length > 0;
            var hasPlaceholder = self.$target.find('.category-slider-placeholder').length > 0;
            
            // Only restore if we have rendered content and no placeholder
            if (hasRenderedContent && !hasPlaceholder) {
                var slider_id = self.$target.attr('data-cat-slider-id');
                var trending_name = _t("Trending Products");
                
                // Get title from rendered content if exists
                var $existingTitle = self.$target.find('.title-block h2, h2.section-title, .section-title');
                if ($existingTitle.length) {
                    trending_name = $existingTitle.text().trim() || trending_name;
                }
                
                // Restore placeholder structure
                self.$target.html(`
                    <div class="retail_trending_products">
                        <div class="container">
                            <div class="lns-inner latest-trendy-section">
                                <div class="row">
                                    <div class="lns-post">
                                        <div class="psb-inner">
                                            <div class="title-block">
                                                <h2 class="section-title style1">${trending_name}</h2>
                                            </div>
                                            <div class="category-slider-placeholder">
                                                <img src="/theme_scita/static/src/img/TreandingProduct1.png" alt="Trending Products" class="img-fluid"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                
                // Restore attributes
                if (slider_id) {
                    self.$target.attr('data-cat-slider-id', slider_id);
                }
            }
        },
        
        start: function(){
            var self = this;
            if (this.editableMode) {
                // Restore placeholder when in editable mode
                self._restorePlaceholder();
                
                // Also listen for when body gets editor_enable class (editable mode enabled)
                var checkEditableMode = function() {
                    if ($('body').hasClass('editor_enable') || $('#wrapwrap').hasClass('editor_enable')) {
                        self._restorePlaceholder();
                    }
                };
                
                // Check immediately
                setTimeout(checkEditableMode, 100);
                
                // Also check when DOM changes (in case editable mode is enabled later)
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                        checkEditableMode();
                    });
                    observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['class'],
                        subtree: true
                    });
                    this._observer = observer;
                }
            }
            if (!this.editableMode) {
                var slider_id = self.$target.attr('data-cat-slider-id');
                $.get("/theme_scita/trending_products_categories", {
                    'slider-id': slider_id || '',
                }).then(function(data) {
                    self.$target.empty();
                    self.$target.append(data);
                    const categoryId = $(".trend_prod_tab")[0].getAttribute('data-category-id');
                     $.get("/theme_scita/get_trending_prducts", {
                        'category': categoryId,
                        'slider-id': slider_id || '',
                    }).then(function(data) {
                        self.$target.empty();
                        self.$target.append(data);
                        $(".theme_scita_trending_products").removeClass('o_hidden');
                        $('div#product_slider').owlCarousel({
                            margin: 30,
                            items:4,
                            loop:false,
                            autoplay:true,
                            rewind:true,
                            dots:false,
                            autoplayTimeout:5000,
                            autoplayHoverPause:true,
                            nav: true,
                            responsive: {
                                0: {
                                    items: 2
                                },
                                992: {
                                    items: 3
                                },
                                1400: {
                                    items: 4
                                },
                            },
                        });
                    });
                });
                $(document).on("click", ".trend_prod_tab", function (ev) {
                    const categoryId = ev.currentTarget.getAttribute('data-category-id');
                    $(ev.currentTarget).find('a').addClass('active')
                    $.get("/theme_scita/get_trending_prducts", {
                        'category': categoryId,
                        'slider-id': self.$target.attr('data-cat-slider-id') || '',
                    }).then(function(data) {
                        self.$target.empty();
                        self.$target.append(data);
                        $(".theme_scita_trending_products").removeClass('o_hidden');
                        for(let ele of $("#trending_products_categories").find("li.trend_prod_tab > a")){
                            if(ele.classList.contains("active") && ele.classList.contains("show")){
                                ele.classList.remove("active");
                                ele.classList.remove("show");
                            }
                            // if(ele.parentElement.getAttribute('data-category-id') == ev.currentTarget.getAttribute('data-category-id')){
                            //     ele.classList.add("show","active")
                            // }
                            if (ele.parentElement.getAttribute('data-category-id') == $(ev.currentTarget).attr('data-category-id')) {
                                ele.classList.add("show", "active");
                            }
                        }
                        $('div#product_slider').owlCarousel({
                            margin: 30,
                            items:4,
                            loop:false,
                            autoplay:true,
                            rewind:true,
                            dots:false,
                            autoplayTimeout:5000,
                            autoplayHoverPause:true,
                            nav: true,
                            responsive: {
                                0: {
                                    items: 2
                                },
                                480: {
                                    items: 3
                                },
                                768: {
                                    items: 4
                                },
                                1024: {
                                    items: 3
                                },
                                1500: {
                                    items: 4
                                },
                            },
                        });
                    });
                });
            }
        },
        cartViewData: function (ev) {
                const element = ev.currentTarget;
                const product_id = $(element).attr('data-id');
                rpc('/theme_scita/shop/cart_view', { product_id }).then(function (data) {
                    $("#shop_cart_view_modal").html(data).modal("show");
                });
            },
        
            // 🛒 ADD TO CART BUTTON (main "Add" button)
            _onClickAddToCart: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            
                const $btn = $(ev.currentTarget);
                const $cartWrapper = $btn.closest(".ajax_cart_template");
                const $qtyInput = $cartWrapper.find("input.quantity");
                
                const $productIDInput = $cartWrapper.find("input[name='product_id']");
                const productID = parseInt($productIDInput.val()); 
                const productTemplateID = parseInt($btn.data("templateId"));
                const addQuantity = parseInt($qtyInput.val()) || 1;
            
                const self = this;
                
                // Strategy: Use custom endpoint to get cart lines for this product
                rpc("/shop/cart/get_lines", {
                    product_id: productID
                }).then((cartLines) => {
                    // Check if product already exists in cart
                    const existingLine = cartLines.length > 0 ? cartLines[0] : null;
                    
                    if (existingLine) {
                        const newQuantity = existingLine.quantity + addQuantity;
                        
                        // Update existing line with new total quantity
                        return rpc("/shop/cart/update", {
                            line_id: existingLine.line_id,
                            product_id: productID,
                            quantity: newQuantity
                        });
                    } else {
                        // Product doesn't exist, add it
                        return rpc("/shop/cart/add", {
                            product_id: productID,
                            product_template_id: productTemplateID,
                            quantity: addQuantity,
                        });
                    }
                }).then((data) => {
                    if (data.cart_quantity) {
                        self._updateCartIcon(data.cart_quantity);
                    }
                    
                    if (data.notification_info) {
                        self._showCartNotification(self.call.bind(self), data.notification_info);
                    }
                    
                    if (data.quantity && data.tracking_info) {
                        self._trackProducts(data.tracking_info);
                    }
                    
                }).catch((err) => {
                    // Silent error handling
                });
            }, 

            _updateCartIcon: function (cartQuantity) {
                browser.sessionStorage.setItem('website_sale_cart_quantity', cartQuantity);
            
                // Update mobile and desktop cart quantities
                const cartQuantityElements = document.querySelectorAll('.my_cart_quantity, .o_wsale_my_cart_quantity');
                for (const cartQuantityElement of cartQuantityElements) {
                    if (cartQuantity === 0) {
                        cartQuantityElement.classList.add('d-none');
                    } else {
                        const cartIconElement = document.querySelector('li.o_wsale_my_cart');
                        if (cartIconElement) {
                            cartIconElement.classList.remove('d-none');
                        }
                        cartQuantityElement.classList.remove('d-none');
                        cartQuantityElement.classList.add('o_mycart_zoom_animation');
            
                        setTimeout(() => {
                            cartQuantityElement.textContent = cartQuantity;
                            cartQuantityElement.classList.remove('o_mycart_zoom_animation');
                        }, 300);
                    }
                }
            },

            _trackProducts(trackingInfo) {
                document.querySelector('.oe_website_sale').dispatchEvent(
                    new CustomEvent('add_to_cart_event', {'detail': trackingInfo})
                );
            },

            _onClickUpdateQty: function (ev) {
                ev.preventDefault();
                const $btn = $(ev.currentTarget);
                const $qtyInput = $btn.closest('.input-group').find('input.quantity');
            
                let qty = parseInt($qtyInput.val()) || 1;
                qty += $btn.attr('aria-label') === 'Remove one' ? -1 : 1;
            
                if (qty < 1) qty = 1;
                $qtyInput.val(qty).trigger('change');
            },
        _onMouseEnterSwatch: function (ev) {
            const $swatch = $(ev.currentTarget);
            const $product = $swatch.closest('.cs-product');
            const $img = $product.find('img').first();            
            this.image= $img;
        
            this.defaultSrc = $img.attr('data-default-img-src');        
            const previewSrc = $swatch.find('label').data('previewImgSrc');
            
            if (previewSrc) {
                this._updateImgSrc(previewSrc, $img);
                $swatch.addClass("active");
            }
        },
        
        _onMouseLeave: function () {
             this._updateImgSrc(this.defaultSrc,this.image);
        },
        
        _updateImgSrc: function (src, $img) {        
            if ($img && src) {
                $img.attr('src', src);
            } else {
                console.warn("Image element or source is missing.");
            }
        },
        
        destroy: function() {
            // Clean up observer if it exists
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            return this._super.apply(this, arguments);
        }
    });
    // Dynamic Trending Products Snippet End
