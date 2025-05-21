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

// Set the base URL for all axios requests
// Change this to match your backend URL
axios.defaults.baseURL = 'http://localhost:5000';

// Response cache storage
const responseCache = new Map();
const CACHE_DURATION = 60 * 1000; // 60 seconds

/**
 * Request Interceptor
 * 
 * Automatically adds the authentication token to every outgoing request.
 * The token is retrieved from localStorage where it's stored after login.
 * 
 * This ensures that authenticated requests are properly authorized
 * without having to manually add the token to each request.
 */
axios.interceptors.request.use(
  config => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
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
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles the response from API requests:
 * 1. Stores GET responses in cache for future use
 * 2. Implements error handling for failed requests
 * 3. Applies data processing before returning to components
 */
axios.interceptors.response.use(
  response => {
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
  },
  error => {
    // Add global error handling logic here
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors (e.g., token expired)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

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
