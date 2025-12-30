/**
 * Offline Supplier Repository
 * Decorates ApiSupplierRepository with offline support
 * Following Clean Architecture - Infrastructure Layer
 */

import { SupplierRepository } from '../../domain/repositories/SupplierRepository';
import { Supplier } from '../../domain/entities/Supplier';
import { localDatabase } from '../storage/LocalDatabaseService';
import { networkMonitor } from '../network/NetworkMonitoringService';
import { EnqueueOperationUseCase } from '../../application/useCases/EnqueueOperationUseCase';
import { SyncOperationType, SyncEntityType } from '../../domain/entities/SyncOperation';
import { LocalSyncQueueRepository } from './LocalSyncQueueRepository';

const COLLECTION_NAME = 'suppliers';

export class OfflineSupplierRepository implements SupplierRepository {
  private syncQueueRepository = new LocalSyncQueueRepository();
  private enqueueUseCase = new EnqueueOperationUseCase(this.syncQueueRepository);

  constructor(private onlineRepository: SupplierRepository) {}

  public async findAll(): Promise<Supplier[]> {
    const networkState = networkMonitor.getCurrentState();

    if (networkState.canSync()) {
      try {
        // Try to fetch from API
        const suppliers = await this.onlineRepository.findAll();
        
        // Cache locally
        for (const supplier of suppliers) {
          await localDatabase.save(COLLECTION_NAME, supplier.getId(), this.toJSON(supplier));
        }
        
        return suppliers;
      } catch (error) {
        console.warn('Failed to fetch suppliers from API, using cache:', error);
        // Fall back to cache
        return this.findAllFromCache();
      }
    } else {
      // Offline - use cache
      return this.findAllFromCache();
    }
  }

  public async findById(id: string): Promise<Supplier | null> {
    const networkState = networkMonitor.getCurrentState();

    if (networkState.canSync()) {
      try {
        // Try to fetch from API
        const supplier = await this.onlineRepository.findById(id);
        
        if (supplier) {
          // Cache locally
          await localDatabase.save(COLLECTION_NAME, id, this.toJSON(supplier));
        }
        
        return supplier;
      } catch (error) {
        console.warn(`Failed to fetch supplier ${id} from API, using cache:`, error);
        // Fall back to cache
        return this.findByIdFromCache(id);
      }
    } else {
      // Offline - use cache
      return this.findByIdFromCache(id);
    }
  }

  public async create(supplier: Supplier): Promise<Supplier> {
    const networkState = networkMonitor.getCurrentState();

    // Always save to cache first
    await localDatabase.save(COLLECTION_NAME, supplier.getId(), this.toJSON(supplier));

    if (networkState.canSync()) {
      try {
        // Try to create on server
        const created = await this.onlineRepository.create(supplier);
        
        // Update cache with server response
        await localDatabase.save(COLLECTION_NAME, created.getId(), this.toJSON(created));
        
        return created;
      } catch (error) {
        console.warn('Failed to create supplier on server, queuing for sync:', error);
        
        // Queue for later sync
        await this.enqueueUseCase.execute({
          entityType: SyncEntityType.SUPPLIER,
          operationType: SyncOperationType.CREATE,
          entityId: supplier.getId(),
          data: this.toJSON(supplier),
        });
        
        return supplier;
      }
    } else {
      // Offline - queue for sync
      await this.enqueueUseCase.execute({
        entityType: SyncEntityType.SUPPLIER,
        operationType: SyncOperationType.CREATE,
        entityId: supplier.getId(),
        data: this.toJSON(supplier),
      });
      
      return supplier;
    }
  }

  public async update(supplier: Supplier): Promise<Supplier> {
    const networkState = networkMonitor.getCurrentState();

    // Always update cache first
    await localDatabase.save(COLLECTION_NAME, supplier.getId(), this.toJSON(supplier));

    if (networkState.canSync()) {
      try {
        // Try to update on server
        const updated = await this.onlineRepository.update(supplier);
        
        // Update cache with server response
        await localDatabase.save(COLLECTION_NAME, updated.getId(), this.toJSON(updated));
        
        return updated;
      } catch (error) {
        console.warn('Failed to update supplier on server, queuing for sync:', error);
        
        // Queue for later sync
        await this.enqueueUseCase.execute({
          entityType: SyncEntityType.SUPPLIER,
          operationType: SyncOperationType.UPDATE,
          entityId: supplier.getId(),
          data: this.toJSON(supplier),
        });
        
        return supplier;
      }
    } else {
      // Offline - queue for sync
      await this.enqueueUseCase.execute({
        entityType: SyncEntityType.SUPPLIER,
        operationType: SyncOperationType.UPDATE,
        entityId: supplier.getId(),
        data: this.toJSON(supplier),
      });
      
      return supplier;
    }
  }

  public async delete(id: string): Promise<void> {
    const networkState = networkMonitor.getCurrentState();

    // Always delete from cache
    await localDatabase.delete(COLLECTION_NAME, id);

    if (networkState.canSync()) {
      try {
        // Try to delete on server
        await this.onlineRepository.delete(id);
      } catch (error) {
        console.warn('Failed to delete supplier on server, queuing for sync:', error);
        
        // Queue for later sync
        await this.enqueueUseCase.execute({
          entityType: SyncEntityType.SUPPLIER,
          operationType: SyncOperationType.DELETE,
          entityId: id,
          data: { id },
        });
      }
    } else {
      // Offline - queue for sync
      await this.enqueueUseCase.execute({
        entityType: SyncEntityType.SUPPLIER,
        operationType: SyncOperationType.DELETE,
        entityId: id,
        data: { id },
      });
    }
  }

  public async getBalance(id: string): Promise<{ balance: number; currency: string }> {
    const networkState = networkMonitor.getCurrentState();

    if (networkState.canSync()) {
      try {
        const balance = await this.onlineRepository.getBalance(id);
        // Cache the balance for offline use
        await localDatabase.save('supplier_balances', id, balance);
        return balance;
      } catch (error) {
        console.warn(`Failed to fetch balance for supplier ${id}, using cache:`, error);
        // Try to get cached balance
        const cached = await localDatabase.get<{ balance: number; currency: string }>('supplier_balances', id);
        return cached || { balance: 0, currency: 'USD' };
      }
    } else {
      // Get cached balance if offline
      const cached = await localDatabase.get<{ balance: number; currency: string }>('supplier_balances', id);
      return cached || { balance: 0, currency: 'USD' };
    }
  }

  private async findAllFromCache(): Promise<Supplier[]> {
    const cached = await localDatabase.getAll<any>(COLLECTION_NAME);
    return cached.map(data => this.fromJSON(data));
  }

  private async findByIdFromCache(id: string): Promise<Supplier | null> {
    const cached = await localDatabase.get<any>(COLLECTION_NAME, id);
    return cached ? this.fromJSON(cached) : null;
  }

  private toJSON(supplier: Supplier): any {
    return {
      id: supplier.getId(),
      name: supplier.getName(),
      code: supplier.getCode(),
      address: supplier.getAddress(),
      phone: supplier.getPhone(),
      email: supplier.getEmail()?.toString(),
    };
  }

  private fromJSON(data: any): Supplier {
    return Supplier.create(
      data.id,
      data.name,
      data.code,
      data.address,
      data.phone,
      data.email
    );
  }
}
