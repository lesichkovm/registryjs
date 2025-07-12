/**
 * Constructs and returns the root URL (origin) of the current web page.
 * It prioritizes `window.location.origin` for modern browser compatibility.
 * Falls back to manual construction using protocol, hostname, and port for older browsers
 * or environments where `origin` might not exist or return "null".
 * For 'file://' URLs, it explicitly returns "unknown" as there's no true web "origin".
 * Includes comprehensive checks for the existence of window, window.location, and its properties.
 *
 * @returns {string} The root URL (e.g., "https://www.example.com:8080", "http://localhost:80", or "unknown" if no valid web origin can be determined).
 */
function getRootUrl() {
  // Early exit for non-browser environments
  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
      console.warn("window or window.location is not available. Cannot determine root URL dynamically.");
      return "unknown";
  }

  // Attempt to use window.location.origin first (modern browser best practice)
  // This will handle most cases cleanly for http/https, and be 'null' for file://
  if (window.location.origin && window.location.origin !== 'null') {
      return window.location.origin;
  }

  // If origin is not available or is 'null', proceed with manual construction fallback.
  // Ensure basic protocol and hostname properties are available before proceeding.
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port; // Empty string if no explicit port

  // Check if essential components for a web URL exist and are valid strings
  const hasValidProtocol = typeof protocol === 'string' && protocol.length > 0;
  const hasValidHostname = typeof hostname === 'string' && hostname.length > 0;

  // Handle 'file://' protocol specifically (no true web origin)
  if (hasValidProtocol && protocol === 'file:') {
      console.warn("Detected 'file://' protocol. No standard web origin is available, returning 'unknown'.");
      return "unknown";
  }

  // Attempt to construct a standard web URL (http/https etc.)
  if (hasValidProtocol && hasValidHostname) {
      // Include port only if window.location.port is NOT an empty string
      const portString = port ? `:${port}` : '';
      return `${protocol}//${hostname}${portString}`;
  }

  // If all attempts to determine a valid root URL fail, return "unknown"
  console.warn("Could not determine root URL from window.location properties.");
  return "unknown";
}

/**
 * Encodes a string to base64
 * @param {string} str - The string to encode
 * @returns {string} Base64 encoded string
 */
function base64encode(str) {
  if (typeof btoa === 'function') {
    return btoa(str);
  } else if (typeof Buffer !== 'undefined') {
    // Node.js environment
    return Buffer.from(str).toString('base64');
  }
  throw new Error('Base64 encoding not supported in this environment');
}

/**
 * JSON stringify wrapper
 * @param {any} data - Data to stringify
 * @returns {string} JSON string
 */
function jsonEncode(data) {
  return JSON.stringify(data);
}

/**
 * JSON parse wrapper
 * @param {string} json - JSON string to parse
 * @returns {any} Parsed data
 */
function jsonDecode(json) {
  return JSON.parse(json);
}

/**
 * Generates a namespaced key for storage
 * @param {string|null} namespace - Optional namespace
 * @returns {string} Base64 encoded namespace
 */
function getNamespace(namespace) {
    let namespaceFinal = "";
    if (typeof namespace === "undefined" || namespace === null || namespace === "") {
        namespaceFinal = getRootUrl();
    } else {
        namespaceFinal = "@" + namespace;
    }
    return base64encode(namespaceFinal);
}

/**
 * Creates a namespaced key
 * @param {string} key - The original key
 * @param {string} namespace - The namespace
 * @returns {string} Namespaced key
 */
function createNamespacedKey(key, namespace) {
    return key + namespace;
}

/**
 * Creates an expiration key
 * @param {string} namespacedKey - The namespaced key
 * @returns {string} Expiration key
 */
function createExpirationKey(namespacedKey) {
    return namespacedKey + "&&expires";
}

/**
 * Encrypts a value using the original Registry encryption algorithm
 * @param {any} value - Value to encrypt
 * @param {string} key - Encryption key (password)
 * @returns {string} - Encrypted string
 */
function encrypt(value, key) {
  // Handle null or undefined values
  if (value === null || value === undefined) {
    return "__NULL__";
  }
  
  // Convert value to JSON string
  const jsonString = jsonEncode(value);
  const passLen = key.length;
  
  const result = [];
  for (let i = 0; i < jsonString.length; i++) {
    const passOffset = i % passLen;
    const calAscii = jsonString.charCodeAt(i) + key.charCodeAt(passOffset);
    result.push(calAscii);
  }

  return jsonEncode(result);
}

/**
 * Decrypts a value using the original Registry decryption algorithm
 * @param {string} encryptedStr - Encrypted string
 * @param {string} key - Encryption key (password)
 * @returns {any} - Decrypted value
 */
function decrypt(encryptedStr, key) {
  // Special case for null values
  if (encryptedStr === "__NULL__") {
    return null;
  }
  
  try {
    const codesArr = jsonDecode(encryptedStr);
    const passLen = key.length;
    
    const result = [];
    for (let i = 0; i < codesArr.length; i++) {
      const passOffset = i % passLen;
      const calAscii = codesArr[i] - key.charCodeAt(passOffset);
      result.push(calAscii);
    }

    let str = "";
    for (let i = 0; i < result.length; i++) {
      const ch = String.fromCharCode(result[i]);
      str += ch;
    }

    return jsonDecode(str);
  } catch (e) {
    console.error('Error decrypting value:', e);
    return null;
  }
}

/**
 * Checks if a value has expired
 * @param {string} namespacedKey - The namespaced key to check
 * @returns {boolean} True if expired, false otherwise
 */
function isExpired(namespacedKey) {
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
function setValue(namespacedKey, value, expires) {
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
function getValue(namespacedKey) {
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
function removeValue(namespacedKey) {
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
function emptyNamespace(namespacePrefix) {
  const keys = Object.keys(localStorage);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.indexOf(namespacePrefix) > -1) {
      localStorage.removeItem(key);
    }
  }
}

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

// Export for module environments while preserving browser functionality
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Registry;
} else if (typeof define === 'function' && define.amd) {
  // AMD support
  define([], function() {
    return Registry;
  });
} else {
  // Browser global
  if (typeof window !== 'undefined') {
    window.Registry = Registry;
  }
}

export { Registry as default };
