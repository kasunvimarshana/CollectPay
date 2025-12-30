/**
 * SyncQueue Repository Implementation
 * Implements sync queue persistence using local database
 * Following Clean Architecture - Infrastructure Layer
 */

import { SyncQueueRepository } from '../../domain/repositories/SyncQueueRepository';
import { SyncOperation, SyncOperationStatus, SyncEntityType } from '../../domain/entities/SyncOperation';
import { localDatabase } from '../storage/LocalDatabaseService';

const COLLECTION_NAME = 'sync_queue';

export class LocalSyncQueueRepository implements SyncQueueRepository {
  public async enqueue(operation: SyncOperation): Promise<void> {
    await localDatabase.save(
      COLLECTION_NAME,
      operation.getId(),
      operation.toJSON()
    );
  }

  public async dequeue(operationId: string): Promise<void> {
    await localDatabase.delete(COLLECTION_NAME, operationId);
  }

  public async getPendingOperations(): Promise<SyncOperation[]> {
    const operations = await localDatabase.query<any>(
      COLLECTION_NAME,
      (item) => item.status === SyncOperationStatus.PENDING
    );

    return operations.map(op => SyncOperation.fromPersistence(op));
  }

  public async getOperationsByStatus(status: SyncOperationStatus): Promise<SyncOperation[]> {
    const operations = await localDatabase.query<any>(
      COLLECTION_NAME,
      (item) => item.status === status
    );

    return operations.map(op => SyncOperation.fromPersistence(op));
  }

  public async getOperationsByEntity(entityType: SyncEntityType): Promise<SyncOperation[]> {
    const operations = await localDatabase.query<any>(
      COLLECTION_NAME,
      (item) => item.entityType === entityType
    );

    return operations.map(op => SyncOperation.fromPersistence(op));
  }

  public async getOperationById(operationId: string): Promise<SyncOperation | null> {
    const operation = await localDatabase.get<any>(COLLECTION_NAME, operationId);
    
    if (!operation) {
      return null;
    }

    return SyncOperation.fromPersistence(operation);
  }

  public async updateOperation(operation: SyncOperation): Promise<void> {
    await localDatabase.save(
      COLLECTION_NAME,
      operation.getId(),
      operation.toJSON()
    );
  }

  public async clearCompleted(): Promise<void> {
    const completed = await this.getOperationsByStatus(SyncOperationStatus.COMPLETED);
    
    for (const operation of completed) {
      await this.dequeue(operation.getId());
    }
  }

  public async clearAll(): Promise<void> {
    await localDatabase.clearCollection(COLLECTION_NAME);
  }

  public async getQueueSize(): Promise<number> {
    return await localDatabase.getCollectionSize(COLLECTION_NAME);
  }

  public async getRetryableOperations(maxAttempts: number): Promise<SyncOperation[]> {
    const operations = await localDatabase.query<any>(
      COLLECTION_NAME,
      (item) => item.status === SyncOperationStatus.FAILED && item.attempts < maxAttempts
    );

    return operations.map(op => SyncOperation.fromPersistence(op));
  }
}
