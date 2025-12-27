/**
 * Domain Exceptions
 * 
 * Domain-specific exception classes for better error handling.
 */

/**
 * Base Domain Exception
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

/**
 * Validation Exception
 */
export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationException';
  }
}

/**
 * Negative Money Amount Exception
 */
export class NegativeMoneyAmountError extends DomainException {
  constructor(amount?: number) {
    super(amount !== undefined 
      ? `Amount cannot be negative: ${amount}` 
      : 'Amount cannot be negative');
    this.name = 'NegativeMoneyAmountError';
  }
}

/**
 * Currency Mismatch Exception
 */
export class CurrencyMismatchError extends DomainException {
  constructor(currency1: string, currency2: string) {
    super(`Currency mismatch: ${currency1} vs ${currency2}`);
    this.name = 'CurrencyMismatchError';
  }
}

/**
 * Entity Not Found Exception
 */
export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: number | string) {
    super(`${entityName} with ID ${id} not found`);
    this.name = 'EntityNotFoundException';
  }
}

/**
 * Version Conflict Exception
 */
export class VersionConflictException extends DomainException {
  constructor(message: string = 'Version conflict: The resource has been modified by another user') {
    super(message);
    this.name = 'VersionConflictException';
  }
}

/**
 * Duplicate Entity Exception
 */
export class DuplicateEntityException extends DomainException {
  constructor(entityName: string, field: string, value: string) {
    super(`${entityName} with ${field} '${value}' already exists`);
    this.name = 'DuplicateEntityException';
  }
}
