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
            zus_base_amount = ?,
            zus_retirement_rate = ?,
            zus_disability_rate = ?,
            zus_accident_rate = ?,
            zus_sickness_rate = ?,
            zus_sickness_optional = ?,
            zus_labor_fund_rate = ?,
            zus_fep_rate = ?,
            zus_fep_optional = ?,
            zus_health_insurance_amount = ?,
            zus_health_insurance_income_threshold = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        const params = [
          profileData.company_name,
          profileData.nip,
          profileData.street_address ,
          profileData.city ,
          profileData.postal_code ,
          profileData.bank_account_number ,
          profileData.default_vat_rate ,
          profileData.zus_base_amount ,
          profileData.zus_retirement_rate ,
          profileData.zus_disability_rate ,
          profileData.zus_accident_rate ,
          profileData.zus_sickness_rate ,
          profileData.zus_sickness_optional ,
          profileData.zus_labor_fund_rate ,
          profileData.zus_fep_rate ,
          profileData.zus_fep_optional ,
          profileData.zus_health_insurance_amount ,
          profileData.zus_health_insurance_income_threshold ,
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
            default_vat_rate,
            zus_base_amount,
            zus_retirement_rate,
            zus_disability_rate,
            zus_accident_rate,
            zus_sickness_rate,
            zus_sickness_optional,
            zus_labor_fund_rate,
            zus_fep_rate,
            zus_fep_optional,
            zus_health_insurance_amount,
            zus_health_insurance_income_threshold
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
          profileData.company_name,
          profileData.nip,
          profileData.street_address ,
          profileData.city ,
          profileData.postal_code ,
          profileData.bank_account_number ,
          profileData.default_vat_rate ,
          profileData.zus_base_amount ,
          profileData.zus_retirement_rate ,
          profileData.zus_disability_rate ,
          profileData.zus_accident_rate ,
          profileData.zus_sickness_rate ,
          profileData.zus_sickness_optional ,
          profileData.zus_labor_fund_rate ,
          profileData.zus_fep_rate ,
          profileData.zus_fep_optional ,
          profileData.zus_health_insurance_amount ,
          profileData.zus_health_insurance_income_threshold 
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
