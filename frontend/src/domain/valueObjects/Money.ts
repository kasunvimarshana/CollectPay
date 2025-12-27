import { NegativeMoneyAmountError, CurrencyMismatchError } from '../exceptions/DomainExceptions';

/**
 * Money Value Object
 * 
 * Represents monetary values with proper handling of precision and currency.
 * Immutable value object following Clean Architecture principles.
 */
export class Money {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string = 'LKR') {
    if (amount < 0) {
      throw new NegativeMoneyAmountError(amount);
    }
    // Round to 2 decimal places to avoid floating point issues
    this.amount = Math.round(amount * 100) / 100;
    this.currency = currency;
  }

  /**
   * Get amount value
   */
  getAmount(): number {
    return this.amount;
  }

  /**
   * Get currency
   */
  getCurrency(): string {
    return this.currency;
  }

  /**
   * Add money
   */
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract money
   */
  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new NegativeMoneyAmountError(result);
    }
    return new Money(result, this.currency);
  }

  /**
   * Multiply by scalar
   */
  multiply(multiplier: number): Money {
    if (multiplier < 0) {
      throw new NegativeMoneyAmountError();
    }
    return new Money(this.amount * multiplier, this.currency);
  }

  /**
   * Divide by scalar
   */
  divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new Error('Divisor must be positive');
    }
    return new Money(this.amount / divisor, this.currency);
  }

  /**
   * Check equality
   */
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  /**
   * Compare with other money
   */
  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  /**
   * Compare with other money
   */
  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount < other.amount;
  }

  /**
   * Check if zero
   */
  isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Format for display
   */
  format(): string {
    return `${this.currency} ${this.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  /**
   * Ensure same currency
   */
  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
  }

  /**
   * Create from cents/smallest unit
   */
  static fromCents(cents: number, currency: string = 'LKR'): Money {
    return new Money(cents / 100, currency);
  }

  /**
   * Get cents/smallest unit
   */
  toCents(): number {
    return Math.round(this.amount * 100);
  }

  /**
   * Create zero money
   */
  static zero(currency: string = 'LKR'): Money {
    return new Money(0, currency);
  }

  /**
   * Create from string
   */
  static fromString(value: string, currency: string = 'LKR'): Money {
    const numValue = parseFloat(value.replace(/,/g, ''));
    if (isNaN(numValue)) {
      throw new Error('Invalid money value');
    }
    return new Money(numValue, currency);
  }
}
