/**
 * List Collections Use Case
 */

import { Collection } from '../../domain/entities/Collection';
import { CollectionRepository } from '../../domain/repositories/CollectionRepository';

export class ListCollectionsUseCase {
  constructor(private collectionRepository: CollectionRepository) {}

  async execute(): Promise<Collection[]> {
    return await this.collectionRepository.findAll();
  }
}
