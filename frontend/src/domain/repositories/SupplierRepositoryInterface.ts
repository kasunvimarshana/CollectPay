/**
 * Supplier Repository Interface
 * Defines the contract for supplier data operations
 */

import { Supplier } from '../entities/Supplier';

export interface SupplierRepositoryInterface {
  /**
   * Create a new supplier
   */
  create(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier>;

  /**
   * Get supplier by ID
   */
  getById(id: string): Promise<Supplier | null>;

  /**
   * Get all suppliers with pagination
   */
  getAll(page?: number, limit?: number): Promise<Supplier[]>;

  /**
   * Update existing supplier
   */
  update(id: string, supplier: Partial<Supplier>): Promise<Supplier>;

  /**
   * Delete supplier by ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Search suppliers by name or code
   */
  search(query: string): Promise<Supplier[]>;
}
