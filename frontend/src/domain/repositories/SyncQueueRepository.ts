/**
 * SyncQueue Repository Interface
 * Defines contract for sync queue persistence
 * Following Clean Architecture - Domain Layer
 */

import { SyncOperation, SyncOperationStatus, SyncEntityType } from '../entities/SyncOperation';

export interface SyncQueueRepository {
  /**
   * Add operation to sync queue
   */
  enqueue(operation: SyncOperation): Promise<void>;

  /**
   * Remove operation from sync queue
   */
  dequeue(operationId: string): Promise<void>;

  /**
   * Get all pending operations
   */
  getPendingOperations(): Promise<SyncOperation[]>;

  /**
   * Get operations by status
   */
  getOperationsByStatus(status: SyncOperationStatus): Promise<SyncOperation[]>;

  /**
   * Get operations by entity type
   */
  getOperationsByEntity(entityType: SyncEntityType): Promise<SyncOperation[]>;

  /**
   * Get operation by ID
   */
  getOperationById(operationId: string): Promise<SyncOperation | null>;

  /**
   * Update operation status
   */
  updateOperation(operation: SyncOperation): Promise<void>;

  /**
   * Clear all completed operations
   */
  clearCompleted(): Promise<void>;

  /**
   * Clear all operations
   */
  clearAll(): Promise<void>;

  /**
   * Get queue size
   */
  getQueueSize(): Promise<number>;

  /**
   * Get failed operations that can be retried
   */
  getRetryableOperations(maxAttempts: number): Promise<SyncOperation[]>;
}
