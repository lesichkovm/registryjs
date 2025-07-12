// utils.test.js
import { getRootUrl, base64encode, base64decode, jsonEncode, jsonDecode } from './utils.js';

// Mock console
global.console = {
  warn: jest.fn(),
  log: jest.fn(),
  error: jest.fn()
};

describe('Utils', () => {
  describe('getRootUrl', () => {
    // Save original window.location before each test
    let originalLocation;
    
    beforeEach(() => {
      // Save the original location if it exists
      originalLocation = window.location;
      
      // Delete the location property so we can redefine it
      delete window.location;
      
      // Reset mocks
      jest.resetAllMocks();
    });
    
    afterEach(() => {
      // Restore original location after each test
      window.location = originalLocation;
    });

    test('should return origin when available', () => {
      // Set up window.location for this test
      window.location = {
        protocol: 'https:',
        hostname: 'example.com',
        port: '',
        origin: 'https://example.com'
      };
      
      const result = getRootUrl();
      expect(result).toBe('https://example.com');
    });

    test('should construct URL when origin is null', () => {
      // Set up window.location for this test
      window.location = {
        protocol: 'https:',
        hostname: 'example.com',
        port: '',
        origin: 'null'
      };
      
      const result = getRootUrl();
      expect(result).toBe('https://example.com');
    });

    test('should include port when present', () => {
      // Set up window.location for this test
      window.location = {
        protocol: 'http:',
        hostname: 'localhost',
        port: '8080',
        origin: null
      };
      
      const result = getRootUrl();
      expect(result).toBe('http://localhost:8080');
    });

    test('should return "unknown" for file protocol', () => {
      // Set up window.location for this test
      window.location = {
        protocol: 'file:',
        hostname: '',
        port: '',
        origin: null
      };
      
      const result = getRootUrl();
      expect(result).toBe('unknown');
    });

    test('should return "unknown" when window is undefined', () => {
      // Save the original window object
      const originalWindow = global.window;
      
      // Set window to undefined
      global.window = undefined;
      
      const result = getRootUrl();
      expect(result).toBe('unknown');
      expect(console.warn).toHaveBeenCalled();
      
      // Restore window for other tests
      global.window = originalWindow;
    });
  });

  describe('base64encode/decode', () => {
    beforeEach(() => {
      // Setup global btoa and atob
      global.btoa = jest.fn(str => Buffer.from(str).toString('base64'));
      global.atob = jest.fn(str => Buffer.from(str, 'base64').toString());
    });

    test('should encode and decode strings correctly', () => {
      const original = 'Hello, world!';
      const encoded = base64encode(original);
      const decoded = base64decode(encoded);
      
      expect(encoded).toBe(global.btoa(original));
      expect(decoded).toBe(original);
    });

    test('should handle empty strings', () => {
      const original = '';
      const encoded = base64encode(original);
      const decoded = base64decode(encoded);
      
      expect(encoded).toBe(global.btoa(original));
      expect(decoded).toBe(original);
    });

    test('should handle special characters', () => {
      const original = '!@#$%^&*()_+{}:"<>?[];\',.';
      const encoded = base64encode(original);
      const decoded = base64decode(encoded);
      
      expect(decoded).toBe(original);
    });
  });

  describe('jsonEncode/Decode', () => {
    test('should encode and decode objects correctly', () => {
      const original = { name: 'Test', value: 123, nested: { a: 1, b: 2 } };
      const encoded = jsonEncode(original);
      const decoded = jsonDecode(encoded);
      
      expect(decoded).toEqual(original);
    });

    test('should handle arrays', () => {
      const original = [1, 2, 3, { name: 'Test' }];
      const encoded = jsonEncode(original);
      const decoded = jsonDecode(encoded);
      
      expect(decoded).toEqual(original);
    });

    test('should handle primitive values', () => {
      expect(jsonDecode(jsonEncode(123))).toBe(123);
      expect(jsonDecode(jsonEncode('string'))).toBe('string');
      expect(jsonDecode(jsonEncode(true))).toBe(true);
      expect(jsonDecode(jsonEncode(null))).toBe(null);
    });
  });
});
