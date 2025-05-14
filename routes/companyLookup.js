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

    // Parse address information
    let fullAddress = '';
    let city = '';
    let postalCode = '';

    // Use workingAddress if available, otherwise use residenceAddress
    fullAddress = company.workingAddress || company.residenceAddress || '';

    // Try to extract postal code and city from the address
    // Polish postal codes are in format XX-XXX
    const postalCodeMatch = fullAddress.match(/\d{2}-\d{3}/);
    if (postalCodeMatch) {
      postalCode = postalCodeMatch[0];
    }

    // Extract city - typically after the postal code
    if (postalCode) {
      const parts = fullAddress.split(postalCode);
      if (parts.length > 1) {
        // The city is typically after the postal code
        city = parts[1].trim();

        // If there's a comma before the postal code, the street is before it
        const streetParts = parts[0].split(',');
        if (streetParts.length > 0) {
          fullAddress = streetParts[0].trim();
        }
      }
    } else {
      // If no postal code found, try to split by comma
      const parts = fullAddress.split(',');
      if (parts.length > 1) {
        // Last part might contain city
        const lastPart = parts[parts.length - 1].trim();
        // Check if the last part has a city format (no numbers typically)
        if (!/\d/.test(lastPart)) {
          city = lastPart;
          // Remove the city part from the address
          fullAddress = parts.slice(0, parts.length - 1).join(',').trim();
        }
      }
    }

    const companyInfo = {
      name: company.name,
      nip: company.nip,
      status: company.statusVat,
      regon: company.regon,
      address: {
        street: fullAddress,
        city: city,
        postalCode: postalCode
      }
    };

    res.json(companyInfo);
  } catch (error) {
    console.error('Error looking up company:', error);
    res.status(500).json({ error: 'Failed to lookup company information' });
  }
});

module.exports = router;
