import { apiClient } from '../api/ApiClient';
import {
  SupplierRepository,
  SupplierFilters,
  SupplierListResult,
  CreateSupplierData,
  UpdateSupplierData,
} from '../../domain/repositories/SupplierRepository';
import { Supplier, createSupplier } from '../../domain/entities/Supplier';

/**
 * HTTP Supplier Repository Implementation
 * 
 * Implements supplier repository using HTTP API
 * Follows Dependency Inversion Principle
 */
export class HttpSupplierRepository implements SupplierRepository {
  private readonly basePath = '/suppliers';

  async getAll(
    filters?: SupplierFilters,
    page: number = 1,
    perPage: number = 15
  ): Promise<SupplierListResult> {
    try {
      const params: any = { page, per_page: perPage };
      
      if (filters?.active !== undefined) {
        params.active = filters.active;
      }
      if (filters?.search) {
        params.search = filters.search;
      }

      const response = await apiClient.get<any>(this.basePath, params);

      return {
        data: response.data.map(createSupplier),
        total: response.meta.total,
        page: response.meta.page,
        perPage: response.meta.per_page,
        lastPage: response.meta.last_page,
      };
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error('Failed to fetch suppliers');
    }
  }

  async getById(id: string): Promise<Supplier | null> {
    try {
      const response = await apiClient.get<any>(`${this.basePath}/${id}`);
      return createSupplier(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching supplier:', error);
      throw new Error('Failed to fetch supplier');
    }
  }

  async create(data: CreateSupplierData): Promise<Supplier> {
    try {
      const response = await apiClient.post<any>(this.basePath, data);
      return createSupplier(response.data);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessage = Object.values(errors).flat().join(', ');
        throw new Error(errorMessage);
      }
      console.error('Error creating supplier:', error);
      throw new Error('Failed to create supplier');
    }
  }

  async update(id: string, data: UpdateSupplierData): Promise<Supplier> {
    try {
      const response = await apiClient.put<any>(`${this.basePath}/${id}`, data);
      return createSupplier(response.data);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessage = Object.values(errors).flat().join(', ');
        throw new Error(errorMessage);
      }
      console.error('Error updating supplier:', error);
      throw new Error('Failed to update supplier');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Supplier not found');
      }
      console.error('Error deleting supplier:', error);
      throw new Error('Failed to delete supplier');
    }
  }
}

// Export singleton instance
export const httpSupplierRepository = new HttpSupplierRepository();
