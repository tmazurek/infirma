const express = require('express');
const router = express.Router();
const CompanyProfile = require('../models/companyProfile');

// GET /api/zus-settings
// Retrieve ZUS settings from company profile
router.get('/', (req, res) => {
  CompanyProfile.getProfile((err, profile) => {
    if (err) {
      console.error('Error retrieving ZUS settings:', err);
      return res.status(500).json({ error: 'Failed to retrieve ZUS settings' });
    }

    if (!profile) {
      return res.status(404).json({ message: 'No ZUS settings found' });
    }

    // Extract ZUS-related fields from company profile
    const zusSettings = {
      zus_base_amount: profile.zus_zus_base_amount,
      retirement_rate: profile.zus_retirement_rate,
      disability_rate: profile.zus_disability_rate,
      accident_rate: profile.zus_accident_rate,
      zus_sickness_rate: profile.zus_zus_sickness_rate,
      sickness_optional: profile.zus_sickness_optional,
      health_insurance: profile.zus_health_insurance_amount,
      labor_fund_rate: profile.zus_labor_fund_rate,
      fep_rate: profile.zus_fep_rate,
      fep_optional: profile.zus_fep_optional,
      health_insurance_income_threshold: profile.zus_health_insurance_income_threshold
    };

    res.json(zusSettings);
  });
});

// POST /api/zus-settings
// Update ZUS settings in company profile
router.post('/', (req, res) => {
  // First, get the existing profile
  CompanyProfile.getProfile((err, profile) => {
    if (err) {
      console.error('Error retrieving company profile for ZUS update:', err);
      return res.status(500).json({ error: 'Failed to retrieve company profile for ZUS update' });
    }

    // If no profile exists, return error
    if (!profile) {
      return res.status(404).json({ error: 'Company profile not found. Please create a company profile first.' });
    }

    // Update ZUS settings in the profile
    const updatedProfile = {
      ...profile,
      zus_zus_base_amount: req.body.zus_base_amount,
      zus_retirement_rate: req.body.retirement_rate,
      zus_disability_rate: req.body.disability_rate,
      zus_accident_rate: req.body.accident_rate,
      zus_zus_sickness_rate: req.body.zus_sickness_rate,
      zus_sickness_optional: req.body.sickness_optional,
      zus_health_insurance_amount: req.body.health_insurance,
      zus_labor_fund_rate: req.body.labor_fund_rate,
      zus_fep_rate: req.body.fep_rate,
      zus_fep_optional: req.body.fep_optional,
      zus_health_insurance_income_threshold: req.body.health_insurance_income_threshold || 'low'
    };

    // Save the updated profile
    CompanyProfile.saveProfile(updatedProfile, (err, savedProfile) => {
      if (err) {
        console.error('Error saving ZUS settings:', err);
        return res.status(500).json({ error: 'Failed to save ZUS settings' });
      }

      // Extract ZUS settings from saved profile for response
      const savedZusSettings = {
        zus_base_amount: savedProfile.zus_zus_base_amount,
        retirement_rate: savedProfile.zus_retirement_rate,
        disability_rate: savedProfile.zus_disability_rate,
        accident_rate: savedProfile.zus_accident_rate,
        zus_sickness_rate: savedProfile.zus_zus_sickness_rate,
        sickness_optional: savedProfile.zus_sickness_optional,
        health_insurance: savedProfile.zus_health_insurance_amount,
        labor_fund_rate: savedProfile.zus_labor_fund_rate,
        fep_rate: savedProfile.zus_fep_rate,
        fep_optional: savedProfile.zus_fep_optional,
        health_insurance_income_threshold: savedProfile.zus_health_insurance_income_threshold
      };

      res.status(200).json({
        message: 'ZUS settings saved successfully',
        settings: savedZusSettings
      });
    });
  });
});

module.exports = router;
