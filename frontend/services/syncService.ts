import { getDatabase } from '../database';
import apiService from './api';
import * as Network from 'expo-network';
import { v4 as uuidv4 } from 'uuid';
import * as SecureStore from 'expo-secure-store';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
export type EntityType = 'suppliers' | 'products' | 'rates' | 'collections' | 'payments';

interface SyncQueueItem {
  id?: number;
  entity_type: EntityType;
  entity_uuid: string;
  operation: 'create' | 'update' | 'delete';
  payload: any;
  status: 'pending' | 'syncing' | 'success' | 'error';
  retry_count: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

class SyncService {
  private syncInProgress = false;
  private syncListeners: Array<(status: SyncStatus, progress?: number) => void> = [];
  private deviceId: string | null = null;

  constructor() {
    this.initDeviceId();
    this.setupNetworkListener();
  }

  /**
   * Initialize or retrieve device ID
   */
  private async initDeviceId() {
    try {
      let id = await SecureStore.getItemAsync('device_id');
      if (!id) {
        id = uuidv4();
        await SecureStore.setItemAsync('device_id', id);
      }
      this.deviceId = id;
    } catch (error) {
      console.error('Error initializing device ID:', error);
      this.deviceId = uuidv4(); // Fallback
    }
  }

  /**
   * Get device ID
   */
  async getDeviceId(): Promise<string> {
    if (!this.deviceId) {
      await this.initDeviceId();
    }
    return this.deviceId!;
  }

  /**
   * Setup network state listener
   */
  private async setupNetworkListener() {
    // Note: expo-network doesn't have event listeners like NetInfo
    // Network monitoring should be implemented with AppState listener
    // or periodic checks in production
  }

  /**
   * Add sync listener
   */
  addSyncListener(listener: (status: SyncStatus, progress?: number) => void) {
    this.syncListeners.push(listener);
  }

  /**
   * Remove sync listener
   */
  removeSyncListener(listener: (status: SyncStatus, progress?: number) => void) {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(status: SyncStatus, progress?: number) {
    this.syncListeners.forEach(listener => listener(status, progress));
  }

  /**
   * Check if online
   */
  async isOnline(): Promise<boolean> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return networkState.isConnected === true && networkState.isInternetReachable === true;
    } catch (error) {
      console.error('Error checking network state:', error);
      return false;
    }
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(
    entityType: EntityType,
    entityUuid: string,
    operation: 'create' | 'update' | 'delete',
    payload: any
  ): Promise<void> {
    const db = getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO sync_queue (entity_type, entity_uuid, operation, payload, status, retry_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', 0, ?, ?)`,
      [entityType, entityUuid, operation, JSON.stringify(payload), now, now]
    );
  }

  /**
   * Get pending sync items
   */
  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const db = getDatabase();
    const result = await db.getAllAsync<any>(
      `SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC`
    );

    return result.map(item => ({
      ...item,
      payload: JSON.parse(item.payload),
    }));
  }

  /**
   * Auto sync (triggered by events)
   */
  async autoSync(): Promise<void> {
    if (this.syncInProgress) {
      return;
    }

    const online = await this.isOnline();
    if (!online) {
      return;
    }

    await this.fullSync();
  }

  /**
   * Manual sync (triggered by user)
   */
  async manualSync(): Promise<{ success: boolean; message: string }> {
    const online = await this.isOnline();
    if (!online) {
      return {
        success: false,
        message: 'No internet connection. Please check your network and try again.',
      };
    }

    try {
      await this.fullSync();
      return {
        success: true,
        message: 'Sync completed successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Sync failed. Please try again.',
      };
    }
  }

  /**
   * Full bidirectional sync
   */
  async fullSync(): Promise<void> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    this.notifyListeners('syncing', 0);

    try {
      // Step 1: Push local changes (50% progress)
      await this.pushChanges();
      this.notifyListeners('syncing', 50);

      // Step 2: Pull server changes (100% progress)
      await this.pullChanges();
      this.notifyListeners('syncing', 100);

      this.notifyListeners('success');
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifyListeners('error');
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Push local changes to server
   */
  private async pushChanges(): Promise<void> {
    const pendingItems = await this.getPendingSyncItems();
    
    if (pendingItems.length === 0) {
      return;
    }

    const deviceId = await this.getDeviceId();
    const changes = pendingItems.map(item => ({
      entity_type: item.entity_type,
      operation: item.operation,
      data: item.payload,
    }));

    try {
      const response = await apiService.syncPush({ device_id: deviceId, changes });

      // Process results
      const db = getDatabase();
      
      for (const result of response.results.success || []) {
        await this.markSyncItemAsSuccess(result.uuid);
        // Update local data with server response if needed
        if (result.data) {
          await this.updateLocalEntity(result.entity_type, result.data);
        }
      }

      for (const conflict of response.results.conflicts || []) {
        await this.resolveConflict(conflict);
      }

      for (const error of response.results.errors || []) {
        await this.markSyncItemAsError(error.uuid, error.message);
      }
    } catch (error: any) {
      console.error('Push failed:', error);
      throw error;
    }
  }

  /**
   * Pull server changes to local
   */
  private async pullChanges(): Promise<void> {
    const db = getDatabase();
    const deviceId = await this.getDeviceId();
    
    // Get last sync timestamp
    const lastSyncResult = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM app_settings WHERE key = 'last_sync_timestamp'`
    );
    
    const lastSync = lastSyncResult?.value;

    try {
      const response = await apiService.syncPull({
        device_id: deviceId,
        last_sync: lastSync,
        entities: ['suppliers', 'products', 'rates', 'collections', 'payments'],
      });

      // Update local database with server data
      for (const [entityType, entities] of Object.entries(response.data.data)) {
        if (Array.isArray(entities)) {
          for (const entity of entities) {
            await this.updateLocalEntity(entityType as EntityType, entity);
          }
        }
      }

      // Update last sync timestamp
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('last_sync_timestamp', ?, ?)`,
        [now, now]
      );
    } catch (error: any) {
      console.error('Pull failed:', error);
      throw error;
    }
  }

  /**
   * Update local entity from server data
   */
  private async updateLocalEntity(entityType: EntityType, data: any): Promise<void> {
    const db = getDatabase();
    const tableName = entityType;

    // Mark as synced
    data.is_synced = 1;
    data.synced_at = new Date().toISOString();

    // Check if exists
    const existing = await db.getFirstAsync<any>(
      `SELECT id, version FROM ${tableName} WHERE uuid = ?`,
      [data.uuid]
    );

    if (existing) {
      // Update if server version is newer or equal
      if (!data.version || !existing.version || data.version >= existing.version) {
        const fields = Object.keys(data).filter(k => k !== 'id');
        const values = fields.map(k => data[k]);
        const setClause = fields.map(f => `${f} = ?`).join(', ');

        await db.runAsync(
          `UPDATE ${tableName} SET ${setClause} WHERE uuid = ?`,
          [...values, data.uuid]
        );
      }
    } else {
      // Insert new
      const fields = Object.keys(data).filter(k => k !== 'id');
      const placeholders = fields.map(() => '?').join(', ');
      const values = fields.map(k => typeof data[k] === 'object' ? JSON.stringify(data[k]) : data[k]);

      await db.runAsync(
        `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );
    }
  }

  /**
   * Resolve sync conflict (server wins strategy)
   */
  private async resolveConflict(conflict: any): Promise<void> {
    // Default: Server wins
    if (conflict.server_data) {
      await this.updateLocalEntity(conflict.entity_type, conflict.server_data);
    }
    
    // Mark sync item as success after resolution
    await this.markSyncItemAsSuccess(conflict.uuid);
  }

  /**
   * Mark sync item as successful
   */
  private async markSyncItemAsSuccess(entityUuid: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      `UPDATE sync_queue SET status = 'success', updated_at = ? WHERE entity_uuid = ? AND status = 'pending'`,
      [new Date().toISOString(), entityUuid]
    );
  }

  /**
   * Mark sync item as error
   */
  private async markSyncItemAsError(entityUuid: string, errorMessage: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      `UPDATE sync_queue SET status = 'error', error_message = ?, retry_count = retry_count + 1, updated_at = ? 
       WHERE entity_uuid = ? AND status = 'pending'`,
      [errorMessage, new Date().toISOString(), entityUuid]
    );
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    pending: number;
    syncing: number;
    error: number;
    lastSync: string | null;
  }> {
    const db = getDatabase();
    
    const pending = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'`
    );
    
    const syncing = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'syncing'`
    );
    
    const error = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'error'`
    );
    
    const lastSync = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM app_settings WHERE key = 'last_sync_timestamp'`
    );

    return {
      pending: pending?.count || 0,
      syncing: syncing?.count || 0,
      error: error?.count || 0,
      lastSync: lastSync?.value || null,
    };
  }
}

export default new SyncService();
