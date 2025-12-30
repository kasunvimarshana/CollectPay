/**
 * ProcessSyncQueue Use Case
 * Processes pending sync operations and syncs with backend
 * Following Clean Architecture - Application Layer
 */

import { SyncOperation, SyncOperationStatus, SyncOperationType } from '../../domain/entities/SyncOperation';
import { SyncQueueRepository } from '../../domain/repositories/SyncQueueRepository';
import { NetworkState } from '../../domain/valueObjects/NetworkState';

export interface SyncResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  conflictCount: number;
  operations: SyncOperation[];
}

export class ProcessSyncQueueUseCase {
  constructor(
    private syncQueueRepository: SyncQueueRepository,
    private maxConcurrent: number = 5,
    private maxAttempts: number = 3
  ) {}

  public async execute(networkState: NetworkState): Promise<SyncResult> {
    // Check if we can sync
    if (!networkState.canSync()) {
      throw new Error('Cannot sync - no network connection');
    }

    // Get pending and retryable operations
    const pendingOps = await this.syncQueueRepository.getPendingOperations();
    const retryableOps = await this.syncQueueRepository.getRetryableOperations(this.maxAttempts);
    
    const allOperations = [...pendingOps, ...retryableOps];

    if (allOperations.length === 0) {
      return {
        success: true,
        processedCount: 0,
        failedCount: 0,
        conflictCount: 0,
        operations: [],
      };
    }

    // Sort operations by timestamp (FIFO)
    allOperations.sort((a, b) => 
      a.getCreatedAt().getTime() - b.getCreatedAt().getTime()
    );

    // Process operations in batches
    const result: SyncResult = {
      success: true,
      processedCount: 0,
      failedCount: 0,
      conflictCount: 0,
      operations: [],
    };

    for (let i = 0; i < allOperations.length; i += this.maxConcurrent) {
      const batch = allOperations.slice(i, i + this.maxConcurrent);
      const batchResults = await Promise.allSettled(
        batch.map(op => this.processSingleOperation(op))
      );

      batchResults.forEach((batchResult, idx) => {
        const operation = batch[idx];
        
        if (batchResult.status === 'fulfilled') {
          result.processedCount++;
          result.operations.push(operation);
        } else {
          result.failedCount++;
          result.success = false;
        }

        if (operation.getStatus() === SyncOperationStatus.CONFLICT) {
          result.conflictCount++;
        }
      });
    }

    return result;
  }

  private async processSingleOperation(operation: SyncOperation): Promise<void> {
    try {
      // Mark as in progress
      operation.markInProgress();
      await this.syncQueueRepository.updateOperation(operation);

      // Simulate API call (will be replaced with actual API calls)
      // In real implementation, this would call the appropriate repository method
      await this.simulateApiCall(operation);

      // Mark as completed
      operation.markCompleted();
      await this.syncQueueRepository.updateOperation(operation);

      // Remove from queue
      await this.syncQueueRepository.dequeue(operation.getId());
    } catch (error) {
      // Mark as failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      operation.markFailed(errorMessage);
      await this.syncQueueRepository.updateOperation(operation);

      throw error;
    }
  }

  private async simulateApiCall(operation: SyncOperation): Promise<void> {
    // TODO: Replace this placeholder with actual API calls
    // This should dispatch to the appropriate repository method based on operation type:
    // - CREATE: call repository.create()
    // - UPDATE: call repository.update()
    // - DELETE: call repository.delete()
    // For now, just simulate a delay for testing
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
