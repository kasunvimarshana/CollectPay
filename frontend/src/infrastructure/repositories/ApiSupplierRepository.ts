/**
 * API Repository Implementation for Suppliers
 */

import { SupplierRepository } from '../../domain/repositories/SupplierRepository';
import { Supplier } from '../../domain/entities/Supplier';
import { apiClient } from '../api/ApiClient';

interface SupplierDTO {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export class ApiSupplierRepository implements SupplierRepository {
  private mapFromDTO(dto: SupplierDTO): Supplier {
    return Supplier.create(
      dto.id,
      dto.name,
      dto.code,
      dto.address,
      dto.phone,
      dto.email,
      new Date(dto.created_at),
      new Date(dto.updated_at)
    );
  }

  private mapToDTO(supplier: Supplier): Partial<SupplierDTO> {
    return {
      name: supplier.getName(),
      code: supplier.getCode(),
      address: supplier.getAddress(),
      phone: supplier.getPhone(),
      email: supplier.getEmail(),
    };
  }

  async findAll(): Promise<Supplier[]> {
    const response = await apiClient.get<ApiResponse<SupplierDTO[]>>('/suppliers');
    return response.data.map(dto => this.mapFromDTO(dto));
  }

  async findById(id: string): Promise<Supplier | null> {
    try {
      const response = await apiClient.get<ApiResponse<SupplierDTO>>(`/suppliers/${id}`);
      return this.mapFromDTO(response.data);
    } catch (error) {
      return null;
    }
  }

  async create(supplier: Supplier): Promise<Supplier> {
    const dto = this.mapToDTO(supplier);
    const response = await apiClient.post<ApiResponse<SupplierDTO>>('/suppliers', dto);
    return this.mapFromDTO(response.data);
  }

  async update(supplier: Supplier): Promise<Supplier> {
    const dto = this.mapToDTO(supplier);
    const response = await apiClient.put<ApiResponse<SupplierDTO>>(
      `/suppliers/${supplier.getId()}`,
      dto
    );
    return this.mapFromDTO(response.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/suppliers/${id}`);
  }

  async getBalance(id: string): Promise<{ balance: number; currency: string }> {
    const response = await apiClient.get<ApiResponse<{ balance: number; currency: string }>>(
      `/suppliers/${id}/balance`
    );
    return response.data;
  }
}
