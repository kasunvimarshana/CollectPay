// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
export const API_TIMEOUT = 30000; // 30 seconds

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@trackvault:auth_token',
  USER_DATA: '@trackvault:user_data',
  PENDING_OPERATIONS: '@trackvault:pending_operations',
  LAST_SYNC_TIME: '@trackvault:last_sync_time',
  APP_SETTINGS: '@trackvault:app_settings',
};

// Units
export const UNITS = {
  WEIGHT: ['kg', 'g', 'lb', 'oz'],
  VOLUME: ['l', 'ml', 'gal'],
  COUNT: ['units', 'pieces', 'boxes'],
};

export const ALL_UNITS = [...UNITS.WEIGHT, ...UNITS.VOLUME, ...UNITS.COUNT];

// Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export const SUPPLIER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

// Payment Types
export const PAYMENT_TYPES = {
  ADVANCE: 'advance',
  PARTIAL: 'partial',
  FINAL: 'final',
  ADJUSTMENT: 'adjustment',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 255,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  CODE_MAX_LENGTH: 50,
};

// Colors
export const COLORS = {
  PRIMARY: '#007AFF',
  SECONDARY: '#5856D6',
  SUCCESS: '#34C759',
  WARNING: '#FF9500',
  ERROR: '#FF3B30',
  INFO: '#5AC8FA',
  BACKGROUND: '#F2F2F7',
  SURFACE: '#FFFFFF',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#8E8E93',
  BORDER: '#C6C6C8',
  DISABLED: '#AEAEB2',
};

// Screen Names
export const SCREENS = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  
  // Main
  HOME: 'Home',
  DASHBOARD: 'Dashboard',
  
  // Suppliers
  SUPPLIERS_LIST: 'SuppliersList',
  SUPPLIER_DETAIL: 'SupplierDetail',
  SUPPLIER_CREATE: 'SupplierCreate',
  SUPPLIER_EDIT: 'SupplierEdit',
  
  // Products
  PRODUCTS_LIST: 'ProductsList',
  PRODUCT_DETAIL: 'ProductDetail',
  PRODUCT_CREATE: 'ProductCreate',
  PRODUCT_EDIT: 'ProductEdit',
  PRODUCT_RATES: 'ProductRates',
  
  // Collections
  COLLECTIONS_LIST: 'CollectionsList',
  COLLECTION_DETAIL: 'CollectionDetail',
  COLLECTION_CREATE: 'CollectionCreate',
  COLLECTION_EDIT: 'CollectionEdit',
  
  // Payments
  PAYMENTS_LIST: 'PaymentsList',
  PAYMENT_DETAIL: 'PaymentDetail',
  PAYMENT_CREATE: 'PaymentCreate',
  PAYMENT_EDIT: 'PaymentEdit',
  
  // Users
  USERS_LIST: 'UsersList',
  USER_DETAIL: 'UserDetail',
  USER_CREATE: 'UserCreate',
  USER_EDIT: 'UserEdit',
  
  // Settings
  SETTINGS: 'Settings',
  PROFILE: 'Profile',
  CHANGE_PASSWORD: 'ChangePassword',
  
  // Audit
  AUDIT_LOGS: 'AuditLogs',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  VALIDATION_ERROR: 'Please check your input.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  SYNC_ERROR: 'Failed to sync data. Will retry when online.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logout successful!',
  REGISTER: 'Registration successful!',
  CREATE: 'Created successfully!',
  UPDATE: 'Updated successfully!',
  DELETE: 'Deleted successfully!',
  SYNC: 'Data synced successfully!',
};
