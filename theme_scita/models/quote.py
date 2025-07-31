# -*- coding: utf-8 -*-

from odoo import api, fields, models

class QuoteRequest(models.Model):
    """Creating a model to record all the request the get from website."""
    _name = 'quote.request'
    _description = 'Request for Quotation'
    _rec_name = 'product_id'

    first_name = fields.Char(string="First Name", help="User's given name")
    last_name = fields.Char(string="Last Name", help="User's surname")
    product_id = fields.Many2one('product.template', string="Product",
                                 help="The item for which a price quote is requested")
    email = fields.Char(string="Email", help="User's email address for communication")
    phone = fields.Char(string="Contact No.",
                        help="User's phone number for contact purposes")
    quantity = fields.Integer(string="Quantity",
                              help="The quantity of the item for which the price is requested")
    message = fields.Char(string="Message",
                          help="Additional notes or comments for reference")
    state = fields.Selection(
        [('draft', 'Draft'), ('done', 'Done'), ('cancel', 'Cancel')],
        default="draft", help="Stage of the quote request process")

    def action_done(self):
        """Updates the price of the requested item and sets the form state to 'Done'"""
        self.write({'state': 'done'})

    def action_cancel(self):
        """Cancels the form and updates the state to 'Cancel'"""
        self.write({'state': 'cancel'})

    @api.model
    def create_form(self, first, last, product_id, phone, email, message, qty):
        """ Creates a quote request from user input for processing by the team"""
        self.create({
            'product_id': product_id,
            'first_name': first,
            'last_name': last,
            'phone': phone,
            'email': email,
            'quantity': qty,
            'message': message
        })
