const db = require('../config/database');

class CompanyProfile {
  // Get the company profile (should be only one record)
  static getProfile(callback) {
    const sql = 'SELECT * FROM CompanyProfile LIMIT 1';
    
    db.get(sql, [], (err, row) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, row);
    });
  }

  // Create or update the company profile
  static saveProfile(profileData, callback) {
    // First check if a profile already exists
    this.getProfile((err, existingProfile) => {
      if (err) {
        return callback(err, null);
      }

      // Validate required fields
      if (!profileData.company_name || !profileData.nip) {
        return callback(new Error('Company name and NIP are required'), null);
      }

      if (existingProfile) {
        // Update existing profile
        const sql = `
          UPDATE CompanyProfile 
          SET 
            company_name = ?, 
            nip = ?, 
            street_address = ?, 
            city = ?, 
            postal_code = ?, 
            bank_account_number = ?, 
            default_vat_rate = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        const params = [
          profileData.company_name,
          profileData.nip,
          profileData.street_address || null,
          profileData.city || null,
          profileData.postal_code || null,
          profileData.bank_account_number || null,
          profileData.default_vat_rate || 23.0,
          existingProfile.id
        ];
        
        db.run(sql, params, function(err) {
          if (err) {
            return callback(err, null);
          }
          callback(null, { id: existingProfile.id, ...profileData });
        });
      } else {
        // Insert new profile
        const sql = `
          INSERT INTO CompanyProfile (
            company_name, 
            nip, 
            street_address, 
            city, 
            postal_code, 
            bank_account_number, 
            default_vat_rate
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
          profileData.company_name,
          profileData.nip,
          profileData.street_address || null,
          profileData.city || null,
          profileData.postal_code || null,
          profileData.bank_account_number || null,
          profileData.default_vat_rate || 23.0
        ];
        
        db.run(sql, params, function(err) {
          if (err) {
            return callback(err, null);
          }
          callback(null, { id: this.lastID, ...profileData });
        });
      }
    });
  }
}

module.exports = CompanyProfile;
