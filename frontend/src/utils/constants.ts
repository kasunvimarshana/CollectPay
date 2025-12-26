// Common constants used across the application

export const UNIT_OPTIONS = [
  { label: 'Kilogram (kg)', value: 'kg' },
  { label: 'Gram (g)', value: 'g' },
  { label: 'Liter (l)', value: 'l' },
  { label: 'Milliliter (ml)', value: 'ml' },
  { label: 'Unit', value: 'unit' },
];

export const PAYMENT_TYPE_OPTIONS = [
  { label: 'Advance', value: 'advance' },
  { label: 'Partial', value: 'partial' },
  { label: 'Full', value: 'full' },
];

export const PAYMENT_METHOD_OPTIONS = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Cheque', value: 'cheque' },
  { label: 'Mobile Payment', value: 'mobile_payment' },
];

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
