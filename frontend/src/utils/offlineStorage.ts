import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Offline Storage Manager
 * Handles local data caching for offline functionality
 */

const STORAGE_KEYS = {
  SUPPLIERS: 'offline_suppliers',
  PRODUCTS: 'offline_products',
  COLLECTIONS: 'offline_collections',
  PAYMENTS: 'offline_payments',
  PRODUCT_RATES: 'offline_product_rates',
  SYNC_QUEUE: 'offline_sync_queue',
  LAST_SYNC: 'offline_last_sync',
};

export interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'supplier' | 'product' | 'collection' | 'payment' | 'product_rate';
  data: any;
  timestamp: string;
  retryCount: number;
}

/**
 * Cache data locally
 */
export async function cacheData<T>(key: string, data: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error caching data for key ${key}:`, error);
  }
}

/**
 * Retrieve cached data
 */
export async function getCachedData<T>(key: string): Promise<T[] | null> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error retrieving cached data for key ${key}:`, error);
    return null;
  }
}

/**
 * Clear cached data
 */
export async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing cache for key ${key}:`, error);
  }
}

/**
 * Add operation to sync queue
 */
export async function addToSyncQueue(operation: Omit<QueuedOperation, 'id'>): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const newOperation: QueuedOperation = {
      ...operation,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    queue.push(newOperation);
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding operation to sync queue:', error);
  }
}

/**
 * Get sync queue
 */
export async function getSyncQueue(): Promise<QueuedOperation[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving sync queue:', error);
    return [];
  }
}

/**
 * Remove operation from sync queue
 */
export async function removeFromSyncQueue(operationId: string): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const updatedQueue = queue.filter((op) => op.id !== operationId);
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue));
  } catch (error) {
    console.error('Error removing operation from sync queue:', error);
  }
}

/**
 * Update operation retry count
 */
export async function updateOperationRetryCount(operationId: string): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const updatedQueue = queue.map((op) =>
      op.id === operationId ? { ...op, retryCount: op.retryCount + 1 } : op
    );
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue));
  } catch (error) {
    console.error('Error updating operation retry count:', error);
  }
}

/**
 * Clear sync queue
 */
export async function clearSyncQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
  } catch (error) {
    console.error('Error clearing sync queue:', error);
  }
}

/**
 * Set last sync timestamp
 */
export async function setLastSyncTime(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (error) {
    console.error('Error setting last sync time:', error);
  }
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTime(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  } catch (error) {
    console.error('Error retrieving last sync time:', error);
    return null;
  }
}

/**
 * Clear all offline data
 */
export async function clearAllOfflineData(): Promise<void> {
  try {
    await Promise.all([
      clearCache(STORAGE_KEYS.SUPPLIERS),
      clearCache(STORAGE_KEYS.PRODUCTS),
      clearCache(STORAGE_KEYS.COLLECTIONS),
      clearCache(STORAGE_KEYS.PAYMENTS),
      clearCache(STORAGE_KEYS.PRODUCT_RATES),
      clearSyncQueue(),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC),
    ]);
  } catch (error) {
    console.error('Error clearing all offline data:', error);
  }
}

export { STORAGE_KEYS };
