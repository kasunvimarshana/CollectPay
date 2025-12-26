/**
 * API Client Configuration
 * 
 * Centralized HTTP client using Axios with interceptors for
 * authentication, error handling, and logging.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthManager } from '../auth/AuthManager';

// API base URL (from environment or config)
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.ledgerly.com';

/**
 * Create and configure Axios instance
 */
export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor: Add authentication token
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await AuthManager.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor: Handle errors and token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized - token expired
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh token
          const newToken = await AuthManager.refreshToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          await AuthManager.logout();
          return Promise.reject(refreshError);
        }
      }

      // Handle other errors
      return Promise.reject(handleApiError(error));
    }
  );

  return client;
};

/**
 * Handle and format API errors
 */
const handleApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    // Server responded with error status
    return {
      message: getErrorMessage(error.response.data),
      statusCode: error.response.status,
      errors: getValidationErrors(error.response.data),
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      message: 'Network error. Please check your connection.',
      statusCode: 0,
      errors: [],
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      statusCode: 0,
      errors: [],
    };
  }
};

/**
 * Extract error message from API response
 */
const getErrorMessage = (data: any): string => {
  if (typeof data === 'string') {
    return data;
  }
  if (data?.message) {
    return data.message;
  }
  if (data?.error) {
    return data.error;
  }
  return 'An error occurred';
};

/**
 * Extract validation errors from API response
 */
const getValidationErrors = (data: any): ValidationError[] => {
  if (data?.errors && typeof data.errors === 'object') {
    return Object.entries(data.errors).map(([field, messages]) => ({
      field,
      messages: Array.isArray(messages) ? messages : [String(messages)],
    }));
  }
  return [];
};

/**
 * API Error interface
 */
export interface ApiError {
  message: string;
  statusCode: number;
  errors: ValidationError[];
}

/**
 * Validation Error interface
 */
export interface ValidationError {
  field: string;
  messages: string[];
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  meta?: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

/**
 * Singleton API client instance
 */
export const apiClient = createApiClient();
