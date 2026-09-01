# -*- coding: utf-8 -*-
"""
Stop the first images on a page from being lazy-loaded.

Odoo defaults every website <img> to loading="lazy"
(addons/website/models/ir_qweb.py, _post_processing_att). That is right for
the long tail of a page, but it also applies to whatever turns out to be the
LCP element, and Lighthouse penalises exactly that: "LCP resources should not
use loading=lazy", plus a 180ms resource load delay on the mobile run of
13 Aug 2026.

The LCP element lives in saved page content, not in a theme template, so it
cannot be tagged by hand. Counting images per request and eagerly loading the
leading ones is the general lever available server-side: the first handful of
images in document order are the above-the-fold ones on every layout this
theme ships.
"""
import re

from odoo import models
from odoo.http import request

# Enough for the first row of product cards.
#
# This was 1, on the reasoning that every extra eager image competes with the
# LCP image for the same throttled connection. That holds when the LCP element
# is a single hero, as on the home page. It is wrong on /shop, where the
# above-the-fold content is a *grid*: Lighthouse picked the second card's
# image as the LCP element on the 21 Aug 2026 mobile run, and being the second
# image it was still loading="lazy" - discovered late and fetched at Low
# priority, for a measured 489ms of LCP resource load delay.
#
# Two is the first row on Lighthouse's 412px viewport (the desktop grid is
# wider, but its cards are proportionally smaller, so the same two are what a
# fold-height LCP can land on). The cost is one extra ~10 KiB image_256
# thumbnail on the wire, which is what image_256 made affordable - at
# image_1024 this trade would not have been worth making.
EAGER_IMAGE_COUNT = 2

# Below this, in either dimension, an <img> is chrome (menu/category icons
# etc.), never the LCP candidate - same threshold _scita_lcp_preload_href
# already uses when scanning view arch for the same purpose. Icons like the
# header's "All Categories" burger (18x14) render as plain <img> tags, same
# as the hero/content image, so without this they can consume the one eager
# slot before the real content image is even reached.
_ICON_MAX_SIZE = 200

# An Odoo image URL states its own size, and that is a better signal than the
# width/height attributes because most of this theme's <img> tags carry
# neither. Both shapes appear on these pages:
#   /web/image/product.product/272/image_128/name   -> the 128px variant
#   /web/image/product.template/227/image_1920/80x80 -> resized to 80x80
# The second form is the one that matters: a request for the 1920 variant at
# 80x80 is a thumbnail, and reading only the `image_<n>` part would call it
# the largest image on the page. So the resize suffix wins when present.
_IMAGE_VARIANT_RE = re.compile(r'/image_(\d+)(?:/(?:[^/?"]*?/)?(\d+)x(\d+))?')


def _requested_image_size(atts):
    """Largest dimension the src asks Odoo for, or None if not an image URL."""
    src = atts.get('src') or ''
    match = _IMAGE_VARIANT_RE.search(src)
    if not match:
        return None
    if match.group(2):
        return max(int(match.group(2)), int(match.group(3)))
    return int(match.group(1))


# The hover/second image of a product card. It sits behind the primary one at
# opacity 0 until the card is hovered, so it is never a paint candidate - but
# it *is* the next <img> in document order after the primary, and would
# otherwise eat the eager slot meant for the next card.
_SECONDARY_IMAGE_CLASS = 'oe_product_image_img_secondary'


def _is_secondary_product_image(atts):
    return _SECONDARY_IMAGE_CLASS in (atts.get('class') or '')


def _is_icon_sized(atts):
    for key in ('width', 'height'):
        try:
            value = int(atts.get(key, 0) or 0)
        except (TypeError, ValueError):
            continue
        if 0 < value < _ICON_MAX_SIZE:
            return True
    return False


class IrQweb(models.AbstractModel):
    _inherit = 'ir.qweb'

    def _post_processing_att(self, tagName, atts):
        atts = super()._post_processing_att(tagName, atts)

        if tagName != 'img' or not request or atts.get('data-no-post-process'):
            return atts

        # Mirror the guards core uses before it touches attributes at all, so
        # the editor, translation mode and asset bundles are left alone.
        context = self.env.context
        if (context.get('inherit_branding') or context.get('rendering_bundle')
                or context.get('edit_translations') or context.get('debug')
                or request.session.debug):
            return atts

        if _is_icon_sized(atts) or _is_secondary_product_image(atts):
            return atts

        # Nothing this small is ever the LCP element. The check above only sees
        # declared width/height attributes, and almost no <img> in this theme
        # has them - so on the product page the two eager slots were going to
        # the carousel's own 128px thumbnail strip, which QWeb renders just
        # before the full-size photo it is a strip of, leaving the actual LCP
        # image on loading="lazy".
        requested_size = _requested_image_size(atts)
        if requested_size is not None and requested_size < _ICON_MAX_SIZE:
            return atts

        # website.py's _scita_lcp_preload_href already ran (it's called from
        # a <head> xpath that renders before body content) and resolved a
        # definitive answer for this request. Trust it over the "first img in
        # document order" guess below: when the real LCP is a CSS
        # background (the homepage hero carousel), no <img> src will ever
        # match, and correctly none should be eager-loaded - the guess
        # below would otherwise grab an unrelated first <img> (e.g. a
        # below-the-fold carousel banner) and steal High-priority bandwidth
        # from the actual LCP resource.
        if hasattr(request, '_scita_lcp_href'):
            if atts.get('src') and atts['src'] == request._scita_lcp_href:
                atts = dict(atts)
                atts['loading'] = 'eager'
                atts['fetchpriority'] = 'high'
            return atts

        seen = getattr(request, '_scita_img_seen', 0)
        if seen >= EAGER_IMAGE_COUNT:
            return atts
        request._scita_img_seen = seen + 1

        atts = dict(atts)
        atts['loading'] = 'eager'
        if seen == 0:
            # Fallback for requests where the head xpath above didn't run
            # (e.g. no main_object). Lighthouse's lcp-discovery check wants
            # fetchpriority=high on the LCP image; being wrong here costs a
            # little bandwidth priority, not correctness.
            atts['fetchpriority'] = 'high'
        return atts
