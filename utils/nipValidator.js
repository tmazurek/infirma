const https = require('https');

/**
 * Validates a NIP (Polish Tax ID) and fetches company data from the Ministry of Finance API
 * @param {string} nip - The NIP to validate (10 digits)
 * @returns {Promise<Object>} - Promise resolving to company data
 */
function validateNip(nip) {
  return new Promise((resolve, reject) => {
    // Basic NIP format validation
    if (!nip || !/^\d{10}$/.test(nip)) {
      return reject(new Error('NIP must be 10 digits'));
    }
    
    // Get current date in YYYY-MM-DD format for the API
    const today = new Date().toISOString().split('T')[0];
    
    // Construct the API URL
    const apiUrl = `https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${today}`;
    
    // Make the request to the Ministry of Finance API
    https.get(apiUrl, (res) => {
      let data = '';
      
      // A chunk of data has been received
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // The whole response has been received
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          
          // Check if the API returned an error
          if (parsedData.error) {
            return reject(new Error(parsedData.error.message || 'API Error'));
          }
          
          // Check if the API returned a valid result
          if (!parsedData.result || !parsedData.result.subject) {
            return reject(new Error('No data found for this NIP'));
          }
          
          // Extract the relevant company data
          const companyData = {
            name: parsedData.result.subject.name,
            nip: parsedData.result.subject.nip,
            regon: parsedData.result.subject.regon,
            address: parsedData.result.subject.workingAddress || parsedData.result.subject.residenceAddress,
            status: parsedData.result.subject.statusVat
          };
          
          resolve(companyData);
        } catch (error) {
          reject(new Error('Error parsing API response: ' + error.message));
        }
      });
    }).on('error', (error) => {
      reject(new Error('Error connecting to API: ' + error.message));
    });
  });
}

module.exports = {
  validateNip
};
