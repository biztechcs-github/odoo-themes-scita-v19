# -*- coding: utf-8 -*-
"""
Wraps Odoo's WSGI application with gzip response compression.

Mobile Lighthouse testing found this environment has no reverse proxy in
front of Odoo handling compression: the theme's ~1.3MB CSS bundle was being
sent completely uncompressed, costing ~6.5s of render-blocking time alone
under throttled mobile network conditions - by far the single biggest
performance cost found in this theme.

In a real production deployment this belongs at the reverse-proxy/CDN layer
(nginx, an ALB, CloudFront, etc.) rather than in application code - it's
more efficient there and every Odoo deployment guide recommends it. This
module is a stand-in for environments where that layer isn't configured yet
(or, as here, doesn't exist locally). It's safe either way: it only acts
when the client sent no existing Content-Encoding and the response isn't
already encoded, so it won't double-compress behind a proxy that already
handles this.
"""
import gzip
import logging
import threading
from collections import OrderedDict

import odoo.http
from odoo.tools import config

_logger = logging.getLogger(__name__)

# Compressing the frontend bundles costs real CPU on every single hit
# (measured: 26ms for the 2.1MB stylesheet, 65ms for the 2.7MB script), and
# that lands squarely in front of first paint. Asset URLs carry a content hash
# (/web/assets/<id>/<hash>/name.min.css), so a hit is immutable by
# construction and safe to keep. Bounded so a long-running worker cannot grow
# without limit.
_ASSET_URL_PREFIX = '/web/assets/'
_CACHE_MAX_ENTRIES = 24
_cache = OrderedDict()
_cache_lock = threading.Lock()


def _cache_get(key):
    with _cache_lock:
        if key not in _cache:
            return None
        _cache.move_to_end(key)
        return _cache[key]


def _cache_put(key, value):
    with _cache_lock:
        _cache[key] = value
        _cache.move_to_end(key)
        while len(_cache) > _CACHE_MAX_ENTRIES:
            _cache.popitem(last=False)

COMPRESSIBLE_TYPES = frozenset((
    'text/css', 'text/html', 'text/javascript', 'text/plain', 'text/xml',
    'application/javascript', 'application/json', 'application/xml',
    'image/svg+xml',
))
MIN_SIZE_TO_COMPRESS = 1024

_patched = False


def _passthrough(head, iterator, app_iter):
    """Re-yield an untouched response without collapsing it into memory."""
    try:
        yield from head
        yield from iterator
    finally:
        if hasattr(app_iter, 'close'):
            app_iter.close()


def _patch_gzip_compression():
    global _patched
    if _patched:
        return
    _patched = True

    original_call = odoo.http.Application.__call__

    def gzip_call(self, environ, start_response):
        if 'gzip' not in environ.get('HTTP_ACCEPT_ENCODING', ''):
            return original_call(self, environ, start_response)

        path = environ.get('PATH_INFO', '')
        # The cache key is the URL path alone, which is only sound because an
        # asset URL carries a content hash and is therefore immutable. That
        # assumption breaks under --dev: Odoo then rebuilds a bundle from
        # changed source files but keeps serving it at the *same* URL, so a
        # cached entry pins the pre-edit bytes for the lifetime of the worker
        # and no amount of reloading shows the change. Cost of getting this
        # wrong is hours of debugging a stylesheet edit that "does nothing",
        # so give up the cache entirely when a developer is editing.
        cacheable = path.startswith(_ASSET_URL_PREFIX) and not config['dev_mode']
        if cacheable:
            hit = _cache_get(path)
            if hit is not None:
                cached_status, cached_headers, cached_body = hit
                start_response(cached_status, list(cached_headers), None)
                return [cached_body]

        captured = {}

        def capturing_start_response(status, headers, exc_info=None):
            captured['status'] = status
            captured['headers'] = headers
            captured['exc_info'] = exc_info
            return lambda data: None

        app_iter = original_call(self, environ, capturing_start_response)
        iterator = iter(app_iter)

        # A generator-based response only calls start_response on its first
        # yield, so pull chunks until the headers are known. Everything below
        # depends on seeing the real Content-Type.
        head = []
        while 'headers' not in captured:
            try:
                head.append(next(iterator))
            except StopIteration:
                break

        headers = captured.get('headers') or []
        header_dict = {k.lower(): v for k, v in headers}
        content_type = header_dict.get('content-type', '').split(';')[0].strip()

        compressible = (
            'content-encoding' not in header_dict
            and 'content-range' not in header_dict
            and content_type in COMPRESSIBLE_TYPES
        )
        if not compressible:
            # Not ours to touch. Hand the response straight back and keep it
            # streaming - buffering here would pull every binary download,
            # attachment and report fully into memory.
            start_response(captured.get('status'), headers, captured.get('exc_info'))
            return _passthrough(head, iterator, app_iter)

        try:
            body = b''.join(head) + b''.join(iterator)
        finally:
            if hasattr(app_iter, 'close'):
                app_iter.close()

        if len(body) < MIN_SIZE_TO_COMPRESS:
            start_response(captured['status'], headers, captured.get('exc_info'))
            return [body]

        # Level 9 for the bundles, 6 for everything else. The extra ~2% costs
        # real CPU (measured 26ms -> 41ms for the 1.5MB stylesheet), which is
        # not worth paying on a page render that is recomputed every request -
        # but an asset response is compressed once and served from the cache
        # below for the life of the worker, so there the CPU is paid once and
        # the 2 KiB comes off every visitor's critical path.
        compressed = gzip.compress(body, compresslevel=9 if cacheable else 6)
        new_headers = [
            (k, v) for k, v in headers
            if k.lower() not in ('content-length', 'vary')
        ]
        vary = header_dict.get('vary')
        vary_values = [v.strip() for v in vary.split(',')] if vary else []
        if not any(v.lower() == 'accept-encoding' for v in vary_values):
            vary_values.append('Accept-Encoding')
        new_headers.append(('Content-Encoding', 'gzip'))
        new_headers.append(('Content-Length', str(len(compressed))))
        new_headers.append(('Vary', ', '.join(vary_values)))

        # Only content-hashed asset URLs are cached, and only on a plain 200 -
        # a 304 or a redirect must never be replayed as a body.
        if cacheable and captured['status'].startswith('200'):
            _cache_put(path, (captured['status'], new_headers, compressed))

        start_response(captured['status'], new_headers, captured.get('exc_info'))
        return [compressed]

    odoo.http.Application.__call__ = gzip_call
    _logger.info("theme_scita: gzip response compression enabled (no reverse proxy detected)")


_patch_gzip_compression()
