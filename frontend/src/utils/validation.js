/**
 * Validation utilities for form inputs
 * Provides robust validation functions following best practices
 */

/**
 * Validates email address using RFC 5322 compliant regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email
 */
export const validateEmail = (email) => {
  if (!email) return false;
  
  // More robust email validation pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 max length
};

/**
 * Validates international phone numbers
 * Accepts formats: +94123456789, (123) 456-7890, 123-456-7890, 1234567890
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digit characters for length check
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Phone number should have 7-15 digits (international standard)
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return false;
  }
  
  // Allow various international formats
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,6}$/;
  
  return phoneRegex.test(phone);
};

/**
 * Validates numeric amount (for payments and collections)
 * @param {string|number} amount - Amount to validate
 * @param {number} min - Minimum allowed value (default: 0.01)
 * @param {number} max - Maximum allowed value (default: 1000000000)
 * @returns {object} - { isValid: boolean, error: string|null }
 */
export const validateAmount = (amount, min = 0.01, max = 1000000000) => {
  if (amount === '' || amount === null || amount === undefined) {
    return { isValid: false, error: 'Amount is required' };
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Invalid amount format' };
  }

  if (numAmount < min) {
    return { isValid: false, error: `Amount must be at least ${min}` };
  }

  if (numAmount > max) {
    return { isValid: false, error: `Amount cannot exceed ${max}` };
  }

  // Check for reasonable decimal places (2 for currency)
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { isValid: false, error: 'Amount cannot have more than 2 decimal places' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates quantity for collections
 * @param {string|number} quantity - Quantity to validate
 * @param {string} unit - Unit of measurement
 * @returns {object} - { isValid: boolean, error: string|null }
 */
export const validateQuantity = (quantity, unit = 'kg') => {
  if (quantity === '' || quantity === null || quantity === undefined) {
    return { isValid: false, error: 'Quantity is required' };
  }

  const numQuantity = typeof quantity === 'string' ? parseFloat(quantity) : quantity;

  if (isNaN(numQuantity)) {
    return { isValid: false, error: 'Invalid quantity format' };
  }

  if (numQuantity <= 0) {
    return { isValid: false, error: 'Quantity must be greater than 0' };
  }

  // Set reasonable maximums based on unit
  const maxValues = {
    grams: 1000000,    // 1000 kg max
    kg: 10000,          // 10 tons max
    liters: 10000,      // 10,000 liters max
    ml: 10000000,       // 10,000 liters max
  };

  const maxValue = maxValues[unit] || 1000000;

  if (numQuantity > maxValue) {
    return { isValid: false, error: `Quantity cannot exceed ${maxValue} ${unit}` };
  }

  return { isValid: true, error: null };
};

/**
 * Validates payment against supplier balance
 * @param {number} paymentAmount - Payment amount
 * @param {number} balance - Current supplier balance
 * @param {string} paymentType - Type of payment (advance, partial, full, adjustment)
 * @returns {object} - { isValid: boolean, error: string|null }
 */
export const validatePaymentAmount = (paymentAmount, balance, paymentType) => {
  const amountValidation = validateAmount(paymentAmount);
  if (!amountValidation.isValid) {
    return amountValidation;
  }

  const amount = parseFloat(paymentAmount);

  // For advance payments and adjustments, any positive amount is valid
  if (paymentType === 'advance' || paymentType === 'adjustment') {
    return { isValid: true, error: null };
  }

  // For partial and full payments, check against balance
  if (amount > balance) {
    return { 
      isValid: false, 
      error: `Payment amount (${amount.toFixed(2)}) cannot exceed balance (${balance.toFixed(2)})`
    };
  }

  // For full payment, amount should equal balance
  if (paymentType === 'full' && Math.abs(amount - balance) > 0.01) {
    return { 
      isValid: false, 
      error: `Full payment must equal the balance (${balance.toFixed(2)})`
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates required text field
 * @param {string} value - Text to validate
 * @param {string} fieldName - Name of the field for error message
 * @param {number} minLength - Minimum length (default: 1)
 * @param {number} maxLength - Maximum length (default: 255)
 * @returns {object} - { isValid: boolean, error: string|null }
 */
export const validateRequiredText = (value, fieldName, minLength = 1, maxLength = 255) => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (value.trim().length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }

  return { isValid: true, error: null };
};

/**
 * Validates date string in YYYY-MM-DD format
 * @param {string} dateString - Date string to validate
 * @param {boolean} allowFuture - Whether to allow future dates (default: true)
 * @returns {object} - { isValid: boolean, error: string|null }
 */
export const validateDate = (dateString, allowFuture = true) => {
  if (!dateString) {
    return { isValid: false, error: 'Date is required' };
  }

  // Check format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return { isValid: false, error: 'Date must be in YYYY-MM-DD format' };
  }

  const date = new Date(dateString);
  
  // Check if valid date
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date' };
  }

  // Check if future date when not allowed
  if (!allowFuture && date > new Date()) {
    return { isValid: false, error: 'Future dates are not allowed' };
  }

  // Check reasonable date range (not before 1900 or after 2100)
  const year = date.getFullYear();
  if (year < 1900 || year > 2100) {
    return { isValid: false, error: 'Date is out of valid range' };
  }

  return { isValid: true, error: null };
};

/**
 * Sanitizes text input to prevent XSS attacks
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Rounds amount to 2 decimal places using proper rounding to avoid floating point errors
 * @param {number} amount - Amount to round
 * @returns {number} - Rounded amount
 */
export const roundToTwoDecimals = (amount) => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

/**
 * Calculates total amount for collection using integer arithmetic to avoid floating point errors
 * @param {number} quantity - Quantity
 * @param {number} rate - Rate per unit
 * @returns {number} - Total amount rounded to 2 decimals
 */
export const calculateTotal = (quantity, rate) => {
  // Convert to cents/paise to work with integers
  const quantityInCents = Math.round(quantity * 100);
  const rateInCents = Math.round(rate * 100);
  
  // Perform integer multiplication
  const totalInCents = (quantityInCents * rateInCents) / 100;
  
  // Convert back to currency units
  return roundToTwoDecimals(totalInCents / 100);
};
