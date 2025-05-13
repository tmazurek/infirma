const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const companyProfileRoutes = require('./routes/companyProfile');
const clientsRoutes = require('./routes/clients');
const invoicesRoutes = require('./routes/invoices');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/company-profile', companyProfileRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/invoices', invoicesRoutes);

// Frontend Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Company profile page
app.get('/company-profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'company-profile.html'));
});

// Clients page
app.get('/clients', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'clients.html'));
});

// Invoices list page
app.get('/invoices', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'invoices.html'));
});

// Create invoice page
app.get('/create-invoice', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'create-invoice.html'));
});

// View invoice page
app.get('/view-invoice/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'view-invoice.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
