// __tests__/setup.ts
// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock uuid for consistent testing
jest.mock('uuid', () => ({
  v4: () => '123e4567-e89b-12d3-a456-426614174000'
}));

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';
process.env.JWT_EXPIRATION = '3600000';
process.env.JWT_REFRESH_EXPIRATION = '604800000';
process.env.AES_SECRET_KEY = 'test-32-character-secret-key-here';

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});