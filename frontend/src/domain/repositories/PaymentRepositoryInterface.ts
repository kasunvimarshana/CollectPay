import { Payment, Money } from '../entities/Payment';

/**
 * Payment Repository Interface
 * 
 * Defines the contract for payment data operations.
 */
export interface PaymentRepositoryInterface {
  /**
   * Get all payments with pagination
   */
  getAll(page?: number, perPage?: number, filters?: Record<string, any>): Promise<{
    data: Payment[];
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  }>;

  /**
   * Get a payment by ID
   */
  getById(id: string): Promise<Payment>;

  /**
   * Create a new payment
   */
  create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;

  /**
   * Delete a payment
   */
  delete(id: string): Promise<void>;

  /**
   * Calculate total payments for a supplier
   */
  calculateTotal(supplierId: string, fromDate?: string, toDate?: string): Promise<Money>;

  /**
   * Calculate outstanding balance for a supplier
   */
  calculateBalance(supplierId: string, fromDate?: string, toDate?: string): Promise<Money>;
}
