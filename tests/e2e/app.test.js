const request = require('supertest');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Use a test database file
const TEST_DB_PATH = path.join(__dirname, '../../test.db');

// Store the original database path
const ORIGINAL_DB_PATH = path.join(__dirname, '../../database.db');
let originalDbExists = false;

describe('Infirma Application E2E Tests', () => {
  let app;
  
  beforeAll(async () => {
    // Check if the original database exists
    originalDbExists = fs.existsSync(ORIGINAL_DB_PATH);
    
    // If it exists, rename it temporarily
    if (originalDbExists) {
      fs.renameSync(ORIGINAL_DB_PATH, ORIGINAL_DB_PATH + '.bak');
    }
    
    // Create a test database
    const db = new sqlite3.Database(TEST_DB_PATH);
    
    // Close the database connection
    await new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Set environment variables for testing
    process.env.NODE_ENV = 'test';
    process.env.DB_PATH = TEST_DB_PATH;
    
    // Import the app after setting up the test environment
    app = require('../../server');
  });
  
  afterAll(async () => {
    // Clean up the test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    
    // Restore the original database if it existed
    if (originalDbExists) {
      fs.renameSync(ORIGINAL_DB_PATH + '.bak', ORIGINAL_DB_PATH);
    }
    
    // Close the server
    if (app && app.close) {
      await new Promise(resolve => app.close(resolve));
    }
  });
  
  describe('Basic Routes', () => {
    test('GET / should redirect to /summary', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(302); // 302 is the status code for redirection
      expect(response.headers.location).toBe('/summary');
    });
    
    test('GET /summary should return 200', async () => {
      const response = await request(app).get('/summary');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Podsumowanie finansowe');
    });
    
    test('GET /company-profile should return 200', async () => {
      const response = await request(app).get('/company-profile');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Profil firmy');
    });
    
    test('GET /clients should return 200', async () => {
      const response = await request(app).get('/clients');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Klienci');
    });
    
    test('GET /invoices should return 200', async () => {
      const response = await request(app).get('/invoices');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Faktury');
    });
    
    test('GET /expenses should return 200', async () => {
      const response = await request(app).get('/expenses');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Koszty');
    });
  });
  
  describe('API Endpoints', () => {
    test('GET /api/company-profile should return 404 for new installation', async () => {
      const response = await request(app).get('/api/company-profile');
      expect(response.status).toBe(404);
    });
    
    test('POST /api/company-profile should create a new company profile', async () => {
      const profileData = {
        company_name: 'Test Company',
        nip: '1234567890',
        street_address: 'Test Street 123',
        city: 'Test City',
        postal_code: '12-345',
        bank_account_number: '12345678901234567890',
        default_vat_rate: 23.0
      };
      
      const response = await request(app)
        .post('/api/company-profile')
        .send(profileData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.company_name).toBe(profileData.company_name);
      expect(response.body.nip).toBe(profileData.nip);
    });
    
    test('GET /api/company-profile should return the created profile', async () => {
      const response = await request(app).get('/api/company-profile');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('company_name', 'Test Company');
      expect(response.body).toHaveProperty('nip', '1234567890');
    });
  });
});
