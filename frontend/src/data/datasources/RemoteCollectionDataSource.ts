/**
 * Remote Collection Data Source
 * Handles API communication for collection operations
 */

import { Collection } from '../../domain/entities/Collection';
import { HttpClient } from './HttpClient';

export class RemoteCollectionDataSource {
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a new collection
   */
  async create(data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Collection> {
    return await this.httpClient.post<Collection>('/collections', data);
  }

  /**
   * Get collection by ID
   */
  async getById(id: string): Promise<Collection> {
    return await this.httpClient.get<Collection>(`/collections/${id}`);
  }

  /**
   * Get all collections
   */
  async getAll(page: number = 1, limit: number = 20): Promise<Collection[]> {
    return await this.httpClient.get<Collection[]>(`/collections?page=${page}&limit=${limit}`);
  }

  /**
   * Get collections by supplier
   */
  async getBySupplier(supplierId: string, page: number = 1, limit: number = 20): Promise<Collection[]> {
    return await this.httpClient.get<Collection[]>(`/collections/supplier/${supplierId}?page=${page}&limit=${limit}`);
  }

  /**
   * Get collections by product
   */
  async getByProduct(productId: string, page: number = 1, limit: number = 20): Promise<Collection[]> {
    return await this.httpClient.get<Collection[]>(`/collections/product/${productId}?page=${page}&limit=${limit}`);
  }

  /**
   * Update collection
   */
  async update(id: string, data: Partial<Collection>): Promise<Collection> {
    return await this.httpClient.put<Collection>(`/collections/${id}`, data);
  }

  /**
   * Delete collection
   */
  async delete(id: string): Promise<boolean> {
    await this.httpClient.delete(`/collections/${id}`);
    return true;
  }

  /**
   * Get total quantity
   */
  async getTotalQuantity(supplierId: string, productId: string): Promise<number> {
    const response = await this.httpClient.get<{ total: number }>(
      `/collections/total-quantity?supplier_id=${supplierId}&product_id=${productId}`
    );
    return response.total;
  }
}
