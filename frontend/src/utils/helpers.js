import { UNITS } from './config';

/**
 * Convert quantity from one unit to base unit
 */
export const convertToBaseUnit = (quantity, unit) => {
  const unitConfig = UNITS.WEIGHT[unit] || UNITS.VOLUME[unit];
  if (!unitConfig) {
    throw new Error(`Unknown unit: ${unit}`);
  }
  return quantity * unitConfig.base;
};

/**
 * Convert quantity from base unit to target unit
 */
export const convertFromBaseUnit = (quantity, unit) => {
  const unitConfig = UNITS.WEIGHT[unit] || UNITS.VOLUME[unit];
  if (!unitConfig) {
    throw new Error(`Unknown unit: ${unit}`);
  }
  return quantity / unitConfig.base;
};

/**
 * Format currency value
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString();
  } else if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } else if (format === 'datetime') {
    return d.toLocaleString();
  }
  
  return d.toISOString();
};

/**
 * Format quantity with unit
 */
export const formatQuantity = (quantity, unit) => {
  const unitConfig = UNITS.WEIGHT[unit] || UNITS.VOLUME[unit];
  const label = unitConfig?.label || unit;
  return `${quantity.toFixed(2)} ${label}`;
};

/**
 * Generate UUID v4
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Calculate collection amount
 */
export const calculateCollectionAmount = (quantity, unit, rate, rateUnit) => {
  // Convert quantity to base unit
  const baseQuantity = convertToBaseUnit(quantity, unit);
  
  // Calculate amount based on rate's unit
  const amount = baseQuantity * rate;
  
  return parseFloat(amount.toFixed(2));
};
