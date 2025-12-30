import { Collection, Money } from '../entities/Collection';

/**
 * Collection Repository Interface
 * 
 * Defines the contract for collection data operations.
 */
export interface CollectionRepositoryInterface {
  /**
   * Get all collections with pagination
   */
  getAll(page?: number, perPage?: number, filters?: Record<string, any>): Promise<{
    data: Collection[];
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  }>;

  /**
   * Get a collection by ID
   */
  getById(id: string): Promise<Collection>;

  /**
   * Create a new collection
   */
  create(data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'rate' | 'totalAmount'>): Promise<Collection>;

  /**
   * Delete a collection
   */
  delete(id: string): Promise<void>;

  /**
   * Calculate total collections for a supplier
   */
  calculateTotal(supplierId: string, fromDate?: string, toDate?: string): Promise<Money>;
}
