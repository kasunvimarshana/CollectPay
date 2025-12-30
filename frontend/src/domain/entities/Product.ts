/**
 * Product Entity
 * Represents a product in the system
 */

import { Unit } from '../valueObjects/Unit';

export class Product {
  constructor(
    private readonly id: string,
    private name: string,
    private code: string,
    private defaultUnit: Unit,
    private description: string,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  public static create(
    id: string,
    name: string,
    code: string,
    defaultUnit: string,
    description: string,
    createdAt?: Date,
    updatedAt?: Date
  ): Product {
    return new Product(
      id,
      name,
      code,
      Unit.create(defaultUnit),
      description,
      createdAt || new Date(),
      updatedAt || new Date()
    );
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  public getCode(): string {
    return this.code;
  }

  public setCode(code: string): void {
    this.code = code;
    this.updatedAt = new Date();
  }

  public getDefaultUnit(): Unit {
    return this.defaultUnit;
  }

  public setDefaultUnit(unit: string): void {
    this.defaultUnit = Unit.create(unit);
    this.updatedAt = new Date();
  }

  public getDescription(): string {
    return this.description;
  }

  public setDescription(description: string): void {
    this.description = description;
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
      name: this.name,
      code: this.code,
      defaultUnit: this.defaultUnit.toString(),
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
