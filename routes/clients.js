const express = require('express');
const router = express.Router();
const Client = require('../models/client');

// GET /api/clients
// Retrieve all clients
router.get('/', (req, res) => {
  Client.getAllClients((err, clients) => {
    if (err) {
      console.error('Error retrieving clients:', err);
      return res.status(500).json({ error: 'Failed to retrieve clients' });
    }
    
    res.json(clients);
  });
});

// GET /api/clients/:id
// Retrieve a specific client
router.get('/:id', (req, res) => {
  const clientId = req.params.id;
  
  Client.getClientById(clientId, (err, client) => {
    if (err) {
      if (err.message === 'Client not found') {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      console.error('Error retrieving client:', err);
      return res.status(500).json({ error: 'Failed to retrieve client' });
    }
    
    res.json(client);
  });
});

// POST /api/clients
// Create a new client
router.post('/', (req, res) => {
  const clientData = {
    client_name: req.body.client_name,
    nip: req.body.nip,
    street_address: req.body.street_address,
    city: req.body.city,
    postal_code: req.body.postal_code,
    email: req.body.email,
    contact_person: req.body.contact_person
  };
  
  Client.createClient(clientData, (err, client) => {
    if (err) {
      if (err.message === 'Client name is required') {
        return res.status(400).json({ error: err.message });
      }
      
      if (err.message === 'A client with this NIP already exists') {
        return res.status(409).json({ error: err.message });
      }
      
      console.error('Error creating client:', err);
      return res.status(500).json({ error: 'Failed to create client' });
    }
    
    res.status(201).json({
      message: 'Client created successfully',
      client: client
    });
  });
});

// PUT /api/clients/:id
// Update an existing client
router.put('/:id', (req, res) => {
  const clientId = req.params.id;
  const clientData = {
    client_name: req.body.client_name,
    nip: req.body.nip,
    street_address: req.body.street_address,
    city: req.body.city,
    postal_code: req.body.postal_code,
    email: req.body.email,
    contact_person: req.body.contact_person
  };
  
  Client.updateClient(clientId, clientData, (err, client) => {
    if (err) {
      if (err.message === 'Client not found') {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      if (err.message === 'Client name is required') {
        return res.status(400).json({ error: err.message });
      }
      
      if (err.message === 'A client with this NIP already exists') {
        return res.status(409).json({ error: err.message });
      }
      
      console.error('Error updating client:', err);
      return res.status(500).json({ error: 'Failed to update client' });
    }
    
    res.json({
      message: 'Client updated successfully',
      client: client
    });
  });
});

// DELETE /api/clients/:id
// Delete a client
router.delete('/:id', (req, res) => {
  const clientId = req.params.id;
  
  Client.deleteClient(clientId, (err, result) => {
    if (err) {
      if (err.message === 'Client not found' || err.message === 'Client not found or already deleted') {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      console.error('Error deleting client:', err);
      return res.status(500).json({ error: 'Failed to delete client' });
    }
    
    res.json({
      message: 'Client deleted successfully',
      result: result
    });
  });
});

module.exports = router;
