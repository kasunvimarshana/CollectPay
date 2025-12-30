/**
 * Storage Configuration
 * Configuration for local data storage
 */

export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: '@fieldpay:auth_token',
  REFRESH_TOKEN: '@fieldpay:refresh_token',
  USER_DATA: '@fieldpay:user_data',
  
  // Sync
  SYNC_TIMESTAMP: '@fieldpay:sync_timestamp',
  PENDING_SYNC: '@fieldpay:pending_sync',
  
  // Offline Data
  OFFLINE_SUPPLIERS: '@fieldpay:offline_suppliers',
  OFFLINE_PRODUCTS: '@fieldpay:offline_products',
  OFFLINE_RATES: '@fieldpay:offline_rates',
  OFFLINE_COLLECTIONS: '@fieldpay:offline_collections',
  OFFLINE_PAYMENTS: '@fieldpay:offline_payments',
  
  // Settings
  APP_SETTINGS: '@fieldpay:app_settings',
} as const;

export const SYNC_CONFIG = {
  // Sync interval (in milliseconds)
  INTERVAL: 60000, // 1 minute
  
  // Batch size for sync operations
  BATCH_SIZE: 50,
  
  // Max offline items to store
  MAX_OFFLINE_ITEMS: 1000,
} as const;
