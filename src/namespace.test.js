// namespace.test.js
import { getNamespace, createNamespacedKey, createExpirationKey } from './namespace.js';
import { getRootUrl, base64encode } from './utils.js';

// Mock the utils functions
jest.mock('./utils.js', () => ({
  getRootUrl: jest.fn().mockReturnValue('http://test.com'),
  base64encode: jest.fn(str => `encoded_${str}`)
}));

describe('Namespace', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  describe('getNamespace', () => {
    test('should use getRootUrl when namespace is undefined', () => {
      const result = getNamespace(undefined);
      
      // Should call getRootUrl
      expect(getRootUrl).toHaveBeenCalled();
      // Should encode the result
      expect(base64encode).toHaveBeenCalledWith('http://test.com');
      // Should return encoded value
      expect(result).toBe('encoded_http://test.com');
    });
    
    test('should use getRootUrl when namespace is null', () => {
      const result = getNamespace(null);
      
      // Should call getRootUrl
      expect(getRootUrl).toHaveBeenCalled();
      // Should encode the result
      expect(base64encode).toHaveBeenCalledWith('http://test.com');
      // Should return encoded value
      expect(result).toBe('encoded_http://test.com');
    });
    
    test('should use getRootUrl when namespace is empty string', () => {
      const result = getNamespace('');
      
      // Should call getRootUrl
      expect(getRootUrl).toHaveBeenCalled();
      // Should encode the result
      expect(base64encode).toHaveBeenCalledWith('http://test.com');
      // Should return encoded value
      expect(result).toBe('encoded_http://test.com');
    });
    
    test('should prefix namespace with @ when provided', () => {
      const result = getNamespace('testNamespace');
      
      // Should not call getRootUrl
      expect(getRootUrl).not.toHaveBeenCalled();
      // Should encode the prefixed namespace
      expect(base64encode).toHaveBeenCalledWith('@testNamespace');
      // Should return encoded value
      expect(result).toBe('encoded_@testNamespace');
    });
  });
  
  describe('createNamespacedKey', () => {
    test('should concatenate key and namespace', () => {
      const key = 'testKey';
      const namespace = 'testNamespace';
      
      const result = createNamespacedKey(key, namespace);
      
      // Should concatenate key and namespace
      expect(result).toBe('testKeytestNamespace');
    });
    
    test('should work with empty namespace', () => {
      const key = 'testKey';
      const namespace = '';
      
      const result = createNamespacedKey(key, namespace);
      
      // Should return just the key
      expect(result).toBe('testKey');
    });
    
    test('should work with empty key', () => {
      const key = '';
      const namespace = 'testNamespace';
      
      const result = createNamespacedKey(key, namespace);
      
      // Should return just the namespace
      expect(result).toBe('testNamespace');
    });
  });
  
  describe('createExpirationKey', () => {
    test('should append &&expires to the namespaced key', () => {
      const namespacedKey = 'testNamespacedKey';
      
      const result = createExpirationKey(namespacedKey);
      
      // Should append &&expires
      expect(result).toBe('testNamespacedKey&&expires');
    });
    
    test('should work with empty namespaced key', () => {
      const namespacedKey = '';
      
      const result = createExpirationKey(namespacedKey);
      
      // Should return just &&expires
      expect(result).toBe('&&expires');
    });
  });
});
