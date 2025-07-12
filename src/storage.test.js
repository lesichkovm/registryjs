// storage.test.js
import * as storage from './storage.js';
import * as namespace from './namespace.js';
import * as utils from './utils.js';

// Destructure the imported functions for easier access
const { isExpired, setValue, getValue, removeValue, emptyNamespace } = storage;

// Mock dependencies
jest.mock('./namespace.js', () => ({
  createExpirationKey: jest.fn(key => `${key}&&expires`)
}));

jest.mock('./utils.js', () => ({
  jsonEncode: jest.fn(value => JSON.stringify(value)),
  jsonDecode: jest.fn(value => JSON.parse(value))
}));

// Create mock localStorage implementation using Jest's built-in mock functions
const mockLocalStorage = {
  store: {},
  getItem: jest.fn().mockImplementation(key => mockLocalStorage.store[key] || null),
  setItem: jest.fn().mockImplementation((key, value) => { mockLocalStorage.store[key] = value; }),
  removeItem: jest.fn().mockImplementation(key => { delete mockLocalStorage.store[key]; }),
  clear: jest.fn().mockImplementation(() => { mockLocalStorage.store = {}; }),
  key: jest.fn(),
  length: 0
};

// Replace global localStorage
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('Storage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Reset the mock store
    mockLocalStorage.store = {};
    mockLocalStorage.length = 0;
    
    // Set up mock implementations
    mockLocalStorage.getItem.mockImplementation(key => {
      return mockLocalStorage.store[key] || null;
    });
    mockLocalStorage.setItem.mockImplementation((key, value) => {
      mockLocalStorage.store[key] = value;
    });
    mockLocalStorage.removeItem.mockImplementation(key => {
      delete mockLocalStorage.store[key];
    });
    mockLocalStorage.clear.mockImplementation(() => {
      mockLocalStorage.store = {};
    });
    
    // Mock Date.now for consistent testing of expiration
    jest.spyOn(Date, 'now').mockImplementation(() => 1000000000000); // Fixed timestamp
  });
  
  describe('isExpired', () => {
    test('should return false if no expiration exists', () => {
      // Mock localStorage.getItem to return null (no expiration)
      mockLocalStorage.getItem.mockImplementationOnce(() => null);
      
      const result = isExpired('testKey');
      
      expect(namespace.createExpirationKey).toHaveBeenCalledWith('testKey');
      expect(localStorage.getItem).toHaveBeenCalledWith('testKey&&expires');
      expect(result).toBe(false);
    });
    
    test('should return true if current time is after expiration', () => {
      // Mock localStorage.getItem to return an expired timestamp
      mockLocalStorage.getItem.mockImplementationOnce(() => '999999999');
      
      const result = isExpired('testKey');
      
      expect(result).toBe(true);
    });
    
    test('should return false if current time is before expiration', () => {
      // Mock localStorage.getItem to return a future timestamp
      mockLocalStorage.getItem.mockImplementationOnce(() => '1000000001000');
      
      const result = isExpired('testKey');
      
      expect(result).toBe(false);
    });
  });
  
  describe('setValue', () => {
    test('should store value without expiration', () => {
      // Mock jsonEncode to return a specific value
      utils.jsonEncode.mockReturnValueOnce('"testValue"');
      
      setValue('testKey', 'testValue');
      
      expect(utils.jsonEncode).toHaveBeenCalledWith('testValue');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testKey', '"testValue"');
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(expect.stringContaining('&&expires'), expect.any(String));
    });
    
    test('should store value with expiration', () => {
      // Mock jsonEncode to return a specific value
      utils.jsonEncode.mockReturnValueOnce('"testValue"');
      // Mock createExpirationKey to return a specific value
      namespace.createExpirationKey.mockReturnValueOnce('testKey&&expires');
      
      setValue('testKey', 'testValue', 3600);
      
      expect(utils.jsonEncode).toHaveBeenCalledWith('testValue');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testKey', '"testValue"');
      expect(namespace.createExpirationKey).toHaveBeenCalledWith('testKey');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testKey&&expires', '1000003600');
    });
    
    test('should store complex objects', () => {
      const complexObject = { test: 'value', nested: { foo: 'bar' } };
      // Mock jsonEncode to return a specific value
      const complexJson = '{"test":"value","nested":{"foo":"bar"}}';
      utils.jsonEncode.mockReturnValueOnce(complexJson);
      
      setValue('testKey', complexObject);
      
      expect(utils.jsonEncode).toHaveBeenCalledWith(complexObject);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testKey', complexJson);
    });
  });
  
  describe('getValue', () => {
    test('should return null for expired values', () => {
      // Mock isExpired to return true
      jest.spyOn(storage, 'isExpired').mockReturnValueOnce(true);
      // Mock createExpirationKey
      namespace.createExpirationKey.mockReturnValueOnce('testKey&&expires');
      
      // Set up test data
      mockLocalStorage.setItem('testKey', '"testValue"');
      mockLocalStorage.setItem('testKey&&expires', '999999999');
      
      const result = getValue('testKey');
      
      expect(result).toBeNull();
      // Should have removed the expired value
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testKey');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testKey&&expires');
    });
    
    test('should return null for non-existent values', () => {
      // Mock isExpired to return false
      jest.spyOn(storage, 'isExpired').mockReturnValueOnce(false);
      // Mock localStorage.getItem to return null
      mockLocalStorage.getItem.mockImplementationOnce(() => null);
      
      const result = getValue('nonExistentKey');
      
      expect(result).toBeNull();
    });
    
    test('should return parsed value for valid keys', () => {
      // Mock isExpired to return false
      jest.spyOn(storage, 'isExpired').mockReturnValueOnce(false);
      // Set up test data
      mockLocalStorage.setItem('testKey', '"testValue"');
      
      const result = getValue('testKey');
      
      expect(utils.jsonDecode).toHaveBeenCalledWith('"testValue"');
      expect(result).toBe('testValue');
    });
    
    test('should return null if parsing fails', () => {
      // Mock isExpired to return false
      jest.spyOn(storage, 'isExpired').mockReturnValueOnce(false);
      // Mock localStorage.getItem to return invalid JSON
      mockLocalStorage.getItem.mockImplementationOnce(() => 'invalid-json');
      // Mock jsonDecode to throw an error
      utils.jsonDecode.mockImplementationOnce(() => { throw new Error('Invalid JSON'); });
      
      const result = getValue('testKey');
      
      expect(result).toBeNull();
    });
  });
  
  describe('removeValue', () => {
    test('should remove value and expiration', () => {
      // Mock createExpirationKey
      namespace.createExpirationKey.mockReturnValueOnce('testKey&&expires');
      
      removeValue('testKey');
      
      expect(namespace.createExpirationKey).toHaveBeenCalledWith('testKey');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testKey');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testKey&&expires');
    });
  });
  
  describe('emptyNamespace', () => {
    test('should remove all keys containing the namespace', () => {
      // Setup localStorage with test keys
      const mockKeys = ['key1namespace1', 'key2namespace1', 'key1namespace2', 'otherKey'];
      mockKeys.forEach(key => {
        mockLocalStorage.store[key] = 'some-value';
      });
      
      // Mock Object.keys for localStorage
      const originalObjectKeys = Object.keys;
      Object.keys = jest.fn(() => mockKeys);
      
      // Call the function
      emptyNamespace('namespace1');
      
      // Verify removeItem was called for the right keys
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('key1namespace1');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('key2namespace1');
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('key1namespace2');
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('otherKey');
      expect(localStorage.removeItem).not.toHaveBeenCalledWith('otherKey');
      
      // Restore original Object.keys
      Object.keys = originalObjectKeys;
    });
    
    test('should do nothing if no keys match the namespace', () => {
      // Setup localStorage with test keys
      const mockKeys = ['key1namespace1', 'key2namespace1', 'key1namespace2', 'otherKey'];
      mockKeys.forEach(key => {
        mockLocalStorage.store[key] = 'some-value';
      });
      
      // Mock Object.keys for localStorage
      const originalObjectKeys = Object.keys;
      Object.keys = jest.fn(() => mockKeys);
      
      // Call the function
      emptyNamespace('nonExistentNamespace');
      
      // Verify removeItem was not called
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(0);
      
      // Restore original Object.keys
      Object.keys = originalObjectKeys;
    });
  });
});
