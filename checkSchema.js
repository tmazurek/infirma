const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a database connection
const dbPath = path.join(__dirname, 'db/database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Check the schema of the Clients table
    db.all("PRAGMA table_info(Clients)", [], (err, rows) => {
      if (err) {
        console.error('Error getting table info:', err.message);
        process.exit(1);
      }
      
      console.log('Clients table schema:');
      rows.forEach(row => {
        console.log(`${row.cid}: ${row.name} (${row.type})`);
      });
      
      // Close the database connection
      db.close();
    });
  }
});
