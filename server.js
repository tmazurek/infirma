const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const ejsLayouts = require('express-ejs-layouts');
const fetch = require('node-fetch');

// Import database migration script
const migrateDatabase = require('./utils/migrateDatabase');

// Import routes
const companyProfileRoutes = require('./routes/companyProfile');
const clientsRoutes = require('./routes/clients');
const invoicesRoutes = require('./routes/invoices');
const expensesRoutes = require('./routes/expenses');
const financialSummaryRoutes = require('./routes/financialSummary');
const nipValidatorRoutes = require('./routes/nipValidator');
const zusSettingsRoutes = require('./routes/zusSettings');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.set('layout', 'layouts/main');

// API Routes
app.use('/api/company-profile', companyProfileRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/financial-summary', financialSummaryRoutes);
app.use('/api/validate-nip', nipValidatorRoutes);
app.use('/api/zus-settings', zusSettingsRoutes);

// Frontend Routes
app.get('/', (req, res) => {
  // Redirect to summary page
  res.redirect('/summary');
});

// Company profile page
app.get('/company-profile', (req, res) => {
  res.render('pages/company-profile', {
    title: 'Profil Firmy',
    stylesheets: `<style>
      .nav-tabs {
        display: flex;
        list-style: none;
        padding: 0;
        margin-bottom: 20px;
        border-bottom: 1px solid #ddd;
      }
      .nav-item {
        margin-right: 10px;
      }
      .nav-link {
        display: block;
        padding: 10px 15px;
        text-decoration: none;
        color: #333;
        border-bottom: 3px solid transparent;
      }
      .nav-link.active {
        border-bottom: 3px solid #0078d4;
        color: #0078d4;
      }
      .tab-content {
        padding: 20px 0;
      }
      .tab-pane {
        display: none;
      }
      .tab-pane.active {
        display: block;
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -15px;
      }
      .col-md-6 {
        flex: 0 0 50%;
        max-width: 50%;
        padding: 0 15px;
      }
      .total-item {
        font-weight: bold;
        border-top: 2px solid #eaeaea;
        padding-top: 15px;
        margin-top: 10px;
      }
      @media (max-width: 768px) {
        .col-md-6 {
          flex: 0 0 100%;
          max-width: 100%;
        }
      }
    </style>`,
    scripts: ''
  });
});

// Clients page
app.get('/clients', async (req, res) => {
  try {
    // Fetch clients
    const response = await fetch(`http://localhost:${PORT}/api/clients`);
    const clients = await response.json();

    res.render('pages/clients', {
      title: 'Klienci',
      clients: clients || [],
      stylesheets: `<style>
        .search-container {
          position: relative;
          width: 300px;
        }
        .search-input {
          width: 100%;
          padding: 8px 30px 8px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .search-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }
        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.4);
        }
        .modal-content {
          background-color: #fff;
          margin: 10% auto;
          padding: 20px;
          border-radius: 5px;
          width: 80%;
          max-width: 600px;
        }
        .close {
          color: #aaa;
          float: right;
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
        }
        .close:hover {
          color: #000;
        }
      </style>`,
      scripts: ''
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.render('pages/clients', {
      title: 'Klienci',
      clients: [],
      stylesheets: '',
      scripts: ''
    });
  }
});

// Invoices list page
app.get('/invoices', (req, res) => {
  res.render('pages/invoices', {
    title: 'Faktury',
    stylesheets: '',
    scripts: ''
  });
});

// Create invoice page
app.get('/create-invoice', (req, res) => {
  res.render('pages/create-invoice', {
    title: 'Utwórz Fakturę',
    stylesheets: '',
    scripts: ''
  });
});

// View invoice page
app.get('/view-invoice/:id', (req, res) => {
  res.render('pages/view-invoice', {
    title: 'Szczegóły Faktury',
    invoiceId: req.params.id,
    stylesheets: '',
    scripts: ''
  });
});

// Expenses page
app.get('/expenses', (req, res) => {
  res.render('pages/expenses', {
    title: 'Koszty',
    stylesheets: '',
    scripts: ''
  });
});

// Financial summary page
app.get('/summary', (req, res) => {
  res.render('pages/summary', {
    title: 'Podsumowanie Finansowe',
    stylesheets: '',
    scripts: ''
  });
});

// Start server if not in test mode
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export for testing
module.exports = app;
