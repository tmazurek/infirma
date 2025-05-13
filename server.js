const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const companyProfileRoutes = require('./routes/companyProfile');
const clientsRoutes = require('./routes/clients');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/company-profile', companyProfileRoutes);
app.use('/api/clients', clientsRoutes);

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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
