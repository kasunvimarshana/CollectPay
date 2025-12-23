/**
 * Data validation utilities
 * Provides client-side validation before sync
 */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export class DataValidator {
  /**
   * Validate collection data
   */
  validateCollection(data: any): ValidationResult {
    const errors: Record<string, string> = {};
    
    if (!data.supplier_id) {
      errors.supplier_id = 'Supplier is required';
    }
    
    if (!data.product_id) {
      errors.product_id = 'Product is required';
    }
    
    if (!data.quantity || data.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!data.unit) {
      errors.unit = 'Unit is required';
    } else if (!['g', 'kg', 'ml', 'l'].includes(data.unit)) {
      errors.unit = 'Invalid unit. Must be g, kg, ml, or l';
    }
    
    if (!data.rate || data.rate <= 0) {
      errors.rate = 'Rate must be greater than 0';
    }
    
    if (!data.collection_date) {
      errors.collection_date = 'Collection date is required';
    } else {
      const date = new Date(data.collection_date);
      if (isNaN(date.getTime())) {
        errors.collection_date = 'Invalid date format';
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
  
  /**
   * Validate payment data
   */
  validatePayment(data: any): ValidationResult {
    const errors: Record<string, string> = {};
    
    if (!data.supplier_id) {
      errors.supplier_id = 'Supplier is required';
    }
    
    if (!data.amount || data.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    
    if (!data.payment_type) {
      errors.payment_type = 'Payment type is required';
    } else if (!['advance', 'partial', 'full'].includes(data.payment_type)) {
      errors.payment_type = 'Invalid payment type';
    }
    
    if (!data.payment_method) {
      errors.payment_method = 'Payment method is required';
    } else if (!['cash', 'bank_transfer', 'mobile_money', 'check'].includes(data.payment_method)) {
      errors.payment_method = 'Invalid payment method';
    }
    
    if (!data.payment_date) {
      errors.payment_date = 'Payment date is required';
    } else {
      const date = new Date(data.payment_date);
      if (isNaN(date.getTime())) {
        errors.payment_date = 'Invalid date format';
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
  
  /**
   * Validate supplier data
   */
  validateSupplier(data: any): ValidationResult {
    const errors: Record<string, string> = {};
    
    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Supplier name is required';
    } else if (data.name.length > 255) {
      errors.name = 'Supplier name is too long (max 255 characters)';
    }
    
    if (data.email && !this.isValidEmail(data.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    
    if (data.latitude && (data.latitude < -90 || data.latitude > 90)) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }
    
    if (data.longitude && (data.longitude < -180 || data.longitude > 180)) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
  
  /**
   * Validate product data
   */
  validateProduct(data: any): ValidationResult {
    const errors: Record<string, string> = {};
    
    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Product name is required';
    } else if (data.name.length > 255) {
      errors.name = 'Product name is too long (max 255 characters)';
    }
    
    if (!data.unit) {
      errors.unit = 'Unit is required';
    } else if (!['g', 'kg', 'ml', 'l'].includes(data.unit)) {
      errors.unit = 'Invalid unit. Must be g, kg, ml, or l';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
  
  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate phone number format
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }
  
  /**
   * Sanitize string input
   */
  sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
}

export const dataValidator = new DataValidator();
