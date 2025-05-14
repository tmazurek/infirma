const request = require('supertest');
const express = require('express');
const financialSummaryRoutes = require('../../routes/financialSummary');
const taxCalculator = require('../../utils/taxCalculator');

// Mock the database and tax calculator
jest.mock('../../config/database');
jest.mock('../../utils/taxCalculator');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/financial-summary', financialSummaryRoutes);

describe('Financial Summary API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/financial-summary', () => {
    test('should return financial summary for the specified month and year', async () => {
      // Mock the tax calculator functions
      taxCalculator.calculateVAT.mockReturnValue({
        vat_income: 2300,
        vat_expenses: 920,
        vat_due: 1380
      });

      taxCalculator.calculatePIT.mockReturnValue({
        income: 10000,
        expenses: 4000,
        taxable_income: 10000,
        income_tax: 1200
      });

      taxCalculator.calculateZUS.mockReturnValue({
        retirement: 1015.78,
        disability: 416.30,
        accident: 86.90,
        sickness: 127.49,
        labor_fund: 127.49,
        fep: 0,
        health_insurance: 461.66,
        social_insurance_total: 1773.96,
        total: 2235.62
      });

      // Make the request
      const response = await request(app)
        .get('/api/financial-summary')
        .query({ month: 5, year: 2023 });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('vat');
      expect(response.body).toHaveProperty('pit');
      expect(response.body).toHaveProperty('zus');

      expect(response.body.vat).toEqual(expect.objectContaining({
        vat_income: 2300,
        vat_expenses: 920,
        vat_due: 1380
      }));

      expect(response.body.pit).toEqual(expect.objectContaining({
        income: 10000,
        expenses: 4000,
        taxable_income: 10000,
        income_tax: 1200
      }));

      expect(response.body.zus).toEqual(expect.objectContaining({
        retirement: 1015.78,
        disability: 416.30,
        accident: 86.90,
        sickness: 127.49,
        labor_fund: 127.49,
        fep: 0,
        health_insurance: 461.66,
        social_insurance_total: 1773.96,
        total: 2235.62
      }));
    });

    test('should use current month and year if not specified', async () => {
      // Mock the tax calculator functions with simple return values
      taxCalculator.calculateVAT.mockReturnValue({ vat_due: 0 });
      taxCalculator.calculatePIT.mockReturnValue({ income_tax: 0 });
      taxCalculator.calculateZUS.mockReturnValue({ total: 0 });

      // Make the request without specifying month and year
      const response = await request(app).get('/api/financial-summary');

      // Assertions
      expect(response.status).toBe(200);
      expect(taxCalculator.calculateVAT).toHaveBeenCalled();
      expect(taxCalculator.calculatePIT).toHaveBeenCalled();
      expect(taxCalculator.calculateZUS).toHaveBeenCalled();
    });

    test('should handle invalid month parameter', async () => {
      // Make the request with invalid month
      const response = await request(app)
        .get('/api/financial-summary')
        .query({ month: 13, year: 2023 });

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('month');
    });

    test('should handle invalid year parameter', async () => {
      // Make the request with invalid year
      const response = await request(app)
        .get('/api/financial-summary')
        .query({ month: 5, year: -1 });

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('year');
    });
  });
});
