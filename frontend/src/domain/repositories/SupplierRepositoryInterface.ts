import { Supplier } from '../entities/Supplier';

/**
 * Supplier Repository Interface
 * 
 * Defines the contract for supplier data operations.
 */
export interface SupplierRepositoryInterface {
  /**
   * Get all suppliers with pagination
   */
  getAll(page?: number, perPage?: number, filters?: Record<string, any>): Promise<{
    data: Supplier[];
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  }>;

  /**
   * Get a supplier by ID
   */
  getById(id: string): Promise<Supplier>;

  /**
   * Create a new supplier
   */
  create(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier>;

  /**
   * Update a supplier
   */
  update(id: string, data: Partial<Supplier>): Promise<Supplier>;

  /**
   * Delete a supplier
   */
  delete(id: string): Promise<void>;
}
