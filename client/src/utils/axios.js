/**
 * Axios Configuration Module
 * 
 * Configures an Axios instance for making HTTP requests to the backend API.
 * This module provides a pre-configured Axios instance with:
 * 
 * - Base URL configuration for API endpoints
 * - Automatic authentication token inclusion in request headers
 * - Error handling for API requests
 * 
 * Using this centralized axios instance ensures consistent API
 * request behavior throughout the application.
 */
import axios from 'axios';

// Set the base URL for all axios requests
// Change this to match your backend URL
axios.defaults.baseURL = 'http://localhost:5000';

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
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axios;
