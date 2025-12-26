import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variable or fallback to localhost
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Extract and log request ID for debugging
    const requestId = response.headers['x-request-id'];
    if (requestId) {
      response.data.request_id = requestId;
      // Log request ID in development mode
      if (__DEV__) {
        console.log(`[Request ID: ${requestId}] ${response.config.method?.toUpperCase()} ${response.config.url}`);
      }
    }
    return response;
  },
  async (error) => {
    // Extract request ID from error response
    const requestId = error.response?.headers['x-request-id'] || 
                      error.response?.data?.request_id || 
                      'N/A';
    
    // Add request ID to error object for debugging
    if (error.response) {
      error.response.request_id = requestId;
      error.request_id = requestId;
    }
    
    // Log error with request ID
    if (__DEV__) {
      console.error(`[Request ID: ${requestId}] Error:`, {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
      });
    }
    
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
