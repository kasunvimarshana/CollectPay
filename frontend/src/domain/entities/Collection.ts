/**
 * Collection Entity
 * Represents a collection transaction
 */

import { Quantity } from '../valueObjects/Quantity';
import { Money } from '../valueObjects/Money';

export class Collection {
  constructor(
    private readonly id: string,
    private readonly supplierId: string,
    private readonly productId: string,
    private readonly rateId: string,
    private quantity: Quantity,
    private totalAmount: Money,
    private collectionDate: Date,
    private notes: string,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  public static create(
    id: string,
    supplierId: string,
    productId: string,
    rateId: string,
    quantityValue: number,
    quantityUnit: string,
    totalAmount: number,
    currency: string,
    collectionDate: Date,
    notes: string = '',
    createdAt?: Date,
    updatedAt?: Date
  ): Collection {
    return new Collection(
      id,
      supplierId,
      productId,
      rateId,
      Quantity.create(quantityValue, quantityUnit),
      Money.create(totalAmount, currency),
      collectionDate,
      notes,
      createdAt || new Date(),
      updatedAt || new Date()
    );
  }

  public getId(): string {
    return this.id;
  }

  public getSupplierId(): string {
    return this.supplierId;
  }

  public getProductId(): string {
    return this.productId;
  }

  public getRateId(): string {
    return this.rateId;
  }

  public getQuantity(): Quantity {
    return this.quantity;
  }

  public setQuantity(value: number, unit: string): void {
    this.quantity = Quantity.create(value, unit);
    this.updatedAt = new Date();
  }

  public getTotalAmount(): Money {
    return this.totalAmount;
  }

  public setTotalAmount(amount: number, currency: string): void {
    this.totalAmount = Money.create(amount, currency);
    this.updatedAt = new Date();
  }

  public getCollectionDate(): Date {
    return this.collectionDate;
  }

  public setCollectionDate(date: Date): void {
    this.collectionDate = date;
    this.updatedAt = new Date();
  }

  public getNotes(): string {
    return this.notes;
  }

  public setNotes(notes: string): void {
    this.notes = notes;
    this.updatedAt = new Date();
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
      supplierId: this.supplierId,
      productId: this.productId,
      rateId: this.rateId,
      quantity: this.quantity.toJSON(),
      totalAmount: this.totalAmount.toJSON(),
      collectionDate: this.collectionDate.toISOString(),
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
