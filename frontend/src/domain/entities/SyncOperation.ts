/**
 * SyncOperation Entity
 * Represents a single operation that needs to be synchronized with the backend
 * Following Clean Architecture - Domain Layer
 */

export enum SyncOperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum SyncOperationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CONFLICT = 'CONFLICT',
}

export enum SyncEntityType {
  SUPPLIER = 'SUPPLIER',
  PRODUCT = 'PRODUCT',
  COLLECTION = 'COLLECTION',
  PAYMENT = 'PAYMENT',
  RATE = 'RATE',
}

export interface SyncOperationProps {
  id: string;
  entityType: SyncEntityType;
  operationType: SyncOperationType;
  entityId: string;
  data: any;
  status: SyncOperationStatus;
  createdAt: Date;
  updatedAt: Date;
  attempts: number;
  lastError?: string;
  conflictData?: any;
}

export class SyncOperation {
  private constructor(private props: SyncOperationProps) {}

  public static create(
    entityType: SyncEntityType,
    operationType: SyncOperationType,
    entityId: string,
    data: any
  ): SyncOperation {
    const id = this.generateId();
    const now = new Date();

    return new SyncOperation({
      id,
      entityType,
      operationType,
      entityId,
      data,
      status: SyncOperationStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      attempts: 0,
    });
  }

  public static fromPersistence(props: SyncOperationProps): SyncOperation {
    return new SyncOperation({
      ...props,
      createdAt: new Date(props.createdAt),
      updatedAt: new Date(props.updatedAt),
    });
  }

  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  public getId(): string {
    return this.props.id;
  }

  public getEntityType(): SyncEntityType {
    return this.props.entityType;
  }

  public getOperationType(): SyncOperationType {
    return this.props.operationType;
  }

  public getEntityId(): string {
    return this.props.entityId;
  }

  public getData(): any {
    return this.props.data;
  }

  public getStatus(): SyncOperationStatus {
    return this.props.status;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public getAttempts(): number {
    return this.props.attempts;
  }

  public getLastError(): string | undefined {
    return this.props.lastError;
  }

  public getConflictData(): any {
    return this.props.conflictData;
  }

  public markInProgress(): void {
    this.props.status = SyncOperationStatus.IN_PROGRESS;
    this.props.updatedAt = new Date();
  }

  public markCompleted(): void {
    this.props.status = SyncOperationStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  public markFailed(error: string): void {
    this.props.status = SyncOperationStatus.FAILED;
    this.props.lastError = error;
    this.props.attempts += 1;
    this.props.updatedAt = new Date();
  }

  public markConflict(conflictData: any): void {
    this.props.status = SyncOperationStatus.CONFLICT;
    this.props.conflictData = conflictData;
    this.props.updatedAt = new Date();
  }

  public resetForRetry(): void {
    this.props.status = SyncOperationStatus.PENDING;
    this.props.updatedAt = new Date();
  }

  public canRetry(maxAttempts: number = 3): boolean {
    return (
      this.props.status === SyncOperationStatus.FAILED &&
      this.props.attempts < maxAttempts
    );
  }

  public toJSON(): SyncOperationProps {
    return {
      ...this.props,
    };
  }
}
