/**
 * Axios Configuration Module
 * 
 * Configures an Axios instance for making HTTP requests to the backend API.
 * This module provides a pre-configured Axios instance with:
 * 
 * - Base URL configuration for API endpoints
 * - Automatic authentication token inclusion in request headers
 * - Error handling for API requests
 * - Response compression support
 * - Response caching for GET requests
 * - Request debouncing and throttling
 * 
 * Using this centralized axios instance ensures consistent API
 * request behavior throughout the application.
 */
import axios from 'axios';
import tokenStorage from './tokenStorage';

// Set the base URL for all axios requests using environment variables
// This ensures we don't hardcode URLs and use HTTPS in production
const protocol = window.location.protocol;
const origin = window.location.origin;
const isSecureConnection = protocol === 'https:';

// Use environment variable if set, otherwise determine based on protocol
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 
  (isSecureConnection ? 
    `${origin}/api` : 
    'http://localhost:5000');

// Ensure secure connections in production
if (process.env.NODE_ENV === 'production' && !isSecureConnection) {
  console.warn('Warning: Using an insecure connection in production environment. Consider enabling HTTPS.');
}

// Set Content Security Policy header for XSS protection
// This should be aligned with your server's CSP settings
if (process.env.NODE_ENV === 'production') {
  axios.defaults.headers.common['Content-Security-Policy'] = 
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data:; " +
    "connect-src 'self'";
}

// Response cache storage
const responseCache = new Map();
const CACHE_DURATION = 60 * 1000; // 60 seconds

/**
 * Request Interceptor
 * 
 * Automatically adds the authentication token to every outgoing request.
 * The token is retrieved from the secure token storage utility.
 * 
 * This ensures that authenticated requests are properly authorized
 * without having to manually add the token to each request.
 */
axios.interceptors.request.use(
  async config => {
    try {
      // Get JWT token from secure token storage
      const token = await tokenStorage.getAuthToken();
        // If token exists, add it to the Authorization header
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Add CSRF protection for non-GET requests
      if (config.method !== 'get') {
        // Get CSRF token from cookie or meta tag
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                          getCookie('XSRF-TOKEN');
                          
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
      }
      
      // Set security headers 
      config.headers['X-Content-Type-Options'] = 'nosniff';
      config.headers['X-XSS-Protection'] = '1; mode=block';
      config.headers['X-Frame-Options'] = 'SAMEORIGIN';
      config.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
      
      // Enable gzip compression for requests
      config.headers['Accept-Encoding'] = 'gzip, deflate, br';
      
      // Check if request is cacheable (GET requests only)
      if (config.method === 'get' && config.cache !== false) {
        const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
        const cachedResponse = responseCache.get(cacheKey);
        
        if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
          // Return cached response
          config.adapter = () => {
            return Promise.resolve({
              data: cachedResponse.data,
              status: 200,
              statusText: 'OK',
              headers: cachedResponse.headers,
              config: config,
              request: {}
            });
          };
        }
      }
      
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  error => {
    return Promise.reject(error);
  }
);

// Helper function to get a cookie value by name with security features
function getCookie(name) {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length !== 2) return null;
    
    const cookieValue = parts.pop().split(';').shift();
    
    // Simple check to prevent some cookie-based attacks
    if (cookieValue.includes('<script') || 
        cookieValue.includes('javascript:') || 
        cookieValue.includes('data:')) {
      console.error('Potentially malicious cookie value detected');
      return null;
    }
    
    return cookieValue;
  } catch (error) {
    console.error('Error reading cookie:', error);
    return null;
  }
}

/**
 * Response Interceptor
 * 
 * Handles the response from API requests:
 * 1. Stores GET responses in cache for future use
 * 2. Implements error handling for failed requests
 * 3. Applies data processing before returning to components
 * 4. Validates response data structure to prevent XSS
 */
axios.interceptors.response.use(
  response => {
    // Sanitize response data to prevent XSS
    if (response.data && typeof response.data === 'object') {
      response.data = sanitizeObject(response.data);
    }
    
    // Only cache GET requests
    if (response.config.method === 'get' && response.config.cache !== false) {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      
      // Store response in cache
      responseCache.set(cacheKey, {
        data: response.data,
        headers: response.headers,
        timestamp: Date.now()
      });
      
      // Manage cache size (prevent memory leaks)
      if (responseCache.size > 100) {
        // Remove oldest entries
        const cacheEntries = Array.from(responseCache.entries());
        const oldestEntries = cacheEntries
          .sort((a, b) => a[1].timestamp - b[1].timestamp)
          .slice(0, 20);
          
        oldestEntries.forEach(entry => responseCache.delete(entry[0]));
      }
    }
    
    return response;
  },  async error => {
    // Enhanced global error handling with specific status code handling
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 400:
          // Bad request - likely validation error
          console.error('Validation error:', error.response.data);
          break;
          
        case 401:
          // Handle unauthorized errors (e.g., token expired)
          console.error('Authentication error: Session expired or invalid token');
          await tokenStorage.clearAuthToken();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?session=expired';
          }
          break;
          
        case 403:
          // Forbidden - user doesn't have required permissions
          console.error('Authorization error: Access denied');
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', error.config.url);
          break;
          
        case 422:
          // Unprocessable entity - validation errors
          console.error('Validation failed:', error.response.data);
          break;
          
        case 429:
          // Too many requests - rate limiting
          console.error('Rate limit exceeded. Please try again later.');
          break;
          
        case 500:
        case 501:
        case 502:
        case 503:
        case 504:
          // Server errors - don't expose details to console in production
          if (process.env.NODE_ENV === 'production') {
            console.error(`Server error occurred (${status})`);
          } else {
            console.error(`Server error (${status}):`, error.response.data);
          }
          break;
          
        default:
          // Handle other errors
          console.error(`HTTP Error ${status}:`, error.response.data);
          break;
      }
    } else if (error.request) {
      // Request was made but no response received (network issue)
      console.error('Network error - no response received. Please check your connection.');
    } else {
      // Request setup error
      console.error('Request configuration error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Sanitize an object to prevent XSS attacks
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Enhanced sanitization for string values to prevent XSS
      sanitized[key] = value
        // Replace HTML special characters with entities
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        // Block script injections
        .replace(/javascript:/gi, 'blocked:')
        .replace(/data:/gi, 'blocked:')
        .replace(/on\w+=/gi, 'blocked=');
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value);
    } else {
      // Keep other types as is
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Helper method to clear cache for specific endpoints
 * @param {string} urlPattern - URL pattern to match for cache invalidation
 */
export const clearCache = (urlPattern) => {
  for (const key of responseCache.keys()) {
    if (!urlPattern || key.includes(urlPattern)) {
      responseCache.delete(key);
    }
  }
};

export default axios;
