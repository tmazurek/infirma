const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a database connection
const dbPath = path.join(__dirname, '../db/database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Initialize the database with tables if they don't exist
    initializeDatabase();
  }
});

// Initialize database with tables
function initializeDatabase() {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create tables if they don't exist
  const createTablesSQL = `
    -- Company Profile table
    CREATE TABLE IF NOT EXISTS CompanyProfile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      nip TEXT UNIQUE NOT NULL,
      street_address TEXT,
      city TEXT,
      postal_code TEXT,
      bank_account_number TEXT,
      default_vat_rate REAL DEFAULT 23.0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.exec(createTablesSQL, (err) => {
    if (err) {
      console.error('Error initializing database tables:', err.message);
    } else {
      console.log('Database tables initialized successfully.');
    }
  });
}

module.exports = db;
