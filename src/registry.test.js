// registry.test.js
import Registry from './registry.js';

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
global.localStorage = localStorageMock;
global.btoa = str => Buffer.from(str).toString('base64');
global.atob = str => Buffer.from(str, 'base64').toString();

// Mock window.location for namespace generation
global.window = {
  location: {
    protocol: 'https:',
    hostname: 'example.com',
    port: '',
    origin: 'https://example.com'
  }
};

describe('Registry', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Registry initialization', () => {
    test('should create Registry with default namespace', () => {
      const registry = new Registry();
      expect(registry).toBeDefined();
    });

    test('should create Registry with custom namespace', () => {
      const registry = new Registry('custom');
      expect(registry).toBeDefined();
    });
  });

  describe('Registry.set and Registry.get', () => {
    test('should store and retrieve a value', () => {
      const registry = new Registry('test');
      registry.set('key1', 'value1');
      expect(registry.get('key1')).toBe('value1');
    });

    test('should store and retrieve an object', () => {
      const registry = new Registry('test');
      const testObj = { name: 'Test', value: 123 };
      registry.set('key2', testObj);
      expect(registry.get('key2')).toEqual(testObj);
    });

    test('should handle null values', () => {
      const registry = new Registry('test');
      registry.set('key3', null);
      expect(registry.get('key3')).toBeNull();
    });

    test('should handle undefined values', () => {
      const registry = new Registry('test');
      registry.set('key4', undefined);
      expect(registry.get('key4')).toBeNull();
    });
  });

  describe('Registry.remove', () => {
    test('should remove a stored value', () => {
      const registry = new Registry('test');
      registry.set('key5', 'value5');
      expect(registry.get('key5')).toBe('value5');
      
      registry.remove('key5');
      expect(registry.get('key5')).toBeNull();
    });
  });

  describe('Registry.empty', () => {
    test('should remove all values in the namespace', () => {
      const registry = new Registry('test');
      registry.set('key6', 'value6');
      registry.set('key7', 'value7');
      
      registry.empty();
      
      expect(registry.get('key6')).toBeNull();
      expect(registry.get('key7')).toBeNull();
    });

    test('should not affect values in other namespaces', () => {
      const registry1 = new Registry('test1');
      const registry2 = new Registry('test2');
      
      registry1.set('key8', 'value8');
      registry2.set('key9', 'value9');
      
      registry1.empty();
      
      expect(registry1.get('key8')).toBeNull();
      expect(registry2.get('key9')).toBe('value9');
    });
  });

  describe('Expiration functionality', () => {
    test('should respect expiration time', () => {
      jest.useFakeTimers();
      
      const registry = new Registry('test');
      registry.set('key10', 'value10', 1); // Expire in 1 second
      
      expect(registry.get('key10')).toBe('value10');
      
      // Advance time by 2 seconds
      jest.advanceTimersByTime(2000);
      
      expect(registry.get('key10')).toBeNull();
      
      jest.useRealTimers();
    });
  });
});
