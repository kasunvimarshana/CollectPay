/**
 * Sync Service
 * Handles synchronization between local and remote data
 */

import { LocalDatabase } from '../datasources/LocalDatabase';
import { HttpClient } from '../datasources/HttpClient';
import NetInfo from '@react-native-community/netinfo';

interface SyncQueueItem {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: string;
  createdAt: string;
  attempts: number;
  lastAttemptAt?: string;
  errorMessage?: string;
}

export class SyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(
    private localDb: LocalDatabase,
    private httpClient: HttpClient
  ) {}

  /**
   * Start automatic synchronization
   */
  startAutoSync(intervalMs: number = 60000): void {
    // Listen to network state changes
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.isSyncing) {
        this.syncAll().catch(error => {
          console.error('Auto-sync failed:', error);
        });
      }
    });

    // Periodic sync
    this.syncInterval = setInterval(() => {
      this.syncAll().catch(error => {
        console.error('Periodic sync failed:', error);
      });
    }, intervalMs);
  }

  /**
   * Stop automatic synchronization
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync all pending changes
   */
  async syncAll(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      console.log('No network connection, skipping sync');
      return;
    }

    this.isSyncing = true;

    try {
      // Get all pending sync items
      const pendingItems = await this.localDb.query<SyncQueueItem>(
        'SELECT * FROM sync_queue ORDER BY created_at ASC'
      );

      console.log(`Syncing ${pendingItems.length} pending items`);

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          // Remove from queue on success
          await this.localDb.execute(
            'DELETE FROM sync_queue WHERE id = ?',
            [item.id]
          );
        } catch (error) {
          // Update error info
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await this.localDb.execute(
            `UPDATE sync_queue SET 
              attempts = attempts + 1, 
              last_attempt_at = ?, 
              error_message = ?
             WHERE id = ?`,
            [new Date().toISOString(), errorMessage, item.id]
          );
          console.error(`Failed to sync item ${item.id}:`, error);
        }
      }

      // Sync down changes from server
      await this.syncDown();
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single item
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    const endpoint = this.getEndpoint(item.entityType, item.operation, item.entityId);
    const payload = JSON.parse(item.payload);

    switch (item.operation) {
      case 'create':
        await this.httpClient.post(endpoint, payload);
        break;
      case 'update':
        await this.httpClient.put(endpoint, payload);
        break;
      case 'delete':
        await this.httpClient.delete(endpoint);
        break;
    }

    // Update entity sync status
    await this.updateEntitySyncStatus(item.entityType, item.entityId, 'synced');
  }

  /**
   * Sync down changes from server
   */
  private async syncDown(): Promise<void> {
    // Get last sync timestamp for each entity type
    const entityTypes = ['users', 'suppliers', 'products', 'product_rates', 'collections', 'payments'];

    for (const entityType of entityTypes) {
      try {
        // Get last synced timestamp
        const result = await this.localDb.queryOne<{ last_synced: string }>(
          `SELECT MAX(last_synced_at) as last_synced FROM ${entityType}`
        );

        const lastSynced = result?.last_synced || '1970-01-01T00:00:00Z';

        // Fetch updates from server
        const endpoint = `/${entityType}/changes?since=${encodeURIComponent(lastSynced)}`;
        const changes = await this.httpClient.get<any[]>(endpoint);

        // Apply changes to local database
        for (const change of changes) {
          await this.applyServerChange(entityType, change);
        }

        console.log(`Synced ${changes.length} changes for ${entityType}`);
      } catch (error) {
        console.error(`Failed to sync down ${entityType}:`, error);
      }
    }
  }

  /**
   * Apply a server change to local database
   */
  private async applyServerChange(entityType: string, data: any): Promise<void> {
    const now = new Date().toISOString();

    // Check for conflicts
    const existing = await this.localDb.queryOne<any>(
      `SELECT version, sync_status FROM ${entityType} WHERE id = ?`,
      [data.id]
    );

    if (existing && existing.sync_status === 'pending') {
      // Conflict detected - server version takes precedence
      console.warn(`Conflict detected for ${entityType} ${data.id}, using server version`);
    }

    // Update or insert
    await this.upsertEntity(entityType, data, now);
  }

  /**
   * Upsert entity into local database
   */
  private async upsertEntity(entityType: string, data: any, syncedAt: string): Promise<void> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    
    // Add sync metadata
    columns.push('sync_status', 'last_synced_at');
    values.push('synced', syncedAt);

    const placeholders = columns.map(() => '?').join(', ');
    const updatePlaceholders = columns.map(col => `${col} = ?`).join(', ');

    await this.localDb.execute(
      `INSERT INTO ${entityType} (${columns.join(', ')}) 
       VALUES (${placeholders})
       ON CONFLICT(id) DO UPDATE SET ${updatePlaceholders}`,
      [...values, ...values]
    );
  }

  /**
   * Update entity sync status
   */
  private async updateEntitySyncStatus(entityType: string, entityId: string, status: string): Promise<void> {
    const now = new Date().toISOString();
    await this.localDb.execute(
      `UPDATE ${entityType} SET sync_status = ?, last_synced_at = ? WHERE id = ?`,
      [status, now, entityId]
    );
  }

  /**
   * Get API endpoint for entity operation
   */
  private getEndpoint(entityType: string, operation: string, entityId?: string): string {
    const baseEndpoint = `/${entityType}`;
    
    if (operation === 'create') {
      return baseEndpoint;
    }
    
    return `${baseEndpoint}/${entityId}`;
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(
    entityType: string,
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    payload: any
  ): Promise<void> {
    const id = `${entityType}_${entityId}_${operation}_${Date.now()}`;
    const now = new Date().toISOString();

    await this.localDb.execute(
      `INSERT INTO sync_queue (id, entity_type, entity_id, operation, payload, created_at, attempts)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, entityType, entityId, operation, JSON.stringify(payload), now, 0]
    );
  }

  /**
   * Get pending sync count
   */
  async getPendingCount(): Promise<number> {
    const result = await this.localDb.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM sync_queue'
    );
    return result?.count || 0;
  }

  /**
   * Clear failed sync items
   */
  async clearFailedSyncs(): Promise<void> {
    await this.localDb.execute(
      'DELETE FROM sync_queue WHERE attempts >= 3'
    );
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    pending: number;
    lastSync: string | null;
    isSyncing: boolean;
  }> {
    const pending = await this.getPendingCount();
    
    const result = await this.localDb.queryOne<{ last_sync: string }>(
      `SELECT MAX(last_synced_at) as last_sync FROM (
        SELECT last_synced_at FROM users
        UNION ALL SELECT last_synced_at FROM suppliers
        UNION ALL SELECT last_synced_at FROM products
        UNION ALL SELECT last_synced_at FROM collections
        UNION ALL SELECT last_synced_at FROM payments
      )`
    );

    return {
      pending,
      lastSync: result?.last_sync || null,
      isSyncing: this.isSyncing,
    };
  }
}
