/**
 * Remote Product Data Source
 * Handles API communication for product operations
 */

import { Product } from '../../domain/entities/Product';
import { HttpClient } from './HttpClient';

export class RemoteProductDataSource {
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a new product
   */
  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return await this.httpClient.post<Product>('/products', data);
  }

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<Product> {
    return await this.httpClient.get<Product>(`/products/${id}`);
  }

  /**
   * Get all products
   */
  async getAll(page: number = 1, limit: number = 20): Promise<Product[]> {
    return await this.httpClient.get<Product[]>(`/products?page=${page}&limit=${limit}`);
  }

  /**
   * Update product
   */
  async update(id: string, data: Partial<Product>): Promise<Product> {
    return await this.httpClient.put<Product>(`/products/${id}`, data);
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<boolean> {
    await this.httpClient.delete(`/products/${id}`);
    return true;
  }

  /**
   * Search products
   */
  async search(query: string): Promise<Product[]> {
    return await this.httpClient.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get current rate for product
   */
  async getCurrentRate(productId: string): Promise<number> {
    const response = await this.httpClient.get<{ rate: number }>(`/products/${productId}/current-rate`);
    return response.rate;
  }
}
