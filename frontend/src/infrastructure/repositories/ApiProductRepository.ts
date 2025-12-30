/**
 * API Repository Implementation for Products
 */

import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';
import { apiClient } from '../api/ApiClient';

interface ProductDTO {
  id: string;
  name: string;
  code: string;
  default_unit: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export class ApiProductRepository implements ProductRepository {
  private mapFromDTO(dto: ProductDTO): Product {
    return Product.create(
      dto.id,
      dto.name,
      dto.code,
      dto.default_unit,
      dto.description,
      new Date(dto.created_at),
      new Date(dto.updated_at)
    );
  }

  private mapToDTO(product: Product): Partial<ProductDTO> {
    return {
      name: product.getName(),
      code: product.getCode(),
      default_unit: product.getDefaultUnit().toString(),
      description: product.getDescription(),
    };
  }

  async findAll(): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<ProductDTO[]>>('/products');
    return response.data.map(dto => this.mapFromDTO(dto));
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<ApiResponse<ProductDTO>>(`/products/${id}`);
      return this.mapFromDTO(response.data);
    } catch (error) {
      return null;
    }
  }

  async create(product: Product): Promise<Product> {
    const dto = this.mapToDTO(product);
    const response = await apiClient.post<ApiResponse<ProductDTO>>('/products', dto);
    return this.mapFromDTO(response.data);
  }

  async update(product: Product): Promise<Product> {
    const dto = this.mapToDTO(product);
    const response = await apiClient.put<ApiResponse<ProductDTO>>(
      `/products/${product.getId()}`,
      dto
    );
    return this.mapFromDTO(response.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }
}
