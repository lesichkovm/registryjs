import Registry from './registry.js';

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

export default Registry;
