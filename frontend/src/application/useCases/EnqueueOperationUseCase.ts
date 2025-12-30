/**
 * EnqueueOperation Use Case
 * Adds operations to the sync queue when offline
 * Following Clean Architecture - Application Layer
 */

import { SyncOperation, SyncOperationType, SyncEntityType } from '../../domain/entities/SyncOperation';
import { SyncQueueRepository } from '../../domain/repositories/SyncQueueRepository';

export interface EnqueueOperationDTO {
  entityType: SyncEntityType;
  operationType: SyncOperationType;
  entityId: string;
  data: any;
}

export class EnqueueOperationUseCase {
  constructor(private syncQueueRepository: SyncQueueRepository) {}

  public async execute(dto: EnqueueOperationDTO): Promise<SyncOperation> {
    // Validate input
    this.validateDTO(dto);

    // Create sync operation
    const operation = SyncOperation.create(
      dto.entityType,
      dto.operationType,
      dto.entityId,
      dto.data
    );

    // Add to queue
    await this.syncQueueRepository.enqueue(operation);

    return operation;
  }

  private validateDTO(dto: EnqueueOperationDTO): void {
    if (!dto.entityType) {
      throw new Error('Entity type is required');
    }

    if (!dto.operationType) {
      throw new Error('Operation type is required');
    }

    if (!dto.entityId) {
      throw new Error('Entity ID is required');
    }

    if (!dto.data) {
      throw new Error('Data is required');
    }
  }
}
