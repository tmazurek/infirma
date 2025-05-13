const express = require('express');
const router = express.Router();
const Invoice = require('../models/invoice');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

// GET /api/invoices
// Retrieve all invoices
router.get('/', (req, res) => {
  Invoice.getAllInvoices((err, invoices) => {
    if (err) {
      console.error('Error retrieving invoices:', err);
      return res.status(500).json({ error: 'Failed to retrieve invoices' });
    }

    res.json(invoices);
  });
});

// GET /api/invoices/:id
// Retrieve a specific invoice with its items
router.get('/:id', (req, res) => {
  const invoiceId = req.params.id;

  Invoice.getInvoiceById(invoiceId, (err, invoice) => {
    if (err) {
      if (err.message === 'Invoice not found') {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      console.error('Error retrieving invoice:', err);
      return res.status(500).json({ error: 'Failed to retrieve invoice' });
    }

    res.json(invoice);
  });
});

// POST /api/invoices
// Create a new invoice
router.post('/', (req, res) => {
  const invoiceData = {
    client_id: req.body.client_id,
    issue_date: req.body.issue_date,
    due_date: req.body.due_date,
    payment_terms: req.body.payment_terms,
    status: req.body.status,
    items: req.body.items || []
  };

  Invoice.createInvoice(invoiceData, (err, invoice) => {
    if (err) {
      if (err.message === 'Client, issue date, and at least one item are required') {
        return res.status(400).json({ error: err.message });
      }

      console.error('Error creating invoice:', err);
      return res.status(500).json({ error: 'Failed to create invoice' });
    }

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: invoice
    });
  });
});

// PATCH /api/invoices/:id/status
// Update an invoice's status
router.patch('/:id/status', (req, res) => {
  const invoiceId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  Invoice.updateInvoiceStatus(invoiceId, status, (err, result) => {
    if (err) {
      if (err.message === 'Invoice not found') {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      if (err.message === 'Invalid status. Must be Draft, Issued, or Paid') {
        return res.status(400).json({ error: err.message });
      }

      console.error('Error updating invoice status:', err);
      return res.status(500).json({ error: 'Failed to update invoice status' });
    }

    res.json({
      message: 'Invoice status updated successfully',
      result: result
    });
  });
});

// GET /api/invoices/:id/pdf
// Generate a PDF for a specific invoice
router.get('/:id/pdf', (req, res) => {
  const invoiceId = req.params.id;

  Invoice.getInvoiceById(invoiceId, (err, invoice) => {
    if (err) {
      if (err.message === 'Invoice not found') {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      console.error('Error retrieving invoice for PDF generation:', err);
      return res.status(500).json({ error: 'Failed to generate invoice PDF' });
    }

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoice_number}.pdf"`);

    // Generate the PDF and pipe it directly to the response
    generateInvoicePDF(invoice, res);
  });
});

module.exports = router;
