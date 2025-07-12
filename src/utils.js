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
export function getRootUrl() {
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
export function base64encode(str) {
  if (typeof btoa === 'function') {
    return btoa(str);
  } else if (typeof Buffer !== 'undefined') {
    // Node.js environment
    return Buffer.from(str).toString('base64');
  }
  throw new Error('Base64 encoding not supported in this environment');
}

/**
 * Decodes a base64 string
 * @param {string} str - The base64 string to decode
 * @returns {string} Decoded string
 */
export function base64decode(str) {
  if (typeof atob === 'function') {
    return atob(str);
  } else if (typeof Buffer !== 'undefined') {
    // Node.js environment
    return Buffer.from(str, 'base64').toString();
  }
  throw new Error('Base64 decoding not supported in this environment');
}

/**
 * JSON stringify wrapper
 * @param {any} data - Data to stringify
 * @returns {string} JSON string
 */
export function jsonEncode(data) {
  return JSON.stringify(data);
}

/**
 * JSON parse wrapper
 * @param {string} json - JSON string to parse
 * @returns {any} Parsed data
 */
export function jsonDecode(json) {
  return JSON.parse(json);
}
