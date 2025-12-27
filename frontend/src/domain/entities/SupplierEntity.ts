import { ValidationException } from '../exceptions/DomainExceptions';
import { SupplierApiResponse } from '../../infrastructure/types/ApiTypes';

/**
 * Supplier Domain Entity
 * 
 * Core business entity representing a supplier in the domain.
 * Contains business logic and validation rules.
 * Framework-independent - no React or React Native dependencies.
 */
export class SupplierEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly code: string,
    public readonly address?: string,
    public readonly phone?: string,
    public readonly email?: string,
    public readonly metadata?: any,
    public readonly isActive: boolean = true,
    public readonly version: number = 1,
    public readonly totalCollections?: number,
    public readonly totalPayments?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validate();
  }

  /**
   * Validate business rules
   */
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new ValidationException('Supplier name is required');
    }

    if (this.name.length > 255) {
      throw new ValidationException('Supplier name cannot exceed 255 characters');
    }

    if (!this.code || this.code.trim().length === 0) {
      throw new ValidationException('Supplier code is required');
    }

    if (this.code.length > 255) {
      throw new ValidationException('Supplier code cannot exceed 255 characters');
    }

    if (this.email && !this.isValidEmail(this.email)) {
      throw new ValidationException('Invalid email format');
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Calculate balance (collections - payments)
   */
  getBalance(): number {
    const collections = this.totalCollections || 0;
    const payments = this.totalPayments || 0;
    return collections - payments;
  }

  /**
   * Calculate payment percentage
   */
  getPaymentPercentage(): number {
    const collections = this.totalCollections || 0;
    if (collections === 0) return 0;
    const payments = this.totalPayments || 0;
    return (payments / collections) * 100;
  }

  /**
   * Check if supplier has outstanding balance
   */
  hasOutstandingBalance(): boolean {
    return this.getBalance() > 0;
  }

  /**
   * Check if supplier is overpaid
   */
  isOverpaid(): boolean {
    return this.getBalance() < 0;
  }

  /**
   * Create a copy with updated fields
   */
  update(updates: Partial<Omit<SupplierEntity, 'id' | 'code' | 'version'>>): SupplierEntity {
    return new SupplierEntity(
      this.id,
      updates.name ?? this.name,
      this.code,
      updates.address ?? this.address,
      updates.phone ?? this.phone,
      updates.email ?? this.email,
      updates.metadata ?? this.metadata,
      updates.isActive ?? this.isActive,
      this.version + 1,
      updates.totalCollections ?? this.totalCollections,
      updates.totalPayments ?? this.totalPayments,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Create entity from API response
   */
  static fromApiResponse(data: SupplierApiResponse): SupplierEntity {
    return new SupplierEntity(
      data.id,
      data.name,
      data.code,
      data.address,
      data.phone,
      data.email,
      data.metadata,
      data.is_active ?? true,
      data.version ?? 1,
      data.total_collections,
      data.total_payments,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }

  /**
   * Convert to API format
   */
  toApiFormat(): any {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      address: this.address,
      phone: this.phone,
      email: this.email,
      metadata: this.metadata,
      is_active: this.isActive,
      version: this.version,
    };
  }

  /**
   * Convert to display format
   */
  toDisplayFormat(): any {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      address: this.address || 'N/A',
      phone: this.phone || 'N/A',
      email: this.email || 'N/A',
      isActive: this.isActive,
      balance: this.getBalance(),
      paymentPercentage: this.getPaymentPercentage(),
    };
  }
}
