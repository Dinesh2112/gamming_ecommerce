// src/axiosConfig.js
import axios from 'axios';

// Use environment variable with fallback to hardcoded URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('API URL:', API_URL);

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true; // 🔥 Important for cookie-based auth

// Add a request interceptor to attach the auth token to all requests
axios.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the request headers using the header name
    // expected by the backend middleware (x-auth-token)
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to help debug issues
axios.interceptors.response.use(
  (response) => {
    return response;
  }, 
  (error) => {
    // Log API errors in a more structured way
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`, 
        { url: error.config.url, data: error.response.data });
    } else {
      console.error('API Request failed:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axios;
