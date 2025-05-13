const express = require('express');
const router = express.Router();
const { calculateFinancialSummary } = require('../utils/taxCalculator');

// GET /api/financial-summary
// Retrieve financial summary for a given month and year
router.get('/', (req, res) => {
  // Extract month and year from query parameters
  const month = parseInt(req.query.month);
  const year = parseInt(req.query.year);
  
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
    
    res.json(summary);
  });
});

module.exports = router;
