// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  // Test the modular structure in src directory
  testMatch: [
    '<rootDir>/src/**/*.test.js'
  ],
  // Transform ES modules
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  // Setup files to run before tests
  setupFiles: ['<rootDir>/jest.setup.js']
};
