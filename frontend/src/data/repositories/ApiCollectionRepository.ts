import { CollectionRepository } from '../../domain/repositories/CollectionRepository';
import { Collection, CreateCollectionDTO, UpdateCollectionDTO } from '../../domain/entities/Collection';
import { apiClient, ApiResponse } from '../datasources/ApiClient';

/**
 * API Collection Repository Implementation
 * 
 * Implements CollectionRepository interface using REST API.
 * This is the infrastructure layer implementation.
 */
export class ApiCollectionRepository implements CollectionRepository {
  private readonly baseUrl = '/collections';

  async getAll(page = 1, perPage = 15): Promise<Collection[]> {
    const response = await apiClient.get<Collection[]>(this.baseUrl, {
      page,
      per_page: perPage,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch collections');
    }

    return response.data;
  }

  async getById(id: number): Promise<Collection | null> {
    const response = await apiClient.get<Collection>(`${this.baseUrl}/${id}`);

    if (!response.success) {
      if (response.error?.code === 'NOT_FOUND') {
        return null;
      }
      throw new Error(response.error?.message || 'Failed to fetch collection');
    }

    return response.data || null;
  }

  async getBySupplier(supplierId: number): Promise<Collection[]> {
    const response = await apiClient.get<Collection[]>(
      `/suppliers/${supplierId}/collections`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch supplier collections');
    }

    return response.data;
  }

  async create(data: CreateCollectionDTO): Promise<Collection> {
    const response = await apiClient.post<Collection>(this.baseUrl, data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create collection');
    }

    return response.data;
  }

  async update(id: number, data: UpdateCollectionDTO): Promise<Collection> {
    const response = await apiClient.put<Collection>(
      `${this.baseUrl}/${id}`,
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update collection');
    }

    return response.data;
  }

  async delete(id: number): Promise<boolean> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.success;
  }
}
