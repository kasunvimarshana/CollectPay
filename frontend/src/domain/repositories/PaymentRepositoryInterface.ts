/**
 * Payment Repository Interface
 * Defines the contract for payment data operations
 */

import { Payment } from '../entities/Payment';

export interface PaymentRepositoryInterface {
  /**
   * Create a new payment
   */
  create(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;

  /**
   * Get payment by ID
   */
  getById(id: string): Promise<Payment | null>;

  /**
   * Get all payments with pagination
   */
  getAll(page?: number, limit?: number): Promise<Payment[]>;

  /**
   * Get payments by supplier
   */
  getBySupplier(supplierId: string, page?: number, limit?: number): Promise<Payment[]>;

  /**
   * Update existing payment
   */
  update(id: string, payment: Partial<Payment>): Promise<Payment>;

  /**
   * Delete payment by ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Get total paid amount for supplier
   */
  getTotalPaid(supplierId: string): Promise<number>;
}
