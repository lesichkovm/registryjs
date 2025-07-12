// jest.setup.js - Common setup for all tests

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn(index => {
      return Object.keys(store)[index] || null;
    })
  };
})();

// Setup global objects
global.window = {
  localStorage: localStorageMock
  // We'll set location in individual tests as needed
};
global.localStorage = localStorageMock;
global.btoa = str => Buffer.from(str).toString('base64');
global.atob = str => Buffer.from(str, 'base64').toString();
global.console = {
  warn: jest.fn(),
  log: jest.fn(),
  error: jest.fn()
};
