import { jsonEncode, jsonDecode } from './utils.js';
import { createExpirationKey } from './namespace.js';

/**
 * Checks if a value has expired
 * @param {string} namespacedKey - The namespaced key to check
 * @returns {boolean} True if expired, false otherwise
 */
export function isExpired(namespacedKey) {
  const expirationKey = createExpirationKey(namespacedKey);
  const expiresValue = localStorage.getItem(expirationKey);
  
  if (expiresValue === null) {
    return false;
  }
  
  const expires = parseInt(expiresValue, 10);
  const now = Math.floor(Date.now() / 1000);
  
  return now >= expires;
}

/**
 * Sets a value in localStorage with optional expiration
 * @param {string} namespacedKey - The namespaced key
 * @param {any} value - The value to store
 * @param {number} [expires] - Optional expiration time in seconds
 */
export function setValue(namespacedKey, value, expires) {
  // Store the value
  localStorage.setItem(namespacedKey, jsonEncode(value));
  
  // Set expiration if provided
  if (typeof expires === 'number') {
    const expirationKey = createExpirationKey(namespacedKey);
    const expirationTime = Math.floor(Date.now() / 1000) + expires;
    localStorage.setItem(expirationKey, expirationTime.toString());
  }
}

/**
 * Gets a value from localStorage, checking for expiration
 * @param {string} namespacedKey - The namespaced key
 * @returns {any} The stored value or null if expired/not found
 */
export function getValue(namespacedKey) {
  // Check if the value has expired
  if (isExpired(namespacedKey)) {
    // Remove expired value and its expiration timestamp
    removeValue(namespacedKey);
    return null;
  }
  
  // Get the value
  const value = localStorage.getItem(namespacedKey);
  if (value === null) {
    return null;
  }
  
  try {
    return jsonDecode(value);
  } catch (e) {
    console.error('Error parsing stored value:', e);
    return null;
  }
}

/**
 * Removes a value and its expiration from localStorage
 * @param {string} namespacedKey - The namespaced key
 */
export function removeValue(namespacedKey) {
  // Remove the value
  localStorage.removeItem(namespacedKey);
  
  // Remove the expiration
  const expirationKey = createExpirationKey(namespacedKey);
  localStorage.removeItem(expirationKey);
}

/**
 * Removes all values with a specific namespace prefix
 * @param {string} namespacePrefix - The namespace prefix
 */
export function emptyNamespace(namespacePrefix) {
  const keys = Object.keys(localStorage);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.indexOf(namespacePrefix) > -1) {
      localStorage.removeItem(key);
    }
  }
}
