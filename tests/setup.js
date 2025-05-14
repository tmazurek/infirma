// Set test environment variables
process.env.NODE_ENV = 'test';

// Increase timeout for tests
jest.setTimeout(10000);

// Global setup before all tests
beforeAll(async () => {
  console.log('Starting test suite...');
});

// Global teardown after all tests
afterAll(async () => {
  console.log('Test suite completed.');
});
