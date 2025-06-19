/** @odoo-module **/
import publicWidget from "@web/legacy/js/public/public_widget";

odoo.define('theme_scita.pg_slider',[], function(require) {
    'use strict';
        publicWidget.registry.CustomCategoryCarousel = publicWidget.Widget.extend({
            selector: '#pg_carousel_category',
            start: function () {
                this.$el.owlCarousel({
                    loop:false,
                    margin:30,
                    nav:true,
                    autoplay:true,
                    rewind:true,
                    dots:false,
                    autoplayTimeout:2500,
                    autoplayHoverPause:true,
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
                });
            }
        });

        publicWidget.registry.CustomCategoryCarousel1 = publicWidget.Widget.extend({
            selector: '#pg_cat_slider_4_owl',
            start: function () {
                this.$el.owlCarousel({
                    loop:false,
                            margin:30,
                            nav:true,
                            autoplay:true,
                            rewind:true,
                            dots:false,
                            autoplayTimeout:2500,
                            autoplayHoverPause:true,
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
                });
            }
        });

        publicWidget.registry.CustomCategoryCarousel2 = publicWidget.Widget.extend({
            selector: '#pg_cat_slider_gray_owl',
            start: function () {
                this.$el.owlCarousel({
                    nav:true,
                    margin: 10,
                    items:7,
                    loop:false,
                    rewind:true,
                    autoplay:true,
                    autoplayTimeout:4000,
                    autoplayHoverPause:true,
                    dots:false,
                    responsive: {
                            0:{
                                items:2
                            },
                            400:{
                                items:3
                            },
                            768:{
                                items:5,
                                margin:10
                            },
                            1024:{
                                items:6,
                                margin:10
                            },
                            1266:{
                                items:7,
                                margin:20
                            },
                            1440:{
                                items:7,
                                margin:30
                            },
                    },
                });
            }
        });

        publicWidget.registry.CustomCategoryCarousel3 = publicWidget.Widget.extend({
            selector: '.pg-sct-brand-slider-2',
            start: function () {
                this.$el.owlCarousel({
                    margin: 10,
                            items:6,
                            loop:false,
                            autoplay:true,
                            rewind:true,
                            dots:false,
                            autoplayTimeout:5000,
                            autoplayHoverPause:true,
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

        publicWidget.registry.CustomCategoryCarousel4 = publicWidget.Widget.extend({
            selector: '#pg_blog_2_owl_carosel',
            start: function () {
                this.$el.owlCarousel({
                    margin: 30,
                            items: 4,
                            loop: false,
                            dots:false,
                            autoplay: true,
                            autoplayTimeout:2500,
                            autoplayHoverPause:true,
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
                        }
        });

        publicWidget.registry.CustomCategoryCarousel5 = publicWidget.Widget.extend({
            selector: '#pg_myourteam',
            start: function () {
                this.$el.owlCarousel({
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
            }
        });
        
        publicWidget.registry.CustomCategoryCarousel6 = publicWidget.Widget.extend({
            selector: '#pg_v_3_myourteam',
            start: function () {
                this.$el.owlCarousel({
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
            }
        });
        
        publicWidget.registry.CustomCategoryCarousel7 = publicWidget.Widget.extend({
            selector: '#pg_v_5_myourteam',
            start: function () {
                this.$el.owlCarousel({
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
            }
        });
});;





