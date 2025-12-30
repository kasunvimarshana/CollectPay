/**
 * Collection Repository Interface
 * Defines the contract for collection data operations
 */

import { Collection } from '../entities/Collection';

export interface CollectionRepositoryInterface {
  /**
   * Create a new collection
   */
  create(collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Collection>;

  /**
   * Get collection by ID
   */
  getById(id: string): Promise<Collection | null>;

  /**
   * Get all collections with pagination
   */
  getAll(page?: number, limit?: number): Promise<Collection[]>;

  /**
   * Get collections by supplier
   */
  getBySupplier(supplierId: string, page?: number, limit?: number): Promise<Collection[]>;

  /**
   * Get collections by product
   */
  getByProduct(productId: string, page?: number, limit?: number): Promise<Collection[]>;

  /**
   * Update existing collection
   */
  update(id: string, collection: Partial<Collection>): Promise<Collection>;

  /**
   * Delete collection by ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Get total quantity for supplier and product
   */
  getTotalQuantity(supplierId: string, productId: string): Promise<number>;
}
