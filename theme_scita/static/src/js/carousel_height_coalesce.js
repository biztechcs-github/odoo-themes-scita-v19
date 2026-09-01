/** @odoo-module **/

/**
 * Measure every carousel slide in one reflow instead of one reflow per slide.
 *
 * website/static/src/interactions/carousel/carousel_slider.js keeps the slides a
 * uniform height by measuring the tallest one:
 *
 *     for (const itemEl of this.el.querySelectorAll(".carousel-item")) {
 *         itemEl.classList.add("active");          // write
 *         const height = itemEl.offsetHeight;      // read  -> forced reflow
 *         itemEl.classList.toggle("active", isActive);  // write
 *     }
 *
 * Writing a class and then reading offsetHeight inside the same iteration is
 * layout thrashing: the browser cannot batch the work, so it re-runs layout for
 * the whole document once per slide. Against this theme's 1.5MB stylesheet and
 * ~2,000 node pages that is expensive - profiled at 169-188ms on
 * /shop/iphone-16-295 under 4x CPU throttling, the single most expensive
 * JavaScript function on the page, and what Lighthouse reports as "Forced
 * reflow". The method also runs again on every carousel image `load`, so a
 * four-image product carousel pays it repeatedly.
 *
 * Same measurement, same result, one reflow: make every slide active in one
 * pass of writes, read all the heights in a second pass, then restore. A
 * non-active .carousel-item is `display: none`, so the original code has to
 * make each one active to measure it - but nothing requires that to happen one
 * at a time. Bootstrap floats the items with `margin-right: -100%`, so several
 * being active at once overlaps them horizontally without changing any
 * individual item's height, which is the only thing being read.
 *
 * The repeated post-load calls are coalesced into a single animation frame on
 * top of that. The measurement start() asks for stays synchronous: that one is
 * what gives the slides a min-height before anything has loaded, and deferring
 * it would trade main-thread time for a layout shift.
 *
 * If a future Odoo release fixes the read/write interleaving upstream, delete
 * this file - it is a straight reimplementation of one method and nothing else
 * depends on it.
 */

import { patch } from '@web/core/utils/patch';
import { CarouselSlider } from '@website/interactions/carousel/carousel_slider';

patch(CarouselSlider.prototype, {
    computeMaxHeight() {
        if (this.__scitaHeightMeasured) {
            // A later call, from an image finishing. Let the frame settle so
            // four images arriving together are measured once, not four times.
            if (this.__scitaHeightQueued) {
                return;
            }
            this.__scitaHeightQueued = true;
            this.waitForAnimationFrame(() => {
                this.__scitaHeightQueued = false;
                this.scitaMeasureSlides();
                this.updateContent();
            });
            return;
        }
        this.__scitaHeightMeasured = true;
        this.scitaMeasureSlides();
    },

    scitaMeasureSlides() {
        this.maxHeight = undefined;
        // Reset the min-height before measuring, exactly as the original does -
        // otherwise every slide reports at least the previous maximum.
        this.updateContent();

        const itemEls = [...this.el.querySelectorAll('.carousel-item')];
        if (!itemEls.length) {
            return;
        }
        const wasActive = itemEls.map((el) => el.classList.contains('active'));

        for (const itemEl of itemEls) {
            itemEl.classList.add('active');
        }
        let maxHeight;
        for (const itemEl of itemEls) {
            // offsetHeight rather than getBoundingClientRect, for the same
            // reason the original gives: the snippet dialog scales its preview
            // rows with a transform, which getBoundingClientRect would include.
            const height = itemEl.offsetHeight;
            if (maxHeight === undefined || height > maxHeight) {
                maxHeight = height;
            }
        }
        itemEls.forEach((itemEl, index) => itemEl.classList.toggle('active', wasActive[index]));

        this.maxHeight = maxHeight;
    },
});
