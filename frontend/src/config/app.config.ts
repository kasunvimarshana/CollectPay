/**
 * Application Configuration
 * 
 * Central configuration for the PayMaster mobile application.
 */

const ENV = {
  development: {
    apiBaseUrl: 'http://localhost:8000/api',
    apiTimeout: 30000,
    syncRetryAttempts: 3,
    syncRetryDelay: 5000,
    enableLogging: true,
  },
  staging: {
    apiBaseUrl: 'https://staging-api.paymaster.com/api',
    apiTimeout: 30000,
    syncRetryAttempts: 3,
    syncRetryDelay: 5000,
    enableLogging: true,
  },
  production: {
    apiBaseUrl: 'https://api.paymaster.com/api',
    apiTimeout: 30000,
    syncRetryAttempts: 3,
    syncRetryDelay: 5000,
    enableLogging: false,
  },
};

const currentEnv = process.env.NODE_ENV || 'development';

export const config = {
  ...ENV[currentEnv],
  
  // App Information
  appName: 'PayMaster',
  appVersion: '1.0.0',
  
  // Storage Keys
  storageKeys: {
    authToken: 'auth_token',
    user: 'current_user',
    lastSync: 'last_sync_time',
  },
  
  // Sync Configuration
  sync: {
    autoSyncEnabled: true,
    syncOnForeground: true,
    syncOnNetworkRestore: true,
    batchSize: 50,
  },
  
  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,
  
  // Date Formats
  dateFormat: 'YYYY-MM-DD',
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
  displayDateFormat: 'MMM DD, YYYY',
  
  // Validation
  validation: {
    minPasswordLength: 8,
    maxNotesLength: 500,
    maxQuantity: 999999.999,
    maxAmount: 999999999.99,
  },
};

export default config;
