/**
 * Money Value Object
 * Represents a monetary amount with currency
 */

export class Money {
  private readonly amount: number;
  private readonly currency: string;

  private constructor(amount: number, currency: string = 'USD') {
    this.amount = amount;
    this.currency = currency;
  }

  public static create(amount: number, currency: string = 'USD'): Money {
    if (amount < 0) {
      throw new Error('Invalid Money: amount cannot be negative');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('Invalid Money: currency must be a 3-letter code');
    }
    return new Money(amount, currency.toUpperCase());
  }

  public static zero(currency: string = 'USD'): Money {
    return new Money(0, currency);
  }

  public getAmount(): number {
    return this.amount;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  public subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    const result = this.amount - other.amount;
    // Note: Allowing negative results for scenarios like debt tracking
    // If you need to prevent negative balances, validate at a higher layer
    return new Money(result < 0 ? 0 : result, this.currency);
  }

  public multiply(multiplier: number): Money {
    if (multiplier < 0) {
      throw new Error('Multiplier cannot be negative');
    }
    return new Money(this.amount * multiplier, this.currency);
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  public isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount > other.amount;
  }

  public isLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount < other.amount;
  }

  public toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }

  public toJSON() {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }
}
