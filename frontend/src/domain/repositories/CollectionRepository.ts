/**
 * Repository Interface for Collections
 */

import { Collection } from '../entities/Collection';

export interface CollectionRepository {
  findAll(): Promise<Collection[]>;
  findById(id: string): Promise<Collection | null>;
  findBySupplierId(supplierId: string): Promise<Collection[]>;
  create(collection: Collection): Promise<Collection>;
  update(collection: Collection): Promise<Collection>;
  delete(id: string): Promise<void>;
}
