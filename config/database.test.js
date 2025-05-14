const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use in-memory database for testing
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error connecting to the in-memory SQLite database:', err.message);
  } else {
    console.log('Connected to the in-memory SQLite test database.');
    
    // Initialize database schema
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Create CompanyProfile table
    db.run(`
      CREATE TABLE IF NOT EXISTS CompanyProfile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        nip TEXT NOT NULL,
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
        zus_sickness_optional INTEGER DEFAULT 1,
        zus_labor_fund_rate REAL DEFAULT 2.45,
        zus_fep_rate REAL DEFAULT 0.1,
        zus_health_insurance_amount REAL DEFAULT 0.0,
        zus_health_insurance_income_threshold TEXT DEFAULT 'low',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Clients table
    db.run(`
      CREATE TABLE IF NOT EXISTS Clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        nip TEXT,
        address TEXT,
        city TEXT,
        postal_code TEXT,
        email TEXT,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Invoices table
    db.run(`
      CREATE TABLE IF NOT EXISTS Invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT NOT NULL,
        client_id INTEGER NOT NULL,
        client_name TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        due_date TEXT,
        payment_method TEXT DEFAULT 'transfer',
        status TEXT DEFAULT 'Draft',
        notes TEXT,
        total_net REAL NOT NULL,
        total_vat REAL NOT NULL,
        total_gross REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES Clients (id)
      )
    `);

    // Create InvoiceItems table
    db.run(`
      CREATE TABLE IF NOT EXISTS InvoiceItems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price_net REAL NOT NULL,
        vat_rate REAL NOT NULL,
        item_total_net REAL NOT NULL,
        item_total_vat REAL NOT NULL,
        item_total_gross REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES Invoices (id)
      )
    `);

    // Create Expenses table
    db.run(`
      CREATE TABLE IF NOT EXISTS Expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_date TEXT NOT NULL,
        vendor_name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        amount_net REAL NOT NULL,
        vat_rate REAL NOT NULL,
        amount_gross REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Test database tables initialized successfully.');
  });
}

// Export the database connection
module.exports = db;
