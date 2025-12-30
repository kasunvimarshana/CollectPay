import { SupplierRepositoryInterface } from '../../domain/repositories/SupplierRepositoryInterface';
import { Supplier } from '../../domain/entities/Supplier';
import { apiClient } from '../../core/network/ApiClient';
import { API_ENDPOINTS } from '../../core/constants/api';

/**
 * Supplier Repository Implementation
 * 
 * Implements supplier operations using the API client.
 */
export class SupplierRepository implements SupplierRepositoryInterface {
  async getAll(
    page: number = 1,
    perPage: number = 15,
    filters?: Record<string, any>
  ): Promise<{
    data: Supplier[];
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  }> {
    const params: Record<string, any> = {
      page,
      per_page: perPage,
      ...filters,
    };

    return await apiClient.get(API_ENDPOINTS.SUPPLIERS, { params });
  }

  async getById(id: string): Promise<Supplier> {
    return await apiClient.get<Supplier>(API_ENDPOINTS.SUPPLIER(id));
  }

  async create(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    return await apiClient.post<Supplier>(API_ENDPOINTS.SUPPLIERS, data);
  }

  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    return await apiClient.put<Supplier>(API_ENDPOINTS.SUPPLIER(id), data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SUPPLIER(id));
  }
}
