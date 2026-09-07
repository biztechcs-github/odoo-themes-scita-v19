# -*- coding: utf-8 -*-
# Part of AppJetty. See LICENSE file for full copyright and licensing details.

from odoo import models


class ProductPricelistItem(models.Model):
    _inherit = 'product.pricelist.item'

    def _scita_is_bulk_tier(self):
        """A rule the theme advertises as a "bulk buy" button on the product page.

        Pricing itself is left to Odoo: ``min_quantity`` is a threshold, so a
        "2 units at 20.00" tier prices 2, 3, 4... at 20.00, and where a second
        tier such as "5 units at 10.00" also qualifies, the higher one wins -
        ``_order`` sorts items ``min_quantity desc`` and ``_compute_price_rule``
        stops at the first applicable rule. This predicate only decides which
        rules get a button.
        """
        self.ensure_one()
        return self.compute_price == 'fixed' and self.min_quantity and self.min_quantity >= 2
