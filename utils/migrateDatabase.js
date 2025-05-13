const db = require('../config/database');

/**
 * Migrate the database schema to add ZUS-related columns to the CompanyProfile table
 */
function migrateDatabase() {
  console.log('Starting database migration...');
  
  // Check if the zus_base_amount column exists
  db.get("PRAGMA table_info(CompanyProfile)", [], (err, rows) => {
    if (err) {
      console.error('Error checking table schema:', err.message);
      return;
    }
    
    // Add the ZUS-related columns if they don't exist
    const alterTableSQL = `
      ALTER TABLE CompanyProfile ADD COLUMN zus_base_amount REAL DEFAULT 5203.80;
      ALTER TABLE CompanyProfile ADD COLUMN zus_retirement_rate REAL DEFAULT 19.52;
      ALTER TABLE CompanyProfile ADD COLUMN zus_disability_rate REAL DEFAULT 8.0;
      ALTER TABLE CompanyProfile ADD COLUMN zus_accident_rate REAL DEFAULT 1.67;
      ALTER TABLE CompanyProfile ADD COLUMN zus_sickness_rate REAL DEFAULT 2.45;
      ALTER TABLE CompanyProfile ADD COLUMN zus_labor_fund_rate REAL DEFAULT 2.45;
      ALTER TABLE CompanyProfile ADD COLUMN zus_fep_rate REAL DEFAULT 0.1;
      ALTER TABLE CompanyProfile ADD COLUMN zus_health_insurance_amount REAL DEFAULT 0.0;
      ALTER TABLE CompanyProfile ADD COLUMN zus_health_insurance_income_threshold TEXT DEFAULT 'low';
    `;
    
    db.exec(alterTableSQL, (err) => {
      if (err) {
        // If the error is about the column already existing, that's fine
        if (err.message.includes('duplicate column name')) {
          console.log('Some columns already exist, continuing with migration...');
        } else {
          console.error('Error altering table:', err.message);
          return;
        }
      }
      
      console.log('Database migration completed successfully.');
    });
  });
}

// Run the migration
migrateDatabase();

module.exports = migrateDatabase;
