/**
 * Security Utilities
 * 
 * Provides security-related utility functions to enhance application security:
 * - Input validation functions to prevent injection attacks
 * - CSRF protection utilities
 * - Content security helpers
 * - Data sanitization functions
 */

/**
 * Validate and sanitize user input
 * 
 * @param {string} input - User input to validate
 * @param {object} options - Validation options
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input, options = {}) => {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  
  // Apply maximum length constraint
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }
  
  // Remove potentially dangerous content
  if (options.preventXSS !== false) {
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/javascript:/gi, 'blocked:')
      .replace(/data:/gi, 'blocked:')
      .replace(/on\w+=/gi, 'blocked=');
  }
  
  // Apply specific format validation if needed
  if (options.type === 'email') {
    // Basic email format validation
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(sanitized)) {
      return ''; // Invalid email
    }
  } else if (options.type === 'numeric') {
    // Ensure only numeric characters
    if (!/^\d+$/.test(sanitized)) {
      return ''; // Invalid numeric input
    }
  }
  
  return sanitized;
};

/**
 * Generate a CSRF token
 * 
 * @returns {string} - A new CSRF token
 */
export const generateCSRFToken = () => {
  const randomBytes = new Uint8Array(32);
  window.crypto.getRandomValues(randomBytes);
  
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Set a secure CSRF token in the document
 */
export const setCSRFToken = () => {
  const token = generateCSRFToken();
  
  // Create a meta tag to store the token
  let metaTag = document.querySelector('meta[name="csrf-token"]');
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.name = 'csrf-token';
    document.head.appendChild(metaTag);
  }
  
  // Set the token
  metaTag.content = token;
  
  // Also set in a secure cookie if possible
  if (window.isSecureContext) {
    document.cookie = `XSRF-TOKEN=${token}; path=/; SameSite=Strict; Secure`;
  } else {
    document.cookie = `XSRF-TOKEN=${token}; path=/; SameSite=Strict`;
  }
  
  return token;
};

/**
 * Validate passwords to ensure they meet security requirements
 * 
 * @param {string} password - The password to validate
 * @returns {object} - Validation result with reasons
 */
export const validatePasswordStrength = (password) => {
  const result = {
    isValid: true,
    score: 0,
    issues: []
  };
  
  // Check length
  if (!password || password.length < 8) {
    result.isValid = false;
    result.issues.push('Password must be at least 8 characters long');
  } else {
    result.score += 1;
  }
  
  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    result.issues.push('Password should contain at least one uppercase letter');
  } else {
    result.score += 1;
  }
  
  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    result.issues.push('Password should contain at least one lowercase letter');
  } else {
    result.score += 1;
  }
  
  // Check for numbers
  if (!/\d/.test(password)) {
    result.issues.push('Password should contain at least one number');
  } else {
    result.score += 1;
  }
  
  // Check for special characters
  if (!/[^A-Za-z0-9]/.test(password)) {
    result.issues.push('Password should contain at least one special character');
  } else {
    result.score += 1;
  }
  
  // Detect common patterns
  if (/123|abc|qwerty|password|admin/i.test(password)) {
    result.issues.push('Password contains a common pattern');
    result.score -= 1;
  }
  
  return result;
};

/**
 * Initialize security features when the app loads
 */
export const initSecurity = () => {
  // Generate and set a CSRF token
  setCSRFToken();
  
  // Set up event listener to refresh CSRF token periodically
  setInterval(setCSRFToken, 30 * 60 * 1000); // Every 30 minutes
};

export default {
  sanitizeInput,
  generateCSRFToken,
  setCSRFToken,
  validatePasswordStrength,
  initSecurity
};
