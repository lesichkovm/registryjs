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

function getNamespace(namespace) {
    let namespaceFinal = "";
    if (typeof namespace === "undefined" || namespace === null || namespace === "") {
        namespaceFinal = getRootUrl();
    } else {
        namespaceFinal = "@" + namespace;
    }
    return base64encode(namespaceFinal);
}

function base64encode(str) {
    return btoa(str);
}

function base64decode(str) {
    return atob(str);
}

/**
 * Creates a new instance of the Registry class.
 * 
 * @param {string} [namespace] - An optional namespace for storing values. If not provided, the hostname of the current URL is used.
 * 
 * @example
 * const registry = new Registry();
 * const registry = new Registry('my-app');
 */
function Registry(namespace) {
    const namespaceFinal = "@" + getNamespace(namespace);
  
    const defaultPassword =
      "8pVbaKePV3beCUZYbKSfujzucbcD3eqyJvCAUgQL8PbYe3VmAMSKC9esx8jV8M7KegPsxkDTpUKvu2UenQyPPjsDf92XnjtZh5GJRz8bQHZngNGKenKZHDD8";
  
    const password = namespace == "" ? namespace : defaultPassword;
  
    function jsonDecode(json) {
      return JSON.parse(json);
    }
  
    function jsonEncode(string) {
      return JSON.stringify(string);
    }
  
    /**
     * Gets a key from the key-vaue store, if it does not exist returns NULL
     * @param {string} key
     * @returns {Object}
     */
    this.get = function (key) {
      const keyNamespaced = key + namespaceFinal;
  
      if (localStorage.getItem(keyNamespaced) === null) {
        return null;
      }
  
      var expiresDate = localStorage.getItem(keyNamespaced + "&&expires");
      if (expiresDate === null) {
        return null;
      }
  
      const expires = new Date(expiresDate);
      const now = new Date();
      const isExpired = now.getTime() > expires.getTime() ? true : false;
  
      if (isExpired) {
        this.remove(keyNamespaced);
        return null;
      }
  
      const value = window.localStorage.getItem(keyNamespaced);
  
      if (value === null) {
        return null;
      }
  
      if (value === "undefined") {
        return null;
      }
  
      if (typeof value === "undefined") {
        return null;
      }
  
      const valueDecoded = jsonDecode(value);
      return this.decrypt(valueDecoded);
    };
    
    /**
     * Sets a value to a key
     * @param {string} key
     * @param {Object} value
     * @param {number} expires
     * @returns {void}
     */
    this.set = function (key, value, expires) {
      if (typeof value === "undefined") {
        value = null;
      }
  
      const expiresMilliseconds = typeof expires === "undefined" ? 60000000000 : expires * 1000;
      const keyNamespaced = key + namespaceFinal;
  
      if (value === null) {
        localStorage.removeItem(keyNamespaced);
        return;
      }
  
      const encValue = this.encrypt(value);
      localStorage.setItem(keyNamespaced, jsonEncode(encValue));
      const expiresTime = new Date().getTime() + expiresMilliseconds;
      const expiresDate = new Date();
      expiresDate.setTime(expiresTime);
      localStorage.setItem(keyNamespaced + "&&expires", expiresDate);
    };
  
    this.remove = function (key) {
      const keyNamespaced = key + namespaceFinal;
      localStorage.removeItem(keyNamespaced);
      localStorage.removeItem(keyNamespaced + "&&expires");
    };
  
    this.empty = function () {
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.indexOf(namespaceFinal) > -1) {
          localStorage.removeItem(key);
        }
      }
    };
  
    /**
     * Encrypts an object to a string
     * @return string
     */
    this.encrypt = function (obj) {
      const jsonString = JSON.stringify(obj);
      const passLen = password.length;
      
      const result = [];
      for (var i = 0; i < jsonString.length; i++) {
        const passOffset = i % passLen;
        const calAscii = jsonString.charCodeAt(i) + password.charCodeAt(passOffset);
        result.push(calAscii);
      }
  
      return JSON.stringify(result);
    };
  
    /**
     * Decrypts an string to the original object
     * @return object
     */
    this.decrypt = function (encStr) {
      const codesArr = JSON.parse(encStr);
      const passLen = password.length;
      
      const result = [];
      for (let i = 0; i < codesArr.length; i++) {
        const passOffset = i % passLen;
        const calAscii = codesArr[i] - password.charCodeAt(passOffset);
        result.push(calAscii);
      }
  
      let str = "";
      for (let i = 0; i < result.length; i++) {
        var ch = String.fromCharCode(result[i]);
        str += ch;
      }
  
      return JSON.parse(str);
    };
  }