/**
 * Rate Entity
 * Represents a versioned product rate
 */

import { Money } from '../valueObjects/Money';

export class Rate {
  constructor(
    private readonly id: string,
    private readonly productId: string,
    private amount: Money,
    private effectiveFrom: Date,
    private effectiveTo: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  public static create(
    id: string,
    productId: string,
    amount: number,
    currency: string,
    effectiveFrom: Date,
    effectiveTo: Date | null = null,
    createdAt?: Date,
    updatedAt?: Date
  ): Rate {
    return new Rate(
      id,
      productId,
      Money.create(amount, currency),
      effectiveFrom,
      effectiveTo,
      createdAt || new Date(),
      updatedAt || new Date()
    );
  }

  public getId(): string {
    return this.id;
  }

  public getProductId(): string {
    return this.productId;
  }

  public getAmount(): Money {
    return this.amount;
  }

  public setAmount(amount: number, currency: string): void {
    this.amount = Money.create(amount, currency);
    this.updatedAt = new Date();
  }

  public getEffectiveFrom(): Date {
    return this.effectiveFrom;
  }

  public setEffectiveFrom(date: Date): void {
    this.effectiveFrom = date;
    this.updatedAt = new Date();
  }

  public getEffectiveTo(): Date | null {
    return this.effectiveTo;
  }

  public setEffectiveTo(date: Date | null): void {
    this.effectiveTo = date;
    this.updatedAt = new Date();
  }

  public isActive(date: Date = new Date()): boolean {
    const isAfterStart = date >= this.effectiveFrom;
    const isBeforeEnd = !this.effectiveTo || date <= this.effectiveTo;
    return isAfterStart && isBeforeEnd;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public toJSON() {
    return {
      id: this.id,
      productId: this.productId,
      amount: this.amount.getAmount(),
      currency: this.amount.getCurrency(),
      effectiveFrom: this.effectiveFrom.toISOString(),
      effectiveTo: this.effectiveTo ? this.effectiveTo.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
