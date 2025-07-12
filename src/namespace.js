import { getRootUrl, base64encode } from './utils.js';

/**
 * Generates a namespaced key for storage
 * @param {string|null} namespace - Optional namespace
 * @returns {string} Base64 encoded namespace
 */
export function getNamespace(namespace) {
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
export function createNamespacedKey(key, namespace) {
    return key + namespace;
}

/**
 * Creates an expiration key
 * @param {string} namespacedKey - The namespaced key
 * @returns {string} Expiration key
 */
export function createExpirationKey(namespacedKey) {
    return namespacedKey + "&&expires";
}
