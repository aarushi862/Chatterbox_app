const crypto = require('crypto');

// Encryption algorithm
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// Ensure key is 32 bytes
const KEY = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');

/**
 * Encrypt text message (End-to-End Encryption)
 * @param {string} text - Plain text message
 * @returns {object} - { encryptedText, iv }
 */
function encryptMessage(text) {
  if (!text) return { encryptedText: '', iv: '' };
  
  try {
    // Generate random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encryptedText: encrypted,
      iv: iv.toString('hex'),
    };
  } catch (error) {
    console.error('Encryption error:', error.message);
    return { encryptedText: text, iv: '' }; // Fallback to plain text
  }
}

/**
 * Decrypt text message
 * @param {string} encryptedText - Encrypted text
 * @param {string} ivHex - Initialization vector in hex
 * @returns {string} - Decrypted plain text
 */
function decryptMessage(encryptedText, ivHex) {
  if (!encryptedText || !ivHex) return encryptedText;
  
  try {
    // Convert IV from hex to buffer
    const iv = Buffer.from(ivHex, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    
    // Decrypt the text
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return encryptedText; // Fallback to encrypted text
  }
}

module.exports = { encryptMessage, decryptMessage };
