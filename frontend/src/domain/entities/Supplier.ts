/**
 * Supplier Entity
 * Represents a supplier in the system
 */

export class Supplier {
  constructor(
    private readonly id: string,
    private name: string,
    private code: string,
    private address: string,
    private phone: string,
    private email: string,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  public static create(
    id: string,
    name: string,
    code: string,
    address: string,
    phone: string,
    email: string,
    createdAt?: Date,
    updatedAt?: Date
  ): Supplier {
    return new Supplier(
      id,
      name,
      code,
      address,
      phone,
      email,
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

  public getAddress(): string {
    return this.address;
  }

  public setAddress(address: string): void {
    this.address = address;
    this.updatedAt = new Date();
  }

  public getPhone(): string {
    return this.phone;
  }

  public setPhone(phone: string): void {
    this.phone = phone;
    this.updatedAt = new Date();
  }

  public getEmail(): string {
    return this.email;
  }

  public setEmail(email: string): void {
    this.email = email;
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
      address: this.address,
      phone: this.phone,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
