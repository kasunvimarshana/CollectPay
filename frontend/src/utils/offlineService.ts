import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { addToSyncQueue } from '../utils/offlineStorage';

/**
 * Offline-aware service wrapper
 * Wraps API calls to handle offline mode automatically
 */

export interface OfflineCapableService<TCreate, TUpdate> {
  create: (data: TCreate) => Promise<any>;
  update: (id: number, data: TUpdate) => Promise<any>;
  delete: (id: number) => Promise<any>;
}

/**
 * Create an offline-capable version of a service
 * When offline, operations are queued instead of calling the API
 */
export function makeOfflineCapable<TCreate, TUpdate>(
  service: OfflineCapableService<TCreate, TUpdate>,
  entityType: 'supplier' | 'product' | 'collection' | 'payment' | 'product_rate'
): OfflineCapableService<TCreate, TUpdate> {
  return {
    async create(data: TCreate) {
      try {
        // Try to create normally
        return await service.create(data);
      } catch (error: any) {
        // If network error, queue for offline sync
        if (isNetworkError(error)) {
          await addToSyncQueue({
            type: 'create',
            entity: entityType,
            data: data,
            timestamp: new Date().toISOString(),
            retryCount: 0,
          });
          
          // Return a temporary response
          return {
            ...data,
            id: generateTempId(),
            _offline: true,
            _pending: true,
          };
        }
        throw error;
      }
    },

    async update(id: number, data: TUpdate) {
      try {
        // Try to update normally
        return await service.update(id, data);
      } catch (error: any) {
        // If network error, queue for offline sync
        if (isNetworkError(error)) {
          await addToSyncQueue({
            type: 'update',
            entity: entityType,
            data: { ...data, id },
            timestamp: new Date().toISOString(),
            retryCount: 0,
          });
          
          // Return a temporary response
          return {
            ...data,
            id,
            _offline: true,
            _pending: true,
          };
        }
        throw error;
      }
    },

    async delete(id: number) {
      try {
        // Try to delete normally
        return await service.delete(id);
      } catch (error: any) {
        // If network error, queue for offline sync
        if (isNetworkError(error)) {
          await addToSyncQueue({
            type: 'delete',
            entity: entityType,
            data: { id },
            timestamp: new Date().toISOString(),
            retryCount: 0,
          });
          
          // Return success response
          return {
            message: 'Delete queued for sync',
            _offline: true,
            _pending: true,
          };
        }
        throw error;
      }
    },
  };
}

/**
 * Check if error is a network error
 */
function isNetworkError(error: any): boolean {
  return (
    !error.response ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error'
  );
}

/**
 * Generate a temporary ID for offline records
 */
function generateTempId(): number {
  return -1 * Date.now(); // Negative IDs indicate temporary/offline records
}

/**
 * Check if an ID is temporary (offline)
 */
export function isTempId(id: number): boolean {
  return id < 0;
}
