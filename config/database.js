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
    -- This will be populated with table creation SQL in future tasks
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
