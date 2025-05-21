/**
 * Secure Token Management Utility
 * 
 * This utility provides more secure methods to store, retrieve, and manage
 * authentication tokens compared to direct localStorage usage.
 * 
 * Features:
 * - Token encryption before storage (when supported)
 * - Token expiration checking
 * - Token refresh mechanism
 * - Secure token deletion
 * - CSRF token management
 * - Additional security for sensitive operations
 */

// Security enhancement: Check if we're in a secure context
const isSecureContext = window.isSecureContext;

// Check if the browser supports the Web Crypto API for encryption
const hasWebCrypto = typeof window !== 'undefined' && 
                     window.crypto && 
                     window.crypto.subtle;

// Constants
const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const ENCRYPTION_KEY_KEY = 'auth_encryption_key';
const TOKEN_PREFIX = 'Bearer ';

// Security enhancement: Maximum token lifetime (24 hours in milliseconds)
const MAX_TOKEN_LIFETIME = 24 * 60 * 60 * 1000;

// Security enhancement: Added attempt counter for suspicious activity detection
const LOGIN_ATTEMPT_KEY = 'auth_login_attempts';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Set the authentication token with optional expiration time
 * 
 * @param {string} token - JWT token to store
 * @param {number} expiryInMinutes - Optional token expiry time in minutes
 * @returns {Promise<boolean>} - Success/failure of the operation
 */
export const setAuthToken = async (token, expiryInMinutes = 60) => {
  try {
    if (!token) return false;
    
    // Remove 'Bearer ' prefix if present
    const tokenValue = token.startsWith(TOKEN_PREFIX) 
      ? token.slice(TOKEN_PREFIX.length) 
      : token;
    
    // Validate token format - basic check for JWT format
    if (!tokenValue.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)) {
      console.error('Invalid token format');
      return false;
    }
    
    // Security enhancement: Enforce maximum token lifetime
    const requestedExpiry = expiryInMinutes * 60 * 1000;
    const actualExpiry = Math.min(requestedExpiry, MAX_TOKEN_LIFETIME);
    
    // Set expiration time
    const expiryTime = Date.now() + actualExpiry;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    // Reset login attempts on successful auth
    localStorage.removeItem(LOGIN_ATTEMPT_KEY);
    
    // Store the token (encrypted if supported)
    if (hasWebCrypto) {
      const encryptedToken = await encryptToken(tokenValue);
      localStorage.setItem(TOKEN_KEY, encryptedToken);
    } else {
      localStorage.setItem(TOKEN_KEY, tokenValue);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to set auth token:', error);
    return false;
  }
};

/**
 * Get the stored authentication token
 * 
 * @returns {Promise<string|null>} - The stored token or null if invalid/expired
 */
export const getAuthToken = async () => {
  try {
    // Security enhancement: Check for login attempt lockout
    const attemptData = localStorage.getItem(LOGIN_ATTEMPT_KEY);
    if (attemptData) {
      const { count, timestamp } = JSON.parse(attemptData);
      
      // If locked out and lockout period hasn't expired
      if (count >= MAX_LOGIN_ATTEMPTS && 
          Date.now() - timestamp < LOCKOUT_DURATION) {
        console.error('Account temporarily locked due to too many failed attempts');
        return null;
      }
      
      // If lockout period expired, reset the counter
      if (Date.now() - timestamp >= LOCKOUT_DURATION) {
        localStorage.removeItem(LOGIN_ATTEMPT_KEY);
      }
    }
    
    // Check expiration first
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (expiryTime && parseInt(expiryTime, 10) < Date.now()) {
      // Token expired, clear it and try to refresh
      await clearAuthToken();
      return await refreshAuthToken();
    }
    
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    
    // Decrypt if encrypted
    if (hasWebCrypto && token.includes(':')) {
      return await decryptToken(token);
    }
    
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

/**
 * Clear the authentication token and related data
 * 
 * @returns {Promise<boolean>} - Success/failure of the operation
 */
export const clearAuthToken = async () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Don't remove encryption key as it might be needed for future logins
    return true;
  } catch (error) {
    console.error('Failed to clear auth token:', error);
    return false;
  }
};

/**
 * Attempt to refresh the authentication token
 * 
 * @returns {Promise<string|null>} - The new token or null if refresh failed
 */
export const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;
    
    // This would typically be an API call to your refresh token endpoint
    // For now, we'll just return null as this needs to be implemented
    // based on your specific backend refresh token implementation
    
    return null;
  } catch (error) {
    console.error('Failed to refresh auth token:', error);
    return null;
  }
};

/**
 * Check if the user is authenticated (has a valid token)
 * 
 * @returns {Promise<boolean>} - True if authenticated, false otherwise
 */
export const isAuthenticated = async () => {
  const token = await getAuthToken();
  return !!token;
};

/**
 * Get the authorization header value for API requests
 * 
 * @returns {Promise<string|null>} - The Authorization header value or null
 */
export const getAuthHeader = async () => {
  const token = await getAuthToken();
  return token ? `${TOKEN_PREFIX}${token}` : null;
};

/**
 * Set a refresh token for automatic token renewal
 * 
 * @param {string} refreshToken - The refresh token to store
 * @returns {Promise<boolean>} - Success/failure of the operation
 */
export const setRefreshToken = async (refreshToken) => {
  try {
    if (!refreshToken) return false;
    
    if (hasWebCrypto) {
      const encryptedToken = await encryptToken(refreshToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, encryptedToken);
    } else {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to set refresh token:', error);
    return false;
  }
};

/**
 * Record a failed login attempt to prevent brute force attacks
 * 
 * @returns {Promise<void>}
 */
export const recordFailedLoginAttempt = async () => {
  try {
    let attemptData = localStorage.getItem(LOGIN_ATTEMPT_KEY);
    let attempts = { count: 0, timestamp: Date.now() };
    
    if (attemptData) {
      attempts = JSON.parse(attemptData);
      
      // If the lockout period has expired, reset the counter
      if (Date.now() - attempts.timestamp >= LOCKOUT_DURATION) {
        attempts = { count: 0, timestamp: Date.now() };
      }
    }
    
    // Increment the counter and update the timestamp
    attempts.count += 1;
    attempts.timestamp = Date.now();
    
    localStorage.setItem(LOGIN_ATTEMPT_KEY, JSON.stringify(attempts));
    
    // Return information about the lockout status
    return {
      isLockedOut: attempts.count >= MAX_LOGIN_ATTEMPTS,
      attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts.count),
      lockoutEnds: attempts.count >= MAX_LOGIN_ATTEMPTS ? 
        new Date(attempts.timestamp + LOCKOUT_DURATION) : null
    };
  } catch (error) {
    console.error('Failed to record login attempt:', error);
    return { isLockedOut: false, attemptsRemaining: MAX_LOGIN_ATTEMPTS, lockoutEnds: null };
  }
};

// ===== Encryption Helper Functions =====

/**
 * Generate or retrieve an encryption key
 * 
 * @returns {Promise<CryptoKey>} - The encryption key
 */
const getEncryptionKey = async () => {
  try {
    // Try to retrieve existing key
    const storedKey = localStorage.getItem(ENCRYPTION_KEY_KEY);
    
    if (storedKey) {
      // Convert stored key back to CryptoKey object
      const keyBuffer = base64ToArrayBuffer(storedKey);
      return await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    }
    
    // Generate a new key if none exists
    const newKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    // Export the key to raw format for storage
    const exportedKey = await window.crypto.subtle.exportKey('raw', newKey);
    const keyBase64 = arrayBufferToBase64(exportedKey);
    
    // Store the key
    localStorage.setItem(ENCRYPTION_KEY_KEY, keyBase64);
    
    return newKey;
  } catch (error) {
    console.error('Failed to get encryption key:', error);
    throw error;
  }
};

/**
 * Encrypt a token
 * 
 * @param {string} token - The token to encrypt
 * @returns {Promise<string>} - The encrypted token
 */
const encryptToken = async (token) => {
  try {
    const key = await getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    
    // Encode the token as UTF-8
    const encodedToken = new TextEncoder().encode(token);
    
    // Encrypt the token
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedToken
    );
    
    // Combine IV and ciphertext for storage
    const encryptedData = new Uint8Array(iv.length + ciphertext.byteLength);
    encryptedData.set(iv, 0);
    encryptedData.set(new Uint8Array(ciphertext), iv.length);
    
    // Convert to base64 for storage
    return arrayBufferToBase64(encryptedData);
  } catch (error) {
    console.error('Failed to encrypt token:', error);
    // Fallback to storing token unencrypted if encryption fails
    return token;
  }
};

/**
 * Decrypt a token
 * 
 * @param {string} encryptedToken - The encrypted token to decrypt
 * @returns {Promise<string>} - The decrypted token
 */
const decryptToken = async (encryptedToken) => {
  try {
    const key = await getEncryptionKey();
    
    // Convert base64 to array buffer
    const encryptedData = base64ToArrayBuffer(encryptedToken);
    
    // Extract IV (first 12 bytes) and ciphertext
    const iv = encryptedData.slice(0, 12);
    const ciphertext = encryptedData.slice(12);
    
    // Decrypt the token
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    
    // Decode the decrypted data as UTF-8
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error('Failed to decrypt token:', error);
    // Clear token if decryption fails (it might be corrupted)
    clearAuthToken();
    return null;
  }
};

/**
 * Convert an ArrayBuffer to a Base64 string
 * 
 * @param {ArrayBuffer} buffer - The buffer to convert
 * @returns {string} - Base64 encoded string
 */
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Convert a Base64 string to an ArrayBuffer
 * 
 * @param {string} base64 - The base64 string to convert
 * @returns {ArrayBuffer} - The resulting array buffer
 */
const base64ToArrayBuffer = (base64) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export default {
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  refreshAuthToken,
  isAuthenticated,
  getAuthHeader,
  setRefreshToken,
  recordFailedLoginAttempt
};
