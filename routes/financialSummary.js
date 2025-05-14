const express = require('express');
const router = express.Router();
const { calculateFinancialSummary } = require('../utils/taxCalculator');

// GET /api/financial-summary
// Retrieve financial summary for a given month and year
router.get('/', (req, res) => {
  // Extract month and year from query parameters, default to current month/year if not provided
  let month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1;
  let year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

  // Validate month and year
  if (isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Invalid month. Must be between 1 and 12.' });
  }

  if (isNaN(year) || year < 2000 || year > 2100) {
    return res.status(400).json({ error: 'Invalid year. Must be between 2000 and 2100.' });
  }

  // Calculate financial summary
  calculateFinancialSummary(month, year, (err, summary) => {
    if (err) {
      console.error('Error calculating financial summary:', err);
      return res.status(500).json({ error: 'Failed to calculate financial summary' });
    }

    // Ensure all required properties exist in the response
    if (!summary.vat) summary.vat = { vat_income: 0, vat_expenses: 0, vat_due: 0 };
    if (!summary.pit) summary.pit = { income: 0, expenses: 0, taxable_income: 0, income_tax: 0 };
    if (!summary.zus) summary.zus = {
      retirement: 0,
      disability: 0,
      accident: 0,
      sickness: 0,
      labor_fund: 0,
      fep: 0,
      health_insurance: 0,
      social_insurance_total: 0,
      total: 0
    };

    res.json(summary);
  });
});

module.exports = router;
