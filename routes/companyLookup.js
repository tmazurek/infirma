const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// GET /api/company-lookup?nip=XXXXXXXXXX
// Lookup company information by NIP using the Polish government API
router.get('/', async (req, res) => {
  const nip = req.query.nip;
  
  if (!nip) {
    return res.status(400).json({ error: 'NIP parameter is required' });
  }
  
  try {
    // Format the NIP by removing any non-digit characters
    const formattedNip = nip.replace(/[^0-9]/g, '');
    
    // Validate NIP format
    if (formattedNip.length !== 10) {
      return res.status(400).json({ error: 'NIP must be 10 digits' });
    }
    
    // Call the Polish government API
    const apiUrl = `https://wl-api.mf.gov.pl/api/search/nip/${formattedNip}?date=${new Date().toISOString().split('T')[0]}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Error from government API', 
        details: data 
      });
    }
    
    if (!data.result || !data.result.subject) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    // Extract relevant company information
    const company = data.result.subject;
    const companyInfo = {
      name: company.name,
      nip: company.nip,
      status: company.statusVat,
      regon: company.regon,
      address: {
        street: company.workingAddress ? company.workingAddress : '',
        city: company.residenceAddress ? company.residenceAddress : '',
        postalCode: ''
      }
    };
    
    res.json(companyInfo);
  } catch (error) {
    console.error('Error looking up company:', error);
    res.status(500).json({ error: 'Failed to lookup company information' });
  }
});

module.exports = router;
