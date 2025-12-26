import { Alert } from 'react-native';
import {
  getSyncQueue,
  removeFromSyncQueue,
  updateOperationRetryCount,
  setLastSyncTime,
  QueuedOperation,
} from '../utils/offlineStorage';
import { getDeviceId } from '../utils/deviceManager';
import apiClient from '../api/client';

const MAX_RETRY_COUNT = 3;
const BATCH_SIZE = 10; // Process operations in batches

/**
 * Offline Sync Manager
 * Handles synchronization of offline operations when network is restored
 */

/**
 * Process a batch of queued operations using the sync API
 */
async function processBatch(operations: QueuedOperation[], deviceId: string): Promise<Map<string, any>> {
  try {
    // Prepare operations for sync API
    const syncOperations = operations.map(op => ({
      local_id: op.local_id || op.id,
      entity: op.entity,
      operation: op.type,
      data: op.data,
      timestamp: op.timestamp,
    }));

    // Call batch sync endpoint
    const response = await apiClient.post('/sync', {
      device_id: deviceId,
      operations: syncOperations,
    });

    // Map results by local_id
    const resultsMap = new Map();
    if (response.data && response.data.results) {
      response.data.results.forEach((result: any) => {
        resultsMap.set(result.local_id, result);
      });
    }

    return resultsMap;
  } catch (error) {
    console.error('Error processing batch:', error);
    throw error;
  }
}

/**
 * Sync all queued operations
 */
export async function syncOfflineOperations(
  onProgress?: (current: number, total: number) => void,
  onComplete?: (successful: number, failed: number, conflicts: number) => void
): Promise<void> {
  const queue = await getSyncQueue();

  if (queue.length === 0) {
    onComplete?.(0, 0, 0);
    return;
  }

  const deviceId = await getDeviceId();
  let successful = 0;
  let failed = 0;
  let conflicts = 0;
  let processed = 0;

  // Filter operations that haven't exceeded retry count
  const validOperations = queue.filter(op => op.retryCount < MAX_RETRY_COUNT);
  const exceededOperations = queue.filter(op => op.retryCount >= MAX_RETRY_COUNT);

  // Remove operations that exceeded retry count
  for (const operation of exceededOperations) {
    await removeFromSyncQueue(operation.id);
    failed++;
  }

  // Process operations in batches
  for (let i = 0; i < validOperations.length; i += BATCH_SIZE) {
    const batch = validOperations.slice(i, i + BATCH_SIZE);
    
    try {
      const resultsMap = await processBatch(batch, deviceId);

      // Process results
      for (const operation of batch) {
        processed++;
        onProgress?.(processed, validOperations.length);

        const result = resultsMap.get(operation.local_id || operation.id);

        if (!result) {
          // No result for this operation, mark as failed
          await updateOperationRetryCount(operation.id);
          failed++;
          continue;
        }

        switch (result.status) {
          case 'success':
          case 'duplicate':
            // Successfully synced or already exists
            await removeFromSyncQueue(operation.id);
            successful++;
            break;

          case 'conflict':
            // Version conflict - needs manual resolution
            await removeFromSyncQueue(operation.id);
            conflicts++;
            
            // Show conflict alert
            Alert.alert(
              'Sync Conflict',
              `A conflict was detected for ${operation.entity}. The server has newer data.`,
              [
                {
                  text: 'Use Server Data',
                  onPress: () => {
                    // Server data wins - operation is already removed
                  },
                },
                {
                  text: 'Review Later',
                  style: 'cancel',
                },
              ]
            );
            break;

          case 'not_found':
            // Entity not found on server - remove from queue
            await removeFromSyncQueue(operation.id);
            failed++;
            break;

          case 'error':
          default:
            // Failed to process - increment retry count
            await updateOperationRetryCount(operation.id);
            failed++;
            break;
        }
      }
    } catch (error) {
      console.error('Error processing batch:', error);
      // Mark all operations in batch as failed
      for (const operation of batch) {
        await updateOperationRetryCount(operation.id);
        failed++;
      }
    }
  }

  // Update last sync time if any operations were successful
  if (successful > 0) {
    await setLastSyncTime();
  }

  onComplete?.(successful, failed, conflicts);
}

/**
 * Show sync results to user
 */
export function showSyncResults(successful: number, failed: number, conflicts: number = 0): void {
  if (successful > 0 && failed === 0 && conflicts === 0) {
    Alert.alert(
      'Sync Complete',
      `Successfully synchronized ${successful} operation(s).`,
      [{ text: 'OK' }]
    );
  } else if (conflicts > 0) {
    Alert.alert(
      'Sync Completed with Conflicts',
      `Synchronized ${successful} operation(s). ${conflicts} conflict(s) detected. ${failed > 0 ? `${failed} operation(s) failed and will be retried later.` : ''}`,
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
