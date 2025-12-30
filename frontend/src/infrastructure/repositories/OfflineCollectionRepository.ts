/**
 * Offline Collection Repository
 * Decorates ApiCollectionRepository with offline support
 * Following Clean Architecture - Infrastructure Layer
 */

import { CollectionRepository } from '../../domain/repositories/CollectionRepository';
import { Collection } from '../../domain/entities/Collection';
import { localDatabase } from '../storage/LocalDatabaseService';
import { networkMonitor } from '../network/NetworkMonitoringService';
import { EnqueueOperationUseCase } from '../../application/useCases/EnqueueOperationUseCase';
import { SyncOperationType, SyncEntityType } from '../../domain/entities/SyncOperation';
import { LocalSyncQueueRepository } from './LocalSyncQueueRepository';

const COLLECTION_NAME = 'collections';

export class OfflineCollectionRepository implements CollectionRepository {
  private syncQueueRepository = new LocalSyncQueueRepository();
  private enqueueUseCase = new EnqueueOperationUseCase(this.syncQueueRepository);

  constructor(private onlineRepository: CollectionRepository) {}

  public async findAll(): Promise<Collection[]> {
    const networkState = networkMonitor.getCurrentState();

    if (networkState.canSync()) {
      try {
        const collections = await this.onlineRepository.findAll();
        
        for (const collection of collections) {
          await localDatabase.save(COLLECTION_NAME, collection.getId(), this.toJSON(collection));
        }
        
        return collections;
      } catch (error) {
        console.warn('Failed to fetch collections from API, using cache:', error);
        return this.findAllFromCache();
      }
    } else {
      return this.findAllFromCache();
    }
  }

  public async findById(id: string): Promise<Collection | null> {
    const networkState = networkMonitor.getCurrentState();

    if (networkState.canSync()) {
      try {
        const collection = await this.onlineRepository.findById(id);
        
        if (collection) {
          await localDatabase.save(COLLECTION_NAME, id, this.toJSON(collection));
        }
        
        return collection;
      } catch (error) {
        console.warn(`Failed to fetch collection ${id} from API, using cache:`, error);
        return this.findByIdFromCache(id);
      }
    } else {
      return this.findByIdFromCache(id);
    }
  }

  public async findBySupplierId(supplierId: string): Promise<Collection[]> {
    const networkState = networkMonitor.getCurrentState();

    if (networkState.canSync()) {
      try {
        const collections = await this.onlineRepository.findBySupplierId(supplierId);
        
        for (const collection of collections) {
          await localDatabase.save(COLLECTION_NAME, collection.getId(), this.toJSON(collection));
        }
        
        return collections;
      } catch (error) {
        console.warn(`Failed to fetch collections for supplier ${supplierId}, using cache:`, error);
        return this.findBySupplierFromCache(supplierId);
      }
    } else {
      return this.findBySupplierFromCache(supplierId);
    }
  }

  public async create(collection: Collection): Promise<Collection> {
    const networkState = networkMonitor.getCurrentState();

    await localDatabase.save(COLLECTION_NAME, collection.getId(), this.toJSON(collection));

    if (networkState.canSync()) {
      try {
        const created = await this.onlineRepository.create(collection);
        await localDatabase.save(COLLECTION_NAME, created.getId(), this.toJSON(created));
        return created;
      } catch (error) {
        console.warn('Failed to create collection on server, queuing for sync:', error);
        
        await this.enqueueUseCase.execute({
          entityType: SyncEntityType.COLLECTION,
          operationType: SyncOperationType.CREATE,
          entityId: collection.getId(),
          data: this.toJSON(collection),
        });
        
        return collection;
      }
    } else {
      await this.enqueueUseCase.execute({
        entityType: SyncEntityType.COLLECTION,
        operationType: SyncOperationType.CREATE,
        entityId: collection.getId(),
        data: this.toJSON(collection),
      });
      
      return collection;
    }
  }

  public async update(collection: Collection): Promise<Collection> {
    const networkState = networkMonitor.getCurrentState();

    await localDatabase.save(COLLECTION_NAME, collection.getId(), this.toJSON(collection));

    if (networkState.canSync()) {
      try {
        const updated = await this.onlineRepository.update(collection);
        await localDatabase.save(COLLECTION_NAME, updated.getId(), this.toJSON(updated));
        return updated;
      } catch (error) {
        console.warn('Failed to update collection on server, queuing for sync:', error);
        
        await this.enqueueUseCase.execute({
          entityType: SyncEntityType.COLLECTION,
          operationType: SyncOperationType.UPDATE,
          entityId: collection.getId(),
          data: this.toJSON(collection),
        });
        
        return collection;
      }
    } else {
      await this.enqueueUseCase.execute({
        entityType: SyncEntityType.COLLECTION,
        operationType: SyncOperationType.UPDATE,
        entityId: collection.getId(),
        data: this.toJSON(collection),
      });
      
      return collection;
    }
  }

  public async delete(id: string): Promise<void> {
    const networkState = networkMonitor.getCurrentState();

    await localDatabase.delete(COLLECTION_NAME, id);

    if (networkState.canSync()) {
      try {
        await this.onlineRepository.delete(id);
      } catch (error) {
        console.warn('Failed to delete collection on server, queuing for sync:', error);
        
        await this.enqueueUseCase.execute({
          entityType: SyncEntityType.COLLECTION,
          operationType: SyncOperationType.DELETE,
          entityId: id,
          data: { id },
        });
      }
    } else {
      await this.enqueueUseCase.execute({
        entityType: SyncEntityType.COLLECTION,
        operationType: SyncOperationType.DELETE,
        entityId: id,
        data: { id },
      });
    }
  }

  private async findAllFromCache(): Promise<Collection[]> {
    const cached = await localDatabase.getAll<any>(COLLECTION_NAME);
    return cached.map(data => this.fromJSON(data));
  }

  private async findByIdFromCache(id: string): Promise<Collection | null> {
    const cached = await localDatabase.get<any>(COLLECTION_NAME, id);
    return cached ? this.fromJSON(cached) : null;
  }

  private async findBySupplierFromCache(supplierId: string): Promise<Collection[]> {
    const allCollections = await localDatabase.getAll<any>(COLLECTION_NAME);
    return allCollections
      .filter(c => c.supplierId === supplierId)
      .map(data => this.fromJSON(data));
  }

  private toJSON(collection: Collection): any {
    return {
      id: collection.getId(),
      supplierId: collection.getSupplierId(),
      productId: collection.getProductId(),
      rateId: collection.getRateId(),
      quantity: collection.getQuantity().getValue(),
      unit: collection.getQuantity().getUnit().toString(),
      totalAmount: collection.getTotalAmount().getAmount(),
      totalCurrency: collection.getTotalAmount().getCurrency(),
      collectionDate: collection.getCollectionDate().toISOString(),
      notes: collection.getNotes(),
    };
  }

  private fromJSON(data: any): Collection {
    return Collection.create(
      data.id,
      data.supplierId,
      data.productId,
      data.rateId,
      data.quantity,
      data.unit,
      data.totalAmount,
      data.totalCurrency,
      new Date(data.collectionDate),
      data.notes
    );
  }
}
