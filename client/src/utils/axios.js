import axios from 'axios';

// Set the base URL for all axios requests
// Change this to match your backend URL
axios.defaults.baseURL = 'http://localhost:5001';

// Add a request interceptor to add the authorization token
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
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
