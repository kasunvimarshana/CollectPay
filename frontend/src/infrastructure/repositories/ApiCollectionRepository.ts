/**
 * API Repository Implementation for Collections
 */

import { CollectionRepository } from '../../domain/repositories/CollectionRepository';
import { Collection } from '../../domain/entities/Collection';
import { apiClient } from '../api/ApiClient';

interface CollectionDTO {
  id: string;
  supplier_id: string;
  product_id: string;
  rate_id: string;
  quantity: number;
  unit: string;
  total_amount: number;
  currency: string;
  collection_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export class ApiCollectionRepository implements CollectionRepository {
  private mapFromDTO(dto: CollectionDTO): Collection {
    return Collection.create(
      dto.id,
      dto.supplier_id,
      dto.product_id,
      dto.rate_id,
      dto.quantity,
      dto.unit,
      dto.total_amount,
      dto.currency,
      new Date(dto.collection_date),
      dto.notes,
      new Date(dto.created_at),
      new Date(dto.updated_at)
    );
  }

  private mapToDTO(collection: Collection): Partial<CollectionDTO> {
    const quantity = collection.getQuantity();
    const totalAmount = collection.getTotalAmount();
    
    return {
      supplier_id: collection.getSupplierId(),
      product_id: collection.getProductId(),
      rate_id: collection.getRateId(),
      quantity: quantity.getValue(),
      unit: quantity.getUnit().toString(),
      total_amount: totalAmount.getAmount(),
      currency: totalAmount.getCurrency(),
      collection_date: collection.getCollectionDate().toISOString(),
      notes: collection.getNotes(),
    };
  }

  async findAll(): Promise<Collection[]> {
    const response = await apiClient.get<ApiResponse<CollectionDTO[]>>('/collections');
    return response.data.map(dto => this.mapFromDTO(dto));
  }

  async findById(id: string): Promise<Collection | null> {
    try {
      const response = await apiClient.get<ApiResponse<CollectionDTO>>(`/collections/${id}`);
      return this.mapFromDTO(response.data);
    } catch (error) {
      return null;
    }
  }

  async findBySupplierId(supplierId: string): Promise<Collection[]> {
    const response = await apiClient.get<ApiResponse<CollectionDTO[]>>(
      `/collections?supplier_id=${supplierId}`
    );
    return response.data.map(dto => this.mapFromDTO(dto));
  }

  async create(collection: Collection): Promise<Collection> {
    const dto = this.mapToDTO(collection);
    const response = await apiClient.post<ApiResponse<CollectionDTO>>('/collections', dto);
    return this.mapFromDTO(response.data);
  }

  async update(collection: Collection): Promise<Collection> {
    const dto = this.mapToDTO(collection);
    const response = await apiClient.put<ApiResponse<CollectionDTO>>(
      `/collections/${collection.getId()}`,
      dto
    );
    return this.mapFromDTO(response.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/collections/${id}`);
  }
}
