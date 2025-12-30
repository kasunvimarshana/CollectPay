/**
 * Create Product Use Case
 * Handles the creation of new products
 */

import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

interface CreateProductDTO {
  name: string;
  code: string;
  defaultUnit: string;
  description: string;
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(dto: CreateProductDTO): Promise<Product> {
    // Validation
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('Product name is required');
    }

    if (!dto.code || dto.code.trim().length === 0) {
      throw new Error('Product code is required');
    }

    if (!dto.defaultUnit || dto.defaultUnit.trim().length === 0) {
      throw new Error('Default unit is required');
    }

    // Create product entity
    // Note: ID will be assigned by backend, using temp ID for client-side operations
    const product = Product.create(
      'temp-' + Date.now(), // Temporary ID for offline operations
      dto.name.trim(),
      dto.code.trim().toUpperCase(),
      dto.defaultUnit.trim(),
      dto.description?.trim() || '',
      new Date(),
      new Date()
    );

    // Persist through repository
    return await this.productRepository.create(product);
  }
}
