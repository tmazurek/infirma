const express = require('express');
const router = express.Router();
const CompanyProfile = require('../models/companyProfile');

// GET /api/company-profile
// Retrieve the company profile
router.get('/', (req, res) => {
  CompanyProfile.getProfile((err, profile) => {
    if (err) {
      console.error('Error retrieving company profile:', err);
      return res.status(500).json({ error: 'Failed to retrieve company profile' });
    }

    if (!profile) {
      return res.status(404).json({ message: 'No company profile found' });
    }

    res.json(profile);
  });
});

// POST /api/company-profile
// Create or update the company profile
router.post('/', (req, res) => {
  const profileData = {
    company_name: req.body.company_name,
    nip: req.body.nip,
    street_address: req.body.street_address,
    city: req.body.city,
    postal_code: req.body.postal_code,
    bank_account_number: req.body.bank_account_number,
    default_vat_rate: req.body.default_vat_rate,
    zus_base_amount: req.body.zus_base_amount,
    zus_retirement_rate: req.body.zus_retirement_rate,
    zus_disability_rate: req.body.zus_disability_rate,
    zus_accident_rate: req.body.zus_accident_rate,
    zus_sickness_rate: req.body.zus_sickness_rate,
    zus_labor_fund_rate: req.body.zus_labor_fund_rate,
    zus_fep_rate: req.body.zus_fep_rate,
    zus_health_insurance_amount: req.body.zus_health_insurance_amount,
    zus_health_insurance_income_threshold: req.body.zus_health_insurance_income_threshold
  };

  CompanyProfile.saveProfile(profileData, (err, savedProfile) => {
    if (err) {
      console.error('Error saving company profile:', err);

      if (err.message === 'Company name and NIP are required') {
        return res.status(400).json({ error: err.message });
      }

      return res.status(500).json({ error: 'Failed to save company profile' });
    }

    res.status(200).json({
      message: 'Company profile saved successfully',
      profile: savedProfile
    });
  });
});

module.exports = router;
