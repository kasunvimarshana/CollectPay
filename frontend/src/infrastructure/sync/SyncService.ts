import NetInfo from '@react-native-community/netinfo';
import DatabaseService from '../storage/DatabaseService';
import ApiClient from '../api/ApiClient';
import SupplierRepository from '../storage/SupplierRepository';
import CollectionRepository from '../storage/CollectionRepository';

/**
 * Sync service for managing data synchronization between local and remote
 */
class SyncService {
  private isSyncing: boolean = false;
  private syncListeners: Array<(status: SyncStatus) => void> = [];

  /**
   * Initialize sync service and set up connectivity monitoring
   */
  async init(): Promise<void> {
    // Listen for network state changes
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.isSyncing) {
        this.performSync();
      }
    });
  }

  /**
   * Add sync status listener
   */
  addListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners.push(listener);
  }

  /**
   * Remove sync status listener
   */
  removeListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners of sync status change
   */
  private notifyListeners(status: SyncStatus): void {
    this.syncListeners.forEach(listener => listener(status));
  }

  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  /**
   * Perform full synchronization
   */
  async performSync(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, message: 'Sync already in progress' };
    }

    this.isSyncing = true;
    this.notifyListeners({ status: 'syncing', progress: 0 });

    try {
      // Check connectivity
      const online = await this.isOnline();
      if (!online) {
        throw new Error('No internet connection');
      }

      const result: SyncResult = {
        success: true,
        message: 'Sync completed successfully',
        details: {
          uploaded: 0,
          downloaded: 0,
          conflicts: 0,
          errors: [],
        }
      };

      // Step 1: Upload local changes (20% progress)
      this.notifyListeners({ status: 'syncing', progress: 20, message: 'Uploading local changes...' });
      const uploadResult = await this.uploadLocalChanges();
      result.details.uploaded = uploadResult.count;
      result.details.errors.push(...uploadResult.errors);

      // Step 2: Download remote changes (50% progress)
      this.notifyListeners({ status: 'syncing', progress: 50, message: 'Downloading remote changes...' });
      const downloadResult = await this.downloadRemoteChanges();
      result.details.downloaded = downloadResult.count;
      result.details.errors.push(...downloadResult.errors);

      // Step 3: Resolve conflicts (80% progress)
      this.notifyListeners({ status: 'syncing', progress: 80, message: 'Resolving conflicts...' });
      const conflictResult = await this.resolveConflicts();
      result.details.conflicts = conflictResult.count;
      result.details.errors.push(...conflictResult.errors);

      // Step 4: Clean up sync queue (100% progress)
      this.notifyListeners({ status: 'syncing', progress: 100, message: 'Finalizing...' });
      await this.cleanupSyncQueue();

      this.notifyListeners({ status: 'completed', progress: 100 });
      return result;

    } catch (error: any) {
      this.notifyListeners({ status: 'error', error: error.message });
      return {
        success: false,
        message: error.message,
        details: {
          uploaded: 0,
          downloaded: 0,
          conflicts: 0,
          errors: [error.message]
        }
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Upload local changes to server
   */
  private async uploadLocalChanges(): Promise<{ count: number; errors: string[] }> {
    const db = DatabaseService.getDatabase();
    const errors: string[] = [];
    let count = 0;

    try {
      // Get all pending sync operations
      const syncQueue = await db.getAllAsync<any>(
        'SELECT * FROM sync_queue WHERE synced_at IS NULL ORDER BY created_at'
      );

      for (const item of syncQueue) {
        try {
          const data = JSON.parse(item.data);
          
          switch (item.entity_type) {
            case 'collection':
              await this.syncCollection(item.entity_id, item.operation, data);
              break;
            case 'payment':
              await this.syncPayment(item.entity_id, item.operation, data);
              break;
            // Add more entity types as needed
          }

          // Mark as synced
          await db.runAsync(
            'UPDATE sync_queue SET synced_at = ? WHERE id = ?',
            [new Date().toISOString(), item.id]
          );
          
          count++;
        } catch (error: any) {
          errors.push(`Failed to sync ${item.entity_type} ${item.entity_id}: ${error.message}`);
          
          // Update retry count
          await db.runAsync(
            'UPDATE sync_queue SET retry_count = retry_count + 1, last_error = ? WHERE id = ?',
            [error.message, item.id]
          );
        }
      }
    } catch (error: any) {
      errors.push(`Upload failed: ${error.message}`);
    }

    return { count, errors };
  }

  /**
   * Download remote changes from server
   */
  private async downloadRemoteChanges(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      // Download suppliers
      const suppliers = await ApiClient.getSuppliers();
      for (const supplier of suppliers.data || []) {
        await SupplierRepository.create(supplier);
        count++;
      }

      // Download recent collections (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const collections = await ApiClient.getCollections({
        from_date: thirtyDaysAgo.toISOString().split('T')[0]
      });
      
      for (const collection of collections.data || []) {
        const existing = await CollectionRepository.getById(collection.id);
        if (!existing) {
          await CollectionRepository.create(collection);
          count++;
        }
      }

    } catch (error: any) {
      errors.push(`Download failed: ${error.message}`);
    }

    return { count, errors };
  }

  /**
   * Resolve conflicts using server as source of truth
   */
  private async resolveConflicts(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      // Get unsynced items with version conflicts
      const unsyncedCollections = await CollectionRepository.getUnsynced();
      
      for (const collection of unsyncedCollections) {
        if (collection.id) {
          // Check server version
          try {
            const serverResponse = await ApiClient.getCollection(collection.id);
            const serverCollection = serverResponse.data;
            
            if (serverCollection && serverCollection.version > collection.version) {
              // Server has newer version - update local
              await CollectionRepository.update(collection.id, serverCollection);
              count++;
            }
          } catch (error: any) {
            errors.push(`Conflict resolution failed for collection ${collection.id}: ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      errors.push(`Conflict resolution failed: ${error.message}`);
    }

    return { count, errors };
  }

  /**
   * Clean up successfully synced items from queue
   */
  private async cleanupSyncQueue(): Promise<void> {
    const db = DatabaseService.getDatabase();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await db.runAsync(
      'DELETE FROM sync_queue WHERE synced_at IS NOT NULL AND synced_at < ?',
      [thirtyDaysAgo.toISOString()]
    );
  }

  /**
   * Sync a collection to server
   */
  private async syncCollection(localId: number, operation: string, data: any): Promise<void> {
    const collection = await CollectionRepository.getById(localId);
    if (!collection) return;

    switch (operation) {
      case 'create':
        const created = await ApiClient.createCollection(collection);
        await CollectionRepository.markSynced(localId, created.id);
        break;
      case 'update':
        await ApiClient.updateCollection(collection.id!, collection);
        await CollectionRepository.markSynced(localId, collection.id!);
        break;
      case 'delete':
        if (collection.id) {
          await ApiClient.deleteCollection(collection.id);
        }
        break;
    }
  }

  /**
   * Sync a payment to server
   */
  private async syncPayment(localId: number, operation: string, data: any): Promise<void> {
    // Similar to syncCollection - implement as needed
    // This is a placeholder for the payment sync logic
  }
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'completed' | 'error';
  progress?: number;
  message?: string;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  details?: {
    uploaded: number;
    downloaded: number;
    conflicts: number;
    errors: string[];
  };
}

export default new SyncService();
