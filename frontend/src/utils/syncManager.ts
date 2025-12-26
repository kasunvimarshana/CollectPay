import { Alert } from 'react-native';
import {
  getSyncQueue,
  removeFromSyncQueue,
  updateOperationRetryCount,
  setLastSyncTime,
  QueuedOperation,
} from '../utils/offlineStorage';
import { supplierService } from '../api/supplier';
import { productService } from '../api/product';
import { collectionService } from '../api/collection';
import { paymentService } from '../api/payment';

const MAX_RETRY_COUNT = 3;

/**
 * Offline Sync Manager
 * Handles synchronization of offline operations when network is restored
 */

/**
 * Process a single queued operation
 */
async function processOperation(operation: QueuedOperation): Promise<boolean> {
  try {
    let service;
    switch (operation.entity) {
      case 'supplier':
        service = supplierService;
        break;
      case 'product':
        service = productService;
        break;
      case 'collection':
        service = collectionService;
        break;
      case 'payment':
        service = paymentService;
        break;
      default:
        console.error(`Unknown entity type: ${operation.entity}`);
        return false;
    }

    switch (operation.type) {
      case 'create':
        await service.create(operation.data);
        break;
      case 'update':
        await service.update(operation.data.id, operation.data);
        break;
      case 'delete':
        await service.delete(operation.data.id);
        break;
      default:
        console.error(`Unknown operation type: ${operation.type}`);
        return false;
    }

    return true;
  } catch (error) {
    console.error(`Error processing operation ${operation.id}:`, error);
    return false;
  }
}

/**
 * Sync all queued operations
 */
export async function syncOfflineOperations(
  onProgress?: (current: number, total: number) => void,
  onComplete?: (successful: number, failed: number) => void
): Promise<void> {
  const queue = await getSyncQueue();

  if (queue.length === 0) {
    onComplete?.(0, 0);
    return;
  }

  let successful = 0;
  let failed = 0;

  for (let i = 0; i < queue.length; i++) {
    const operation = queue[i];
    onProgress?.(i + 1, queue.length);

    // Check if max retry count exceeded
    if (operation.retryCount >= MAX_RETRY_COUNT) {
      console.warn(`Operation ${operation.id} exceeded max retry count, removing from queue`);
      await removeFromSyncQueue(operation.id);
      failed++;
      continue;
    }

    const success = await processOperation(operation);

    if (success) {
      await removeFromSyncQueue(operation.id);
      successful++;
    } else {
      await updateOperationRetryCount(operation.id);
      failed++;
    }
  }

  // Update last sync time if any operations were successful
  if (successful > 0) {
    await setLastSyncTime();
  }

  onComplete?.(successful, failed);
}

/**
 * Show sync results to user
 */
export function showSyncResults(successful: number, failed: number): void {
  if (successful > 0 && failed === 0) {
    Alert.alert(
      'Sync Complete',
      `Successfully synchronized ${successful} operation(s).`,
      [{ text: 'OK' }]
    );
  } else if (successful > 0 && failed > 0) {
    Alert.alert(
      'Sync Partially Complete',
      `Synchronized ${successful} operation(s). ${failed} operation(s) failed and will be retried later.`,
      [{ text: 'OK' }]
    );
  } else if (failed > 0) {
    Alert.alert(
      'Sync Failed',
      `Failed to synchronize ${failed} operation(s). Operations will be retried later.`,
      [{ text: 'OK' }]
    );
  }
}

/**
 * Get sync queue count
 */
export async function getSyncQueueCount(): Promise<number> {
  const queue = await getSyncQueue();
  return queue.length;
}
