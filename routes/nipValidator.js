const express = require('express');
const router = express.Router();
const { validateNip } = require('../utils/nipValidator');

// GET /api/validate-nip/:nip
// Validate a NIP and fetch company data
router.get('/:nip', (req, res) => {
  const nip = req.params.nip;
  
  validateNip(nip)
    .then(companyData => {
      res.json({
        success: true,
        data: companyData
      });
    })
    .catch(error => {
      res.status(400).json({
        success: false,
        error: error.message
      });
    });
});

module.exports = router;
