/**
 * Offline Product Repository
 * Decorates ApiProductRepository with offline support
 * Following Clean Architecture - Infrastructure Layer
 */

import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';
import { Rate } from '../../domain/entities/Rate';
import { localDatabase } from '../storage/LocalDatabaseService';
import { networkMonitor } from '../network/NetworkMonitoringService';
import { EnqueueOperationUseCase } from '../../application/useCases/EnqueueOperationUseCase';
import { SyncOperationType, SyncEntityType } from '../../domain/entities/SyncOperation';
import { LocalSyncQueueRepository } from './LocalSyncQueueRepository';

const COLLECTION_NAME = 'products';
const RATES_COLLECTION = 'rates';

export class OfflineProductRepository implements ProductRepository {
  private syncQueueRepository = new LocalSyncQueueRepository();
  private enqueueUseCase = new EnqueueOperationUseCase(this.syncQueueRepository);

  constructor(private onlineRepository: ProductRepository) {}

  public async findAll(): Promise<Product[]> {
    const networkState = networkMonitor.getCurrentState();

    if (networkState.canSync()) {
      try {
        const products = await this.onlineRepository.findAll();
        
        for (const product of products) {
          await localDatabase.save(COLLECTION_NAME, product.getId(), this.toJSON(product));
        }
        
        return products;
      } catch (error) {
        console.warn('Failed to fetch products from API, using cache:', error);
        return this.findAllFromCache();
      }
    } else {
      return this.findAllFromCache();
    }
  }

  public async findById(id: string): Promise<Product | null> {
    const networkState = networkMonitor.getCurrentState();

    if (networkState.canSync()) {
      try {
        const product = await this.onlineRepository.findById(id);
        
        if (product) {
          await localDatabase.save(COLLECTION_NAME, id, this.toJSON(product));
        }
        
        return product;
      } catch (error) {
        console.warn(`Failed to fetch product ${id} from API, using cache:`, error);
        return this.findByIdFromCache(id);
      }
    } else {
      return this.findByIdFromCache(id);
    }
  }

  public async create(product: Product): Promise<Product> {
    const networkState = networkMonitor.getCurrentState();

    await localDatabase.save(COLLECTION_NAME, product.getId(), this.toJSON(product));

    if (networkState.canSync()) {
      try {
        const created = await this.onlineRepository.create(product);
        await localDatabase.save(COLLECTION_NAME, created.getId(), this.toJSON(created));
        return created;
      } catch (error) {
        console.warn('Failed to create product on server, queuing for sync:', error);
        
        await this.enqueueUseCase.execute({
          entityType: SyncEntityType.PRODUCT,
          operationType: SyncOperationType.CREATE,
          entityId: product.getId(),
          data: this.toJSON(product),
        });
        
        return product;
      }
    } else {
      await this.enqueueUseCase.execute({
        entityType: SyncEntityType.PRODUCT,
        operationType: SyncOperationType.CREATE,
        entityId: product.getId(),
        data: this.toJSON(product),
      });
      
      return product;
    }
  }

  public async update(product: Product): Promise<Product> {
    const networkState = networkMonitor.getCurrentState();

    await localDatabase.save(COLLECTION_NAME, product.getId(), this.toJSON(product));

    if (networkState.canSync()) {
      try {
        const updated = await this.onlineRepository.update(product);
        await localDatabase.save(COLLECTION_NAME, updated.getId(), this.toJSON(updated));
        return updated;
      } catch (error) {
        console.warn('Failed to update product on server, queuing for sync:', error);
        
        await this.enqueueUseCase.execute({
          entityType: SyncEntityType.PRODUCT,
          operationType: SyncOperationType.UPDATE,
          entityId: product.getId(),
          data: this.toJSON(product),
        });
        
        return product;
      }
    } else {
      await this.enqueueUseCase.execute({
        entityType: SyncEntityType.PRODUCT,
        operationType: SyncOperationType.UPDATE,
        entityId: product.getId(),
        data: this.toJSON(product),
      });
      
      return product;
    }
  }

  public async delete(id: string): Promise<void> {
    const networkState = networkMonitor.getCurrentState();

    await localDatabase.delete(COLLECTION_NAME, id);

    if (networkState.canSync()) {
      try {
        await this.onlineRepository.delete(id);
      } catch (error) {
        console.warn('Failed to delete product on server, queuing for sync:', error);
        
        await this.enqueueUseCase.execute({
          entityType: SyncEntityType.PRODUCT,
          operationType: SyncOperationType.DELETE,
          entityId: id,
          data: { id },
        });
      }
    } else {
      await this.enqueueUseCase.execute({
        entityType: SyncEntityType.PRODUCT,
        operationType: SyncOperationType.DELETE,
        entityId: id,
        data: { id },
      });
    }
  }

  private async findAllFromCache(): Promise<Product[]> {
    const cached = await localDatabase.getAll<any>(COLLECTION_NAME);
    return cached.map(data => this.fromJSON(data));
  }

  private async findByIdFromCache(id: string): Promise<Product | null> {
    const cached = await localDatabase.get<any>(COLLECTION_NAME, id);
    return cached ? this.fromJSON(cached) : null;
  }

  private toJSON(product: Product): any {
    return {
      id: product.getId(),
      name: product.getName(),
      code: product.getCode(),
      defaultUnit: product.getDefaultUnit().toString(),
      description: product.getDescription(),
    };
  }

  private fromJSON(data: any): Product {
    return Product.create(
      data.id,
      data.name,
      data.code,
      data.defaultUnit,
      data.description
    );
  }
}
