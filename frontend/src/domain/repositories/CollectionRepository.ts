import { Collection, CreateCollectionDTO, UpdateCollectionDTO } from '../entities/Collection';

/**
 * Collection Repository Interface
 */
export interface CollectionRepository {
  getAll(page?: number, perPage?: number): Promise<Collection[]>;
  getById(id: number): Promise<Collection | null>;
  getBySupplier(supplierId: number): Promise<Collection[]>;
  create(data: CreateCollectionDTO): Promise<Collection>;
  update(id: number, data: UpdateCollectionDTO): Promise<Collection>;
  delete(id: number): Promise<boolean>;
}
