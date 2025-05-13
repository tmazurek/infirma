const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');

// GET /api/expenses
// Retrieve all expenses with optional filtering
router.get('/', (req, res) => {
  // Extract filter parameters from query string
  const filters = {};
  
  if (req.query.startDate) {
    filters.startDate = req.query.startDate;
  }
  
  if (req.query.endDate) {
    filters.endDate = req.query.endDate;
  }
  
  if (req.query.category) {
    filters.category = req.query.category;
  }
  
  Expense.getAllExpenses(filters, (err, expenses) => {
    if (err) {
      console.error('Error retrieving expenses:', err);
      return res.status(500).json({ error: 'Failed to retrieve expenses' });
    }
    
    res.json(expenses);
  });
});

// GET /api/expenses/categories
// Retrieve all distinct expense categories
router.get('/categories', (req, res) => {
  Expense.getCategories((err, categories) => {
    if (err) {
      console.error('Error retrieving expense categories:', err);
      return res.status(500).json({ error: 'Failed to retrieve expense categories' });
    }
    
    res.json(categories);
  });
});

// GET /api/expenses/:id
// Retrieve a specific expense
router.get('/:id', (req, res) => {
  const expenseId = req.params.id;
  
  Expense.getExpenseById(expenseId, (err, expense) => {
    if (err) {
      if (err.message === 'Expense not found') {
        return res.status(404).json({ error: 'Expense not found' });
      }
      
      console.error('Error retrieving expense:', err);
      return res.status(500).json({ error: 'Failed to retrieve expense' });
    }
    
    res.json(expense);
  });
});

// POST /api/expenses
// Create a new expense
router.post('/', (req, res) => {
  const expenseData = {
    expense_date: req.body.expense_date,
    vendor_name: req.body.vendor_name,
    description: req.body.description,
    amount_net: req.body.amount_net,
    vat_amount_paid: req.body.vat_amount_paid,
    amount_gross: req.body.amount_gross,
    category: req.body.category,
    invoice_scan_url_optional: req.body.invoice_scan_url_optional
  };
  
  Expense.createExpense(expenseData, (err, expense) => {
    if (err) {
      if (err.message === 'Expense date, description, and gross amount are required') {
        return res.status(400).json({ error: err.message });
      }
      
      console.error('Error creating expense:', err);
      return res.status(500).json({ error: 'Failed to create expense' });
    }
    
    res.status(201).json({
      message: 'Expense created successfully',
      expense: expense
    });
  });
});

// PUT /api/expenses/:id
// Update an existing expense
router.put('/:id', (req, res) => {
  const expenseId = req.params.id;
  const expenseData = {
    expense_date: req.body.expense_date,
    vendor_name: req.body.vendor_name,
    description: req.body.description,
    amount_net: req.body.amount_net,
    vat_amount_paid: req.body.vat_amount_paid,
    amount_gross: req.body.amount_gross,
    category: req.body.category,
    invoice_scan_url_optional: req.body.invoice_scan_url_optional
  };
  
  Expense.updateExpense(expenseId, expenseData, (err, expense) => {
    if (err) {
      if (err.message === 'Expense not found') {
        return res.status(404).json({ error: 'Expense not found' });
      }
      
      if (err.message === 'Expense date, description, and gross amount are required') {
        return res.status(400).json({ error: err.message });
      }
      
      console.error('Error updating expense:', err);
      return res.status(500).json({ error: 'Failed to update expense' });
    }
    
    res.json({
      message: 'Expense updated successfully',
      expense: expense
    });
  });
});

// DELETE /api/expenses/:id
// Delete an expense
router.delete('/:id', (req, res) => {
  const expenseId = req.params.id;
  
  Expense.deleteExpense(expenseId, (err, result) => {
    if (err) {
      if (err.message === 'Expense not found' || err.message === 'Expense not found or already deleted') {
        return res.status(404).json({ error: 'Expense not found' });
      }
      
      console.error('Error deleting expense:', err);
      return res.status(500).json({ error: 'Failed to delete expense' });
    }
    
    res.json({
      message: 'Expense deleted successfully',
      result: result
    });
  });
});

module.exports = router;
