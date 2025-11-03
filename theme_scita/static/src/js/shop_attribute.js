/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.ScitaProductPreviewAttribute = publicWidget.Widget.extend({
    selector: ".scita_attribute_select",
    events: {
        "mouseenter .scita_attribute_li": "_onMouseEnterSwatch",
        "mouseleave": "_onMouseLeave",
    },
    start: function () {
        this.imageEl = this.el.closest('form').querySelector('img');
        return this._super.apply(this, arguments);
    },
    _onMouseEnterSwatch: function (ev) {
        const element = ev.currentTarget.querySelector('label, a.css_attribute_color');
        if (element && element.dataset.previewImgSrc) {
            this._updateImgSrc(element.dataset.previewImgSrc);
            ev.currentTarget.classList.add("active");
        }
    },
    _onMouseLeave: function () {
        this._updateImgSrc();
    },
    _updateImgSrc: function (src=false) {
        this.imageEl.src = src || this.el.dataset.defaultImgSrc;
    },
});