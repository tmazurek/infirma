const request = require('supertest');
const express = require('express');
const companyProfileRoutes = require('../../routes/companyProfile');
const CompanyProfile = require('../../models/companyProfile');

// Mock the database module
jest.mock('../../models/companyProfile');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/company-profile', companyProfileRoutes);

describe('Company Profile API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/company-profile', () => {
    test('should return company profile when it exists', async () => {
      // Mock the getProfile method to return a sample profile
      const mockProfile = {
        id: 1,
        company_name: 'Test Company',
        nip: '1234567890',
        street_address: '123 Test St',
        city: 'Test City',
        postal_code: '12-345',
        bank_account_number: '12345678901234567890',
        default_vat_rate: 23.0
      };
      
      CompanyProfile.getProfile.mockImplementation((callback) => {
        callback(null, mockProfile);
      });

      // Make the request
      const response = await request(app).get('/api/company-profile');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfile);
      expect(CompanyProfile.getProfile).toHaveBeenCalledTimes(1);
    });

    test('should return 404 when profile does not exist', async () => {
      // Mock the getProfile method to return null (no profile found)
      CompanyProfile.getProfile.mockImplementation((callback) => {
        callback(null, null);
      });

      // Make the request
      const response = await request(app).get('/api/company-profile');

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(CompanyProfile.getProfile).toHaveBeenCalledTimes(1);
    });

    test('should handle server errors', async () => {
      // Mock the getProfile method to return an error
      CompanyProfile.getProfile.mockImplementation((callback) => {
        callback(new Error('Database error'), null);
      });

      // Make the request
      const response = await request(app).get('/api/company-profile');

      // Assertions
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(CompanyProfile.getProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/company-profile', () => {
    test('should create or update company profile', async () => {
      // Sample profile data
      const profileData = {
        company_name: 'New Test Company',
        nip: '0987654321',
        street_address: '456 New St',
        city: 'New City',
        postal_code: '54-321',
        bank_account_number: '09876543210987654321',
        default_vat_rate: 23.0
      };

      // Mock the saveProfile method
      const savedProfile = { id: 1, ...profileData };
      CompanyProfile.saveProfile.mockImplementation((data, callback) => {
        callback(null, savedProfile);
      });

      // Make the request
      const response = await request(app)
        .post('/api/company-profile')
        .send(profileData);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(savedProfile);
      expect(CompanyProfile.saveProfile).toHaveBeenCalledTimes(1);
      expect(CompanyProfile.saveProfile).toHaveBeenCalledWith(
        expect.objectContaining(profileData),
        expect.any(Function)
      );
    });

    test('should handle validation errors', async () => {
      // Invalid profile data (missing required fields)
      const invalidProfileData = {
        street_address: '456 New St',
        city: 'New City'
      };

      // Make the request
      const response = await request(app)
        .post('/api/company-profile')
        .send(invalidProfileData);

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(CompanyProfile.saveProfile).not.toHaveBeenCalled();
    });

    test('should handle server errors during save', async () => {
      // Sample profile data
      const profileData = {
        company_name: 'Error Test Company',
        nip: '1111111111'
      };

      // Mock the saveProfile method to return an error
      CompanyProfile.saveProfile.mockImplementation((data, callback) => {
        callback(new Error('Database error'), null);
      });

      // Make the request
      const response = await request(app)
        .post('/api/company-profile')
        .send(profileData);

      // Assertions
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(CompanyProfile.saveProfile).toHaveBeenCalledTimes(1);
    });
  });
});
