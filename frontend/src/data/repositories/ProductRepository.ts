import { ProductRepositoryInterface } from '../../domain/repositories/ProductRepositoryInterface';
import { Product, ProductRate } from '../../domain/entities/Product';
import { apiClient } from '../../core/network/ApiClient';
import { API_ENDPOINTS } from '../../core/constants/api';

/**
 * Product Repository Implementation
 * 
 * Implements product operations using the API client.
 */
export class ProductRepository implements ProductRepositoryInterface {
  async getAll(
    page: number = 1,
    perPage: number = 15,
    filters?: Record<string, any>
  ): Promise<{
    data: Product[];
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

    return await apiClient.get(API_ENDPOINTS.PRODUCTS, { params });
  }

  async getById(id: string): Promise<Product> {
    return await apiClient.get<Product>(API_ENDPOINTS.PRODUCT(id));
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'currentRate'>): Promise<Product> {
    return await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS, data);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    return await apiClient.put<Product>(API_ENDPOINTS.PRODUCT(id), data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCT(id));
  }

  async addRate(productId: string, rate: ProductRate): Promise<Product> {
    return await apiClient.post<Product>(API_ENDPOINTS.PRODUCT_RATE(productId), {
      amount: rate.amount,
      currency: rate.currency,
      unit: rate.unit,
      effective_date: rate.effectiveDate,
    });
  }
}
