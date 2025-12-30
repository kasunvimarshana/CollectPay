/**
 * User Entity
 * Represents a user in the system
 */

import { UserId } from '../valueObjects/UserId';
import { Email } from '../valueObjects/Email';

export interface UserRole {
  name: string;
  permissions: string[];
}

export class User {
  constructor(
    private readonly id: UserId,
    private name: string,
    private email: Email,
    private roles: UserRole[],
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  public static create(
    id: string,
    name: string,
    email: string,
    roles: UserRole[] = [],
    createdAt?: Date,
    updatedAt?: Date
  ): User {
    return new User(
      UserId.create(id),
      name,
      Email.create(email),
      roles,
      createdAt || new Date(),
      updatedAt || new Date()
    );
  }

  public getId(): UserId {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  public getEmail(): Email {
    return this.email;
  }

  public setEmail(email: string): void {
    this.email = Email.create(email);
    this.updatedAt = new Date();
  }

  public getRoles(): UserRole[] {
    return [...this.roles];
  }

  public addRole(role: UserRole): void {
    if (!this.hasRole(role.name)) {
      this.roles.push(role);
      this.updatedAt = new Date();
    }
  }

  public removeRole(roleName: string): void {
    this.roles = this.roles.filter(r => r.name !== roleName);
    this.updatedAt = new Date();
  }

  public hasRole(roleName: string): boolean {
    return this.roles.some(r => r.name === roleName);
  }

  public hasPermission(permission: string): boolean {
    return this.roles.some(role => role.permissions.includes(permission));
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public toJSON() {
    return {
      id: this.id.getValue(),
      name: this.name,
      email: this.email.getValue(),
      roles: this.roles,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
