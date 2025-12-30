import { Product, ProductRate } from '../entities/Product';

/**
 * Product Repository Interface
 * 
 * Defines the contract for product data operations.
 */
export interface ProductRepositoryInterface {
  /**
   * Get all products with pagination
   */
  getAll(page?: number, perPage?: number, filters?: Record<string, any>): Promise<{
    data: Product[];
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  }>;

  /**
   * Get a product by ID
   */
  getById(id: string): Promise<Product>;

  /**
   * Create a new product
   */
  create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'currentRate'>): Promise<Product>;

  /**
   * Update a product
   */
  update(id: string, data: Partial<Product>): Promise<Product>;

  /**
   * Delete a product
   */
  delete(id: string): Promise<void>;

  /**
   * Add a rate to a product
   */
  addRate(productId: string, rate: ProductRate): Promise<Product>;
}
