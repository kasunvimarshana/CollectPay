import { CollectionRepositoryInterface } from '../../domain/repositories/CollectionRepositoryInterface';
import { Collection, Money } from '../../domain/entities/Collection';
import { apiClient } from '../../core/network/ApiClient';
import { API_ENDPOINTS } from '../../core/constants/api';

/**
 * Collection Repository Implementation
 * 
 * Implements collection operations using the API client.
 */
export class CollectionRepository implements CollectionRepositoryInterface {
  async getAll(
    page: number = 1,
    perPage: number = 15,
    filters?: Record<string, any>
  ): Promise<{
    data: Collection[];
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

    return await apiClient.get(API_ENDPOINTS.COLLECTIONS, { params });
  }

  async getById(id: string): Promise<Collection> {
    return await apiClient.get<Collection>(API_ENDPOINTS.COLLECTION(id));
  }

  async create(
    data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'rate' | 'totalAmount'>
  ): Promise<Collection> {
    const requestData = {
      supplier_id: data.supplierId,
      product_id: data.productId,
      user_id: data.userId,
      quantity_value: data.quantity.value,
      quantity_unit: data.quantity.unit,
      collected_at: data.collectedAt,
      metadata: data.metadata,
    };

    return await apiClient.post<Collection>(API_ENDPOINTS.COLLECTIONS, requestData);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.COLLECTION(id));
  }

  async calculateTotal(supplierId: string, fromDate?: string, toDate?: string): Promise<Money> {
    const params: Record<string, any> = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;

    const response = await apiClient.get<{ total_amount: Money }>(
      API_ENDPOINTS.COLLECTION_TOTAL(supplierId),
      { params }
    );

    return response.total_amount;
  }
}
