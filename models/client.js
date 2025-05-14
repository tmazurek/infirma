const db = require('../config/database');

class Client {
  // Get all clients
  static getAllClients(callback) {
    const sql = 'SELECT * FROM Clients ORDER BY client_name';

    db.all(sql, [], (err, rows) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, rows);
    });
  }

  // Get a client by ID
  static getClientById(id, callback) {
    const sql = 'SELECT * FROM Clients WHERE id = ?';

    db.get(sql, [id], (err, row) => {
      if (err) {
        return callback(err, null);
      }

      if (!row) {
        return callback(new Error('Client not found'), null);
      }

      callback(null, row);
    });
  }

  // Create a new client
  static createClient(clientData, callback) {
    // Validate required fields
    if (!clientData.client_name) {
      return callback(new Error('Client name is required'), null);
    }

    const sql = `
      INSERT INTO Clients (
        client_name,
        nip,
        street_address,
        city,
        postal_code,
        email,
        contact_person
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      clientData.client_name,
      clientData.nip || null,
      clientData.street_address || null,
      clientData.city || null,
      clientData.postal_code || null,
      clientData.email || null,
      clientData.contact_person || null
    ];

    db.run(sql, params, function(err) {
      if (err) {
        // Check for unique constraint violation on NIP
        if (err.message.includes('UNIQUE constraint failed: Clients.nip')) {
          return callback(new Error('A client with this NIP already exists'), null);
        }
        return callback(err, null);
      }

      // Return the created client with its ID
      callback(null, { id: this.lastID, ...clientData });
    });
  }

  // Update an existing client
  static updateClient(id, clientData, callback) {
    // First check if the client exists
    this.getClientById(id, (err, existingClient) => {
      if (err) {
        return callback(err, null);
      }

      // Validate required fields
      if (!clientData.client_name) {
        return callback(new Error('Client name is required'), null);
      }

      const sql = `
        UPDATE Clients
        SET
          client_name = ?,
          nip = ?,
          street_address = ?,
          city = ?,
          postal_code = ?,
          email = ?,
          contact_person = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const params = [
        clientData.client_name,
        clientData.nip || null,
        clientData.street_address || null,
        clientData.city || null,
        clientData.postal_code || null,
        clientData.email || null,
        clientData.contact_person || null,
        id
      ];

      db.run(sql, params, function(err) {
        if (err) {
          // Check for unique constraint violation on NIP
          if (err.message.includes('UNIQUE constraint failed: Clients.nip')) {
            return callback(new Error('A client with this NIP already exists'), null);
          }
          return callback(err, null);
        }

        // Return the updated client
        callback(null, { id: parseInt(id), ...clientData });
      });
    });
  }

  // Delete a client
  static deleteClient(id, callback) {
    // First check if the client exists
    this.getClientById(id, (err, existingClient) => {
      if (err) {
        return callback(err, null);
      }

      const sql = 'DELETE FROM Clients WHERE id = ?';

      db.run(sql, [id], function(err) {
        if (err) {
          return callback(err, null);
        }

        // Check if any rows were affected
        if (this.changes === 0) {
          return callback(new Error('Client not found or already deleted'), null);
        }

        callback(null, { id: parseInt(id), deleted: true });
      });
    });
  }
}

module.exports = Client;
