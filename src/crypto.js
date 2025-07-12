import { jsonEncode, jsonDecode } from './utils.js';

/**
 * Encrypts a value using the original Registry encryption algorithm
 * @param {any} value - Value to encrypt
 * @param {string} key - Encryption key (password)
 * @returns {string} - Encrypted string
 */
export function encrypt(value, key) {
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
export function decrypt(encryptedStr, key) {
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
