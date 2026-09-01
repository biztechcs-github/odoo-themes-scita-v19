/** @odoo-module **/

/**
 * Load the portal chatter bundle when the reviews are actually opened.
 *
 * portal/static/src/chatter/boot/boot_service.js loads `portal.assets_chatter`
 * as soon as it finds a `.o_portal_chatter` element anywhere in the page. On a
 * product page that element always exists - it is the Reviews tab that this
 * theme adds in views/product_details_template.xml - but it is inside a
 * Bootstrap tab-pane, so it is off screen and behind a click that most visitors
 * never make.
 *
 * The cost of loading it anyway, measured on the 21 Aug 2026 mobile run of
 * /shop/iphone-16-295: a 334ms long task for portal.assets_chatter plus a
 * 112ms one for web.assets_emoji (the chatter pulls in the emoji picker),
 * against a Total Blocking Time of 541ms for the whole page. Nearly all of the
 * page's blocking time was spent building a UI nobody had asked for yet.
 *
 * So: keep the service, keep its behaviour, and move the trigger. The bundle is
 * requested the moment the visitor shows any intent to read reviews - clicking
 * the tab, or the tab-pane becoming visible for any other reason (a #reviews
 * deep link, or a portal page where the chatter is not behind a tab at all).
 * Both paths end in the same `loadBundle` call the original service made, so
 * everything downstream - `odoo.portalChatterReady`, the chatter mount - is
 * unchanged apart from happening later.
 *
 * If neither trigger ever fires, the bundle is never loaded. That is the point.
 */

import { registry } from '@web/core/registry';
import { loadBundle } from '@web/core/assets';

const services = registry.category('services');

// Guarded: portal is a dependency of this theme, but the service only exists
// once portal's own assets are in the bundle, and a theme should never be the
// reason a page fails to boot.
if (services.contains('portal.chatter.boot')) {
    const original = services.get('portal.chatter.boot');

    services.add('portal.chatter.boot', {
        ...original,
        start(...args) {
            const chatterEl = document.querySelector('.o_portal_chatter');
            if (!chatterEl) {
                return;
            }

            let requested = false;
            const load = () => {
                if (requested) {
                    return;
                }
                requested = true;
                loadBundle('portal.assets_chatter');
            };

            // Anything that opens the Reviews tab. Both attribute forms are
            // matched because the theme's own tab uses href and Bootstrap 5
            // markup elsewhere uses data-bs-target.
            const paneId = chatterEl.closest('.tab-pane')?.id;
            if (paneId) {
                const selector = `[href="#${paneId}"], [data-bs-target="#${paneId}"]`;
                for (const el of document.querySelectorAll(selector)) {
                    el.addEventListener('click', load, { once: true });
                }
            }

            // ...and the general case: the chatter becoming visible. This is
            // what covers portal pages where it is not in a tab, and a visitor
            // arriving on /shop/<product>#reviews. An element inside a hidden
            // tab-pane never intersects, so this does not defeat the above.
            if (window.IntersectionObserver) {
                const observer = new IntersectionObserver((entries) => {
                    if (entries.some((entry) => entry.isIntersecting)) {
                        observer.disconnect();
                        load();
                    }
                }, { rootMargin: '200px' });
                observer.observe(chatterEl);
            } else {
                load();
            }
        },
    }, { force: true });
}
