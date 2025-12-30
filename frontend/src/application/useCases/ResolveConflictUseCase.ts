/**
 * ResolveConflict Use Case
 * Handles conflict resolution for sync operations
 * Following Clean Architecture - Application Layer
 */

import { SyncOperation } from '../../domain/entities/SyncOperation';
import { SyncQueueRepository } from '../../domain/repositories/SyncQueueRepository';
import { ConflictResolutionStrategy, ConflictStrategy } from '../../domain/valueObjects/ConflictResolutionStrategy';

export interface ResolveConflictDTO {
  operationId: string;
  strategy: ConflictResolutionStrategy;
  resolvedData?: any;
}

export class ResolveConflictUseCase {
  constructor(private syncQueueRepository: SyncQueueRepository) {}

  public async execute(dto: ResolveConflictDTO): Promise<SyncOperation> {
    // Get the operation
    const operation = await this.syncQueueRepository.getOperationById(dto.operationId);
    
    if (!operation) {
      throw new Error(`Operation ${dto.operationId} not found`);
    }

    // Apply resolution strategy
    const resolvedData = this.applyStrategy(
      operation,
      dto.strategy,
      dto.resolvedData
    );

    // Update operation with resolved data
    const resolvedOperation = SyncOperation.create(
      operation.getEntityType(),
      operation.getOperationType(),
      operation.getEntityId(),
      resolvedData
    );

    // Reset status to pending so it can be retried
    resolvedOperation.resetForRetry();

    // Update in queue
    await this.syncQueueRepository.updateOperation(resolvedOperation);

    return resolvedOperation;
  }

  private applyStrategy(
    operation: SyncOperation,
    strategy: ConflictResolutionStrategy,
    resolvedData?: any
  ): any {
    const localData = operation.getData();
    const serverData = operation.getConflictData();

    switch (strategy.getStrategy()) {
      case ConflictStrategy.SERVER_WINS:
        return serverData;

      case ConflictStrategy.CLIENT_WINS:
        return localData;

      case ConflictStrategy.MANUAL:
        if (!resolvedData) {
          throw new Error('Manual resolution requires resolved data');
        }
        return resolvedData;

      case ConflictStrategy.LATEST_TIMESTAMP:
        return this.resolveByTimestamp(localData, serverData);

      case ConflictStrategy.MERGE:
        return this.mergeData(localData, serverData);

      default:
        throw new Error(`Unknown conflict strategy: ${strategy.getStrategy()}`);
    }
  }

  private resolveByTimestamp(localData: any, serverData: any): any {
    const localTimestamp = new Date(localData.updated_at || localData.created_at);
    const serverTimestamp = new Date(serverData.updated_at || serverData.created_at);

    return localTimestamp > serverTimestamp ? localData : serverData;
  }

  private mergeData(localData: any, serverData: any): any {
    // TODO: Implement more sophisticated merge strategy
    // Current implementation is simplistic and may lead to data loss
    // Consider:
    // - Field-level conflict detection
    // - User-controlled merge options for critical data
    // - Preserving both versions for manual resolution
    return {
      ...serverData,
      ...localData,
      _merged: true,
      _mergedAt: new Date().toISOString(),
      _warning: 'This data was automatically merged. Please review for accuracy.',
    };
  }
}
