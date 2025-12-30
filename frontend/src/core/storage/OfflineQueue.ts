import { offlineStorage } from './OfflineStorage';
import { STORAGE_KEYS } from '../constants/api';

/**
 * Offline Queue Operation
 */
export interface OfflineOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed';
}

/**
 * Offline Queue Manager
 * 
 * Manages offline operations queue for synchronization when connection is restored.
 */
class OfflineQueueManager {
  private queue: OfflineOperation[] = [];
  private isProcessing = false;

  /**
   * Initialize the queue from storage
   */
  async initialize(): Promise<void> {
    const storedQueue = await offlineStorage.get<OfflineOperation[]>(STORAGE_KEYS.OFFLINE_QUEUE);
    if (storedQueue) {
      this.queue = storedQueue;
    }
  }

  /**
   * Add an operation to the queue
   */
  async add(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<void> {
    const newOperation: OfflineOperation = {
      ...operation,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    this.queue.push(newOperation);
    await this.saveQueue();
  }

  /**
   * Get all pending operations
   */
  getPending(): OfflineOperation[] {
    return this.queue.filter(op => op.status === 'pending');
  }

  /**
   * Get all operations
   */
  getAll(): OfflineOperation[] {
    return [...this.queue];
  }

  /**
   * Remove an operation from the queue
   */
  async remove(operationId: string): Promise<void> {
    this.queue = this.queue.filter(op => op.id !== operationId);
    await this.saveQueue();
  }

  /**
   * Mark an operation as failed
   */
  async markAsFailed(operationId: string): Promise<void> {
    const operation = this.queue.find(op => op.id === operationId);
    if (operation) {
      operation.status = 'failed';
      operation.retryCount++;
      await this.saveQueue();
    }
  }

  /**
   * Mark an operation as processing
   */
  async markAsProcessing(operationId: string): Promise<void> {
    const operation = this.queue.find(op => op.id === operationId);
    if (operation) {
      operation.status = 'processing';
      await this.saveQueue();
    }
  }

  /**
   * Process the queue (sync with backend)
   */
  async process(syncFn: (operation: OfflineOperation) => Promise<void>): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const pending = this.getPending();
      
      for (const operation of pending) {
        try {
          await this.markAsProcessing(operation.id);
          await syncFn(operation);
          await this.remove(operation.id);
        } catch (error) {
          console.error(`Failed to process operation ${operation.id}:`, error);
          await this.markAsFailed(operation.id);
          
          // Stop processing if max retries exceeded
          if (operation.retryCount >= 3) {
            console.error(`Operation ${operation.id} exceeded max retries`);
          }
        }
      }
      
      // Save last sync timestamp
      await offlineStorage.save(STORAGE_KEYS.LAST_SYNC, Date.now());
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Clear the entire queue
   */
  async clear(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    await offlineStorage.save(STORAGE_KEYS.OFFLINE_QUEUE, this.queue);
  }

  /**
   * Generate a unique ID for operations
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueManager();
