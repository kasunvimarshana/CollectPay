/**
 * Payment Entity
 * Represents a payment transaction
 */

import { Money } from '../valueObjects/Money';

export enum PaymentType {
  ADVANCE = 'advance',
  PARTIAL = 'partial',
  FINAL = 'final',
}

export class Payment {
  constructor(
    private readonly id: string,
    private readonly supplierId: string,
    private amount: Money,
    private type: PaymentType,
    private paymentDate: Date,
    private reference: string,
    private notes: string,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  public static create(
    id: string,
    supplierId: string,
    amount: number,
    currency: string,
    type: PaymentType,
    paymentDate: Date,
    reference: string = '',
    notes: string = '',
    createdAt?: Date,
    updatedAt?: Date
  ): Payment {
    return new Payment(
      id,
      supplierId,
      Money.create(amount, currency),
      type,
      paymentDate,
      reference,
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

  public getAmount(): Money {
    return this.amount;
  }

  public setAmount(amount: number, currency: string): void {
    this.amount = Money.create(amount, currency);
    this.updatedAt = new Date();
  }

  public getType(): PaymentType {
    return this.type;
  }

  public setType(type: PaymentType): void {
    this.type = type;
    this.updatedAt = new Date();
  }

  public getPaymentDate(): Date {
    return this.paymentDate;
  }

  public setPaymentDate(date: Date): void {
    this.paymentDate = date;
    this.updatedAt = new Date();
  }

  public getReference(): string {
    return this.reference;
  }

  public setReference(reference: string): void {
    this.reference = reference;
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
      amount: this.amount.toJSON(),
      type: this.type,
      paymentDate: this.paymentDate.toISOString(),
      reference: this.reference,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
