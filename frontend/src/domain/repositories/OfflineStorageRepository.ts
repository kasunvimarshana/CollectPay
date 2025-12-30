/**
 * Offline Storage Repository Interface
 * Defines contract for offline data persistence
 * Following Clean Architecture - Domain Layer
 */

export interface OfflineStorageRepository<T> {
  /**
   * Save entity to offline storage
   */
  saveOffline(entity: T): Promise<void>;

  /**
   * Get entity from offline storage by ID
   */
  getOfflineById(id: string): Promise<T | null>;

  /**
   * Get all entities from offline storage
   */
  getAllOffline(): Promise<T[]>;

  /**
   * Update entity in offline storage
   */
  updateOffline(entity: T): Promise<void>;

  /**
   * Delete entity from offline storage
   */
  deleteOffline(id: string): Promise<void>;

  /**
   * Clear all offline data
   */
  clearOffline(): Promise<void>;

  /**
   * Check if entity exists offline
   */
  existsOffline(id: string): Promise<boolean>;

  /**
   * Sync entity with server
   */
  syncWithServer(entity: T): Promise<T>;

  /**
   * Get entities that need to be synced
   */
  getPendingSync(): Promise<T[]>;

  /**
   * Mark entity as synced
   */
  markAsSynced(id: string): Promise<void>;
}
