/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints and settings.
 */

// API Base URL - Change this to your backend URL
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api'  // Development
  : 'https://your-production-url.com/api';  // Production

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  
  // Suppliers
  SUPPLIERS: '/suppliers',
  SUPPLIER: (id: string) => `/suppliers/${id}`,
  
  // Products
  PRODUCTS: '/products',
  PRODUCT: (id: string) => `/products/${id}`,
  PRODUCT_RATE: (id: string) => `/products/${id}/rates`,
  
  // Collections
  COLLECTIONS: '/collections',
  COLLECTION: (id: string) => `/collections/${id}`,
  COLLECTION_TOTAL: (supplierId: string) => `/suppliers/${supplierId}/collections/total`,
  
  // Payments
  PAYMENTS: '/payments',
  PAYMENT: (id: string) => `/payments/${id}`,
  PAYMENT_TOTAL: (supplierId: string) => `/suppliers/${supplierId}/payments/total`,
  PAYMENT_BALANCE: (supplierId: string) => `/suppliers/${supplierId}/balance`,
  
  // Users
  USERS: '/users',
  USER: (id: string) => `/users/${id}`,
  
  // Health Check
  HEALTH: '/health',
};

// API Settings
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@fieldledger:auth_token',
  USER_DATA: '@fieldledger:user_data',
  OFFLINE_QUEUE: '@fieldledger:offline_queue',
  LAST_SYNC: '@fieldledger:last_sync',
};
