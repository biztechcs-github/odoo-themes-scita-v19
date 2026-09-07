# -*- coding: utf-8 -*-
# Part of AppJetty. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    def _scita_bulk_price_rules(self, pricelist, variant=None):
        """Bulk-buy tiers that really apply to ``variant`` of this template.

        A tier is a pricelist rule with a fixed price, a minimum quantity of at
        least 2 and, when it targets a specific variant, that variant.  Rules
        outside their validity dates are skipped.  Each one applies from its
        quantity upwards, not at that quantity alone.

        The product page template and ``/website_sale/get_combination_info``
        both go through here so the buttons and the displayed price can never
        disagree on which tier applies.

        :return: list of ``{'min_quantity': int, 'fixed_price': float}``,
                 sorted by ascending quantity.
        """
        self.ensure_one()
        if not pricelist:
            return []

        variant_id = variant and variant.id
        now = fields.Datetime.now()
        rules = pricelist.item_ids.filtered(
            lambda r: r.product_tmpl_id.id == self.id
            and r._scita_is_bulk_tier()
            and (not r.product_id or (variant_id and r.product_id.id == variant_id))
            and (not r.date_start or r.date_start <= now)
            and (not r.date_end or r.date_end >= now)
        )
        return [
            {
                'min_quantity': int(rule.min_quantity),
                'fixed_price': rule.fixed_price,
                # Mirrors the leading term of product.pricelist.item._order
                # ("applied_on, min_quantity desc"): a rule aimed at one variant
                # outranks a template-wide one whatever their quantities, so
                # _scita_bulk_price_for_qty can land on the rule Odoo lands on.
                'variant_rule': bool(rule.product_id),
            }
            for rule in rules.sorted(key=lambda r: r.min_quantity)
        ]

    @api.model
    def _scita_bulk_price_for_qty(self, bulk_rules, quantity):
        """Fixed price of the best tier ``quantity`` reaches, or None.

        ``min_quantity`` is a threshold, so a "2 at 20.00" tier covers 2, 3,
        4... and a "5 at 10.00" tier takes over from 5 upwards.

        Among the tiers the quantity clears, the winner is picked the way
        ``_compute_price_rule`` picks one: it walks items in
        ``product.pricelist.item._order`` - ``applied_on`` first, then
        ``min_quantity desc`` - and stops at the first that applies. So a
        variant rule beats a template rule regardless of quantity, and only
        between rules of equal reach does the larger quantity win.
        """
        applicable = [r for r in bulk_rules if quantity >= r['min_quantity']]
        if not applicable:
            return None
        best = max(
            applicable,
            key=lambda r: (r.get('variant_rule', False), r['min_quantity']),
        )
        return best['fixed_price']
