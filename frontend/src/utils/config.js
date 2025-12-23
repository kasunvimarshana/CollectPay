// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  TIMEOUT: 30000,
};

// Database Configuration
export const DB_CONFIG = {
  NAME: 'transactrack.db',
  VERSION: 1,
};

// Sync Configuration
export const SYNC_CONFIG = {
  AUTO_SYNC_INTERVAL: 60000, // 1 minute
  MAX_RETRY_COUNT: 3,
  RETRY_DELAY: 5000, // 5 seconds
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'TransacTrack',
  VERSION: '1.0.0',
  DEFAULT_DEVICE_NAME: 'Mobile App',
};

// Unit Conversions
export const UNITS = {
  WEIGHT: {
    gram: { label: 'Grams (g)', base: 0.001 },
    kilogram: { label: 'Kilograms (kg)', base: 1 },
  },
  VOLUME: {
    milliliter: { label: 'Milliliters (ml)', base: 0.001 },
    liter: { label: 'Liters (L)', base: 1 },
  },
};

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  COLLECTOR: 'collector',
  VIEWER: 'viewer',
};

// Payment Types
export const PAYMENT_TYPES = {
  ADVANCE: 'advance',
  PARTIAL: 'partial',
  FULL: 'full',
  ADJUSTMENT: 'adjustment',
};

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'check', label: 'Check' },
];

export default {
  API_CONFIG,
  DB_CONFIG,
  SYNC_CONFIG,
  APP_CONFIG,
  UNITS,
  ROLES,
  PAYMENT_TYPES,
  PAYMENT_METHODS,
};
