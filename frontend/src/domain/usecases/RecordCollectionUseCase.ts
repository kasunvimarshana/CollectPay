import { Collection, CreateCollectionDTO } from '../entities/Collection';
import { CollectionRepository } from '../repositories/CollectionRepository';

/**
 * Record Collection Use Case
 * 
 * Business logic for recording a new collection.
 * This is framework-independent and can be tested in isolation.
 */
export class RecordCollectionUseCase {
  constructor(
    private collectionRepository: CollectionRepository
  ) {}

  async execute(data: CreateCollectionDTO): Promise<Collection> {
    // Validation can be added here
    if (data.quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    // Execute repository operation
    return await this.collectionRepository.create(data);
  }
}
