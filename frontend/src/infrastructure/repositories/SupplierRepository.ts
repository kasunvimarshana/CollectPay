import { SupplierEntity } from '../../domain/entities/SupplierEntity';
import { ISupplierRepository } from '../../domain/interfaces/ISupplierRepository';
import { SupplierApiResponse, PaginatedApiResponse } from '../types/ApiTypes';
import apiClient from '../../api/client';

/**
 * Update Supplier Data
 */
interface UpdateSupplierData {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  metadata?: any;
  is_active?: boolean;
  version: number;
}

/**
 * Supplier Repository Implementation
 * 
 * Implements the ISupplierRepository interface using the API client.
 * Part of the infrastructure layer - handles external API communication.
 */
export class SupplierRepository implements ISupplierRepository {
  /**
   * Get all suppliers with optional filters
   */
  async getAll(params?: {
    search?: string;
    is_active?: boolean;
    per_page?: number;
    page?: number;
    include_balance?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<{
    data: SupplierEntity[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  }> {
    const response = await apiClient.get('/suppliers', { params });
    
    return {
      data: response.data.data.map((item: any) => SupplierEntity.fromApiResponse(item)),
      current_page: response.data.current_page,
      per_page: response.data.per_page,
      total: response.data.total,
      last_page: response.data.last_page,
    };
  }

  /**
   * Get supplier by ID
   */
  async getById(id: number): Promise<SupplierEntity> {
    const response = await apiClient.get(`/suppliers/${id}`);
    return SupplierEntity.fromApiResponse(response.data);
  }

  /**
   * Find supplier by code
   */
  async findByCode(code: string): Promise<SupplierEntity | null> {
    try {
      const response = await apiClient.get('/suppliers', {
        params: { search: code },
      });
      
      const suppliers = response.data.data || [];
      const match = suppliers.find((s: any) => s.code === code);
      
      return match ? SupplierEntity.fromApiResponse(match) : null;
    } catch (error) {
      // If search fails, return null
      return null;
    }
  }

  /**
   * Create new supplier
   */
  async create(
    supplier: Omit<SupplierEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SupplierEntity> {
    const data = {
      name: supplier.name,
      code: supplier.code,
      address: supplier.address,
      phone: supplier.phone,
      email: supplier.email,
      metadata: supplier.metadata,
      is_active: supplier.isActive,
    };

    const response = await apiClient.post('/suppliers', data);
    return SupplierEntity.fromApiResponse(response.data);
  }

  /**
   * Update existing supplier
   */
  async update(
    id: number,
    supplier: Partial<SupplierEntity> & { version: number }
  ): Promise<SupplierEntity> {
    const data: UpdateSupplierData = {
      version: supplier.version,
    };

    if (supplier.name !== undefined) data.name = supplier.name;
    if (supplier.address !== undefined) data.address = supplier.address;
    if (supplier.phone !== undefined) data.phone = supplier.phone;
    if (supplier.email !== undefined) data.email = supplier.email;
    if (supplier.metadata !== undefined) data.metadata = supplier.metadata;
    if (supplier.isActive !== undefined) data.is_active = supplier.isActive;

    const response = await apiClient.put(`/suppliers/${id}`, data);
    return SupplierEntity.fromApiResponse(response.data);
  }

  /**
   * Delete supplier
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/suppliers/${id}`);
  }

  /**
   * Get supplier balance
   */
  async getBalance(id: number): Promise<{
    total_collections: number;
    total_payments: number;
    balance: number;
  }> {
    const response = await apiClient.get(`/suppliers/${id}/balance`);
    return response.data;
  }
}
