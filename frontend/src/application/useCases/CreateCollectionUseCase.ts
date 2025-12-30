/**
 * Create Collection Use Case
 */

import { Collection } from '../../domain/entities/Collection';
import { CollectionRepository } from '../../domain/repositories/CollectionRepository';

export interface CreateCollectionDTO {
  supplierId: string;
  productId: string;
  rateId: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  currency: string;
  collectionDate: Date;
  notes?: string;
}

export class CreateCollectionUseCase {
  constructor(private collectionRepository: CollectionRepository) {}

  async execute(dto: CreateCollectionDTO): Promise<Collection> {
    // Validation
    if (!dto.supplierId) {
      throw new Error('Supplier ID is required');
    }
    if (!dto.productId) {
      throw new Error('Product ID is required');
    }
    if (!dto.rateId) {
      throw new Error('Rate ID is required');
    }
    if (dto.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
    if (dto.totalAmount < 0) {
      throw new Error('Total amount cannot be negative');
    }

    const collection = Collection.create(
      'temp-' + Date.now(),
      dto.supplierId,
      dto.productId,
      dto.rateId,
      dto.quantity,
      dto.unit,
      dto.totalAmount,
      dto.currency,
      dto.collectionDate,
      dto.notes || ''
    );

    return await this.collectionRepository.create(collection);
  }
}
