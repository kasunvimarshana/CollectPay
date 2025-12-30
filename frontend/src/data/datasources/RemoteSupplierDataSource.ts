/**
 * Remote Supplier Data Source
 * Handles API communication for supplier operations
 */

import { Supplier } from '../../domain/entities/Supplier';
import { HttpClient } from './HttpClient';

export class RemoteSupplierDataSource {
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a new supplier
   */
  async create(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    return await this.httpClient.post<Supplier>('/suppliers', data);
  }

  /**
   * Get supplier by ID
   */
  async getById(id: string): Promise<Supplier> {
    return await this.httpClient.get<Supplier>(`/suppliers/${id}`);
  }

  /**
   * Get all suppliers
   */
  async getAll(page: number = 1, limit: number = 20): Promise<Supplier[]> {
    return await this.httpClient.get<Supplier[]>(`/suppliers?page=${page}&limit=${limit}`);
  }

  /**
   * Update supplier
   */
  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    return await this.httpClient.put<Supplier>(`/suppliers/${id}`, data);
  }

  /**
   * Delete supplier
   */
  async delete(id: string): Promise<boolean> {
    await this.httpClient.delete(`/suppliers/${id}`);
    return true;
  }

  /**
   * Search suppliers
   */
  async search(query: string): Promise<Supplier[]> {
    return await this.httpClient.get<Supplier[]>(`/suppliers/search?q=${encodeURIComponent(query)}`);
  }
}
