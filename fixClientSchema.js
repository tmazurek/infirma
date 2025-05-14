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
    
    // Add the updated_at column if it doesn't exist
    db.run("ALTER TABLE Clients ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP", (err) => {
      if (err) {
        // If the error is about the column already existing, that's fine
        if (err.message.includes('duplicate column name')) {
          console.log('Column updated_at already exists, continuing...');
        } else {
          console.error('Error adding updated_at column:', err.message);
        }
      } else {
        console.log('Added updated_at column to Clients table');
      }
      
      // Close the database connection
      db.close();
    });
  }
});
