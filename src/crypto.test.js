// crypto.test.js
import { encrypt, decrypt } from './crypto.js';

describe('Crypto', () => {
  describe('encrypt', () => {
    test('should encrypt a string value', () => {
      const value = 'test string';
      const key = 'testkey';
      const encrypted = encrypt(value, key);
      
      // Encrypted value should be different from original
      expect(encrypted).not.toBe(value);
      // Should be a string
      expect(typeof encrypted).toBe('string');
    });
    
    test('should encrypt an object value', () => {
      const value = { test: 'object', num: 123 };
      const key = 'testkey';
      const encrypted = encrypt(value, key);
      
      // Encrypted value should be a string
      expect(typeof encrypted).toBe('string');
      // Should not be JSON string of original object
      expect(encrypted).not.toBe(JSON.stringify(value));
    });
    
    test('should handle null value', () => {
      const value = null;
      const key = 'testkey';
      const encrypted = encrypt(value, key);
      
      // Should return the special marker
      expect(encrypted).toBe('__NULL__');
    });
    
    test('should handle undefined value', () => {
      const value = undefined;
      const key = 'testkey';
      const encrypted = encrypt(value, key);
      
      // Should return the special marker
      expect(encrypted).toBe('__NULL__');
    });
  });
  
  describe('decrypt', () => {
    test('should decrypt an encrypted string value', () => {
      const original = 'test string';
      const key = 'testkey';
      const encrypted = encrypt(original, key);
      const decrypted = decrypt(encrypted, key);
      
      // Decrypted value should match original
      expect(decrypted).toBe(original);
    });
    
    test('should decrypt an encrypted object value', () => {
      const original = { test: 'object', num: 123 };
      const key = 'testkey';
      const encrypted = encrypt(original, key);
      const decrypted = decrypt(encrypted, key);
      
      // Decrypted value should match original
      expect(decrypted).toEqual(original);
    });
    
    test('should handle null marker', () => {
      const encrypted = '__NULL__';
      const key = 'testkey';
      const decrypted = decrypt(encrypted, key);
      
      // Should return null
      expect(decrypted).toBeNull();
    });
    
    test('should handle arrays', () => {
      const original = [1, 2, 'three', { four: 4 }];
      const key = 'testkey';
      const encrypted = encrypt(original, key);
      const decrypted = decrypt(encrypted, key);
      
      // Decrypted value should match original
      expect(decrypted).toEqual(original);
    });
    
    test('should handle nested objects', () => {
      const original = { 
        name: 'test',
        details: {
          age: 30,
          items: ['one', 'two'],
          nested: {
            deep: true
          }
        }
      };
      const key = 'testkey';
      const encrypted = encrypt(original, key);
      const decrypted = decrypt(encrypted, key);
      
      // Decrypted value should match original
      expect(decrypted).toEqual(original);
    });
    
    test('should handle special characters', () => {
      const original = 'Special chars: !@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./';
      const key = 'testkey';
      const encrypted = encrypt(original, key);
      const decrypted = decrypt(encrypted, key);
      
      // Decrypted value should match original
      expect(decrypted).toBe(original);
    });
    
    test('should handle empty string', () => {
      const original = '';
      const key = 'testkey';
      const encrypted = encrypt(original, key);
      const decrypted = decrypt(encrypted, key);
      
      // Decrypted value should match original
      expect(decrypted).toBe(original);
    });
  });
  
  describe('encryption/decryption with different keys', () => {
    test('should produce different results with different keys', () => {
      const value = 'test string';
      const key1 = 'key1';
      const key2 = 'key2';
      
      const encrypted1 = encrypt(value, key1);
      const encrypted2 = encrypt(value, key2);
      
      // Different keys should produce different encrypted values
      expect(encrypted1).not.toBe(encrypted2);
    });
    
    test('should fail to decrypt with wrong key', () => {
      const value = 'test string';
      const encryptKey = 'correctkey';
      const decryptKey = 'wrongkey';
      
      const encrypted = encrypt(value, encryptKey);
      
      // Decrypting with wrong key should not match original value
      const decrypted = decrypt(encrypted, decryptKey);
      expect(decrypted).not.toBe(value);
    });
  });
});
