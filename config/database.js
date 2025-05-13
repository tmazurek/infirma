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
      zus_base_amount REAL DEFAULT 5203.80,
      zus_retirement_rate REAL DEFAULT 19.52,
      zus_disability_rate REAL DEFAULT 8.0,
      zus_accident_rate REAL DEFAULT 1.67,
      zus_sickness_rate REAL DEFAULT 2.45,
      zus_labor_fund_rate REAL DEFAULT 2.45,
      zus_fep_rate REAL DEFAULT 0.1,
      zus_health_insurance_amount REAL DEFAULT 0.0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Clients table
    CREATE TABLE IF NOT EXISTS Clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      nip TEXT UNIQUE,
      street_address TEXT,
      city TEXT,
      postal_code TEXT,
      email TEXT,
      contact_person TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Invoices table
    CREATE TABLE IF NOT EXISTS Invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      client_id INTEGER NOT NULL,
      issue_date DATE NOT NULL,
      due_date DATE,
      payment_terms TEXT,
      company_profile_snapshot TEXT, -- JSON string of company details
      total_net REAL NOT NULL,
      total_vat REAL NOT NULL,
      total_gross REAL NOT NULL,
      status TEXT DEFAULT 'Draft', -- 'Draft', 'Issued', 'Paid'
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES Clients(id)
    );

    -- InvoiceItems table
    CREATE TABLE IF NOT EXISTS InvoiceItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price_net REAL NOT NULL,
      vat_rate REAL NOT NULL,
      item_total_net REAL NOT NULL,
      item_total_vat REAL NOT NULL,
      item_total_gross REAL NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES Invoices(id) ON DELETE CASCADE
    );

    -- Expenses table
    CREATE TABLE IF NOT EXISTS Expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_date DATE NOT NULL,
      vendor_name TEXT,
      description TEXT NOT NULL,
      amount_net REAL,
      vat_amount_paid REAL,
      amount_gross REAL NOT NULL,
      category TEXT,
      invoice_scan_url_optional TEXT,
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
