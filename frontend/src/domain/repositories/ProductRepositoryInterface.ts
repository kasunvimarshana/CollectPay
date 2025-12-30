/**
 * Product Repository Interface
 * Defines the contract for product data operations
 */

import { Product } from '../entities/Product';

export interface ProductRepositoryInterface {
  /**
   * Create a new product
   */
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;

  /**
   * Get product by ID
   */
  getById(id: string): Promise<Product | null>;

  /**
   * Get all products with pagination
   */
  getAll(page?: number, limit?: number): Promise<Product[]>;

  /**
   * Update existing product
   */
  update(id: string, product: Partial<Product>): Promise<Product>;

  /**
   * Delete product by ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Search products by name or code
   */
  search(query: string): Promise<Product[]>;

  /**
   * Get current rate for a product
   */
  getCurrentRate(productId: string): Promise<number>;
}
