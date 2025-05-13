const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Import database migration script
const migrateDatabase = require('./utils/migrateDatabase');

// Import routes
const companyProfileRoutes = require('./routes/companyProfile');
const clientsRoutes = require('./routes/clients');
const invoicesRoutes = require('./routes/invoices');
const expensesRoutes = require('./routes/expenses');
const financialSummaryRoutes = require('./routes/financialSummary');
const nipValidatorRoutes = require('./routes/nipValidator');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/company-profile', companyProfileRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/financial-summary', financialSummaryRoutes);
app.use('/api/validate-nip', nipValidatorRoutes);

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

// Expenses page
app.get('/expenses', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'expenses.html'));
});

// Financial summary page
app.get('/summary', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'summary.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
