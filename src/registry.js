import { getNamespace, createNamespacedKey } from './namespace.js';
import { encrypt, decrypt } from './crypto.js';
import { setValue, getValue, removeValue, emptyNamespace } from './storage.js';

/**
 * Registry class for browser-based key-value storage with encryption,
 * namespacing, and expiration functionality.
 */
class Registry {
  /**
   * Creates a new Registry instance
   * @param {string} [namespace] - Optional namespace for isolating stored values
   */
  constructor(namespace) {
    // Generate the namespace
    const namespaceFinal = getNamespace(namespace);
    
    /**
     * Sets a value in the registry
     * @param {string} key - The key to store the value under
     * @param {any} value - The value to store
     * @param {number} [expires] - Optional expiration time in seconds
     */
    this.set = function(key, value, expires) {
      // Create namespaced key
      const namespacedKey = createNamespacedKey(key, namespaceFinal);
      
      // Encrypt the value (handles null/undefined internally)
      const encryptedValue = encrypt(value, key);
      
      // Store the value
      setValue(namespacedKey, encryptedValue, expires);
    };
    
    /**
     * Gets a value from the registry
     * @param {string} key - The key to retrieve
     * @returns {any} The stored value or null if not found/expired
     */
    this.get = function(key) {
      // Create namespaced key
      const namespacedKey = createNamespacedKey(key, namespaceFinal);
      
      // Get the encrypted value
      const encryptedValue = getValue(namespacedKey);
      
      // Return null if no value found
      if (encryptedValue === null) {
        return null;
      }
      
      // Check for our special null marker
      if (encryptedValue === "__NULL__") {
        return null;
      }
      
      try {
        // Decrypt the value - this will handle JSON parsing internally
        return decrypt(encryptedValue, key);
      } catch (e) {
        console.error('Error decrypting value:', e);
        return null;
      }
    };
    
    /**
     * Removes a value from the registry
     * @param {string} key - The key to remove
     */
    this.remove = function(key) {
      // Create namespaced key
      const namespacedKey = createNamespacedKey(key, namespaceFinal);
      
      // Remove the value
      removeValue(namespacedKey);
    };
    
    /**
     * Removes all values in the current namespace
     */
    this.empty = function() {
      // Empty the namespace
      emptyNamespace(namespaceFinal);
    };
  }
}

export default Registry;
