// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:8000/api'  // Android emulator
  : 'https://api.paycore.example.com/api';  // Production

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
};

// Unit Options
export const UNIT_OPTIONS = [
  { label: 'Kilogram (kg)', value: 'kg' },
  { label: 'Gram (g)', value: 'g' },
  { label: 'Liter (l)', value: 'l' },
  { label: 'Milliliter (ml)', value: 'ml' },
  { label: 'Unit', value: 'unit' },
];

// Payment Types
export const PAYMENT_TYPES = [
  { label: 'Advance', value: 'advance' },
  { label: 'Partial', value: 'partial' },
  { label: 'Full', value: 'full' },
];

// Payment Methods
export const PAYMENT_METHODS = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Cheque', value: 'cheque' },
  { label: 'Mobile Payment', value: 'mobile_payment' },
];

// Role Options
export const ROLE_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Collector', value: 'collector' },
];

// Date Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DISPLAY_DATE_FORMAT = 'DD/MM/YYYY';
export const DISPLAY_DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
