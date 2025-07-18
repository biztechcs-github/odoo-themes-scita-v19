 /** @odoo-module **/

 import publicWidget from "@web/legacy/js/public/public_widget";

 publicWidget.registry.featherIcon = publicWidget.Widget.extend({
     selector: '#wrapwrap',

     start: function () {
        this._super(...arguments);
    
        if (window.feather) {
            feather.replace();
        } else {
            console.warn("Feather Icons library not loaded.");
        }

        return Promise.resolve();
    },
 });


