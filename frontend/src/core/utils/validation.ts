/**
 * Input Validation Utilities
 * 
 * Provides client-side input validation and sanitization
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class InputValidator {
  /**
   * Validate email address
   */
  static email(value: string): ValidationResult {
    if (!value) {
      return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }

  /**
   * Validate password
   */
  static password(value: string, minLength: number = 8): ValidationResult {
    if (!value) {
      return { isValid: false, error: 'Password is required' };
    }

    if (value.length < minLength) {
      return { isValid: false, error: `Password must be at least ${minLength} characters` };
    }

    return { isValid: true };
  }

  /**
   * Validate required field
   */
  static required(value: any, fieldName: string = 'Field'): ValidationResult {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: `${fieldName} is required` };
    }

    if (typeof value === 'string' && value.trim() === '') {
      return { isValid: false, error: `${fieldName} cannot be empty` };
    }

    return { isValid: true };
  }

  /**
   * Validate number
   */
  static number(value: any, min?: number, max?: number): ValidationResult {
    const num = Number(value);

    if (isNaN(num)) {
      return { isValid: false, error: 'Must be a valid number' };
    }

    if (min !== undefined && num < min) {
      return { isValid: false, error: `Must be at least ${min}` };
    }

    if (max !== undefined && num > max) {
      return { isValid: false, error: `Must be at most ${max}` };
    }

    return { isValid: true };
  }

  /**
   * Validate positive number
   */
  static positiveNumber(value: any): ValidationResult {
    const result = this.number(value, 0);
    if (!result.isValid) {
      return result;
    }

    if (Number(value) <= 0) {
      return { isValid: false, error: 'Must be a positive number' };
    }

    return { isValid: true };
  }

  /**
   * Validate date
   */
  static date(value: string): ValidationResult {
    if (!value) {
      return { isValid: false, error: 'Date is required' };
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }

    return { isValid: true };
  }

  /**
   * Validate phone number
   */
  static phone(value: string): ValidationResult {
    if (!value) {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Allow digits, spaces, dashes, parentheses, and plus sign
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!phoneRegex.test(value)) {
      return { isValid: false, error: 'Invalid phone number format' };
    }

    // Remove non-digit characters and check length
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return { isValid: false, error: 'Phone number must be 10-15 digits' };
    }

    return { isValid: true };
  }

  /**
   * Validate string length
   */
  static stringLength(
    value: string,
    minLength?: number,
    maxLength?: number
  ): ValidationResult {
    if (minLength !== undefined && value.length < minLength) {
      return { isValid: false, error: `Must be at least ${minLength} characters` };
    }

    if (maxLength !== undefined && value.length > maxLength) {
      return { isValid: false, error: `Must be at most ${maxLength} characters` };
    }

    return { isValid: true };
  }

  /**
   * Validate URL
   */
  static url(value: string): ValidationResult {
    if (!value) {
      return { isValid: false, error: 'URL is required' };
    }

    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  /**
   * Validate alphanumeric
   */
  static alphanumeric(value: string): ValidationResult {
    if (!value) {
      return { isValid: false, error: 'Field is required' };
    }

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(value)) {
      return { isValid: false, error: 'Only letters and numbers are allowed' };
    }

    return { isValid: true };
  }

  /**
   * Custom validator
   */
  static custom(
    value: any,
    validatorFn: (value: any) => boolean,
    errorMessage: string
  ): ValidationResult {
    const isValid = validatorFn(value);
    return isValid ? { isValid: true } : { isValid: false, error: errorMessage };
  }
}

export class InputSanitizer {
  /**
   * Sanitize string input
   */
  static string(value: string): string {
    if (!value) return '';
    return value.trim();
  }

  /**
   * Sanitize email
   */
  static email(value: string): string {
    if (!value) return '';
    return value.trim().toLowerCase();
  }

  /**
   * Sanitize number
   */
  static number(value: any): number | null {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Sanitize phone number
   */
  static phone(value: string): string {
    if (!value) return '';
    // Keep only digits, spaces, dashes, parentheses, and plus sign
    return value.replace(/[^\d\s\-\(\)\+]/g, '');
  }

  /**
   * Remove HTML tags
   */
  static removeHtml(value: string): string {
    if (!value) return '';
    return value.replace(/<[^>]*>/g, '');
  }

  /**
   * Remove special characters
   */
  static removeSpecialChars(value: string): string {
    if (!value) return '';
    return value.replace(/[^\w\s]/g, '');
  }

  /**
   * Sanitize for SQL (escape single quotes)
   */
  static sql(value: string): string {
    if (!value) return '';
    return value.replace(/'/g, "''");
  }
}

/**
 * Form validation helper
 */
export class FormValidator {
  private errors: Record<string, string> = {};

  /**
   * Validate field
   */
  validateField(fieldName: string, value: any, rules: ValidationRule[]): boolean {
    for (const rule of rules) {
      const result = rule.validator(value);
      if (!result.isValid) {
        this.errors[fieldName] = result.error || 'Invalid value';
        return false;
      }
    }

    delete this.errors[fieldName];
    return true;
  }

  /**
   * Get error for field
   */
  getError(fieldName: string): string | undefined {
    return this.errors[fieldName];
  }

  /**
   * Check if form has errors
   */
  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  /**
   * Get all errors
   */
  getAllErrors(): Record<string, string> {
    return { ...this.errors };
  }

  /**
   * Clear errors
   */
  clearErrors(): void {
    this.errors = {};
  }

  /**
   * Clear specific field error
   */
  clearError(fieldName: string): void {
    delete this.errors[fieldName];
  }
}

export interface ValidationRule {
  validator: (value: any) => ValidationResult;
  message?: string;
}

/**
 * Predefined validation rules
 */
export const ValidationRules = {
  required: (fieldName: string = 'Field'): ValidationRule => ({
    validator: (value) => InputValidator.required(value, fieldName),
  }),

  email: (): ValidationRule => ({
    validator: InputValidator.email,
  }),

  password: (minLength: number = 8): ValidationRule => ({
    validator: (value) => InputValidator.password(value, minLength),
  }),

  number: (min?: number, max?: number): ValidationRule => ({
    validator: (value) => InputValidator.number(value, min, max),
  }),

  positiveNumber: (): ValidationRule => ({
    validator: InputValidator.positiveNumber,
  }),

  date: (): ValidationRule => ({
    validator: InputValidator.date,
  }),

  phone: (): ValidationRule => ({
    validator: InputValidator.phone,
  }),

  minLength: (length: number): ValidationRule => ({
    validator: (value) => InputValidator.stringLength(value, length),
  }),

  maxLength: (length: number): ValidationRule => ({
    validator: (value) => InputValidator.stringLength(value, undefined, length),
  }),

  url: (): ValidationRule => ({
    validator: InputValidator.url,
  }),

  alphanumeric: (): ValidationRule => ({
    validator: InputValidator.alphanumeric,
  }),

  custom: (validatorFn: (value: any) => boolean, errorMessage: string): ValidationRule => ({
    validator: (value) => InputValidator.custom(value, validatorFn, errorMessage),
  }),
};
