import databaseService, { DatabaseChangeLog } from './database';
import apiService from './api';
import networkService from './network';
import { SyncChange, SyncConflict } from '../types';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncResult {
  status: SyncStatus;
  itemsSynced: number;
  conflicts: SyncConflict[];
  errors: string[];
}

type SyncStatusListener = (status: SyncStatus, result?: SyncResult) => void;

class SyncService {
  private isSyncing = false;
  private lastSyncTime: string | null = null;
  private listeners: SyncStatusListener[] = [];
  private autoSyncEnabled = true;
  private syncIntervalId: NodeJS.Timeout | null = null;

  constructor() {
    // Listen for network changes
    networkService.addListener((status) => {
      if (status.isConnected && this.autoSyncEnabled && !this.isSyncing) {
        // Delay sync a bit to ensure connection is stable
        setTimeout(() => this.sync(), 2000);
      }
    });
  }

  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return {
        status: 'idle',
        itemsSynced: 0,
        conflicts: [],
        errors: ['Sync already in progress'],
      };
    }

    if (!networkService.isOnline()) {
      console.log('Device is offline, skipping sync');
      return {
        status: 'error',
        itemsSynced: 0,
        conflicts: [],
        errors: ['Device is offline'],
      };
    }

    this.isSyncing = true;
    this.notifyListeners('syncing');

    const result: SyncResult = {
      status: 'idle',
      itemsSynced: 0,
      conflicts: [],
      errors: [],
    };

    try {
      // Step 1: Push local changes to server
      const pushResult = await this.pushChanges();
      result.itemsSynced += pushResult.itemsSynced;
      result.conflicts.push(...pushResult.conflicts);
      result.errors.push(...pushResult.errors);

      // Step 2: Pull changes from server
      if (pushResult.conflicts.length === 0) {
        const pullResult = await this.pullChanges();
        result.itemsSynced += pullResult.itemsSynced;
        result.errors.push(...pullResult.errors);
      }

      // Update last sync time
      this.lastSyncTime = new Date().toISOString();

      result.status = result.conflicts.length > 0 ? 'error' : 'success';
    } catch (error: any) {
      console.error('Sync failed:', error);
      result.status = 'error';
      result.errors.push(error.message || 'Unknown sync error');
    } finally {
      this.isSyncing = false;
      this.notifyListeners(result.status, result);
    }

    return result;
  }

  private async pushChanges(): Promise<SyncResult> {
    const result: SyncResult = {
      status: 'idle',
      itemsSynced: 0,
      conflicts: [],
      errors: [],
    };

    try {
      // Get pending changes from local database
      const pendingItems = await databaseService.getPendingSyncItems();

      if (pendingItems.length === 0) {
        console.log('No pending changes to sync');
        return result;
      }

      // Convert to API format
      const changes: SyncChange[] = pendingItems.map(item => ({
        entity_type: item.entity_type,
        operation: item.operation,
        data: JSON.parse(item.data),
        client_timestamp: item.timestamp,
        client_id: item.client_id,
      }));

      // Push changes to server
      const response = await apiService.pushChanges(changes);

      if (response.conflicts && response.conflicts.length > 0) {
        result.conflicts = response.conflicts;
        result.errors.push('Conflicts detected during sync');
      } else {
        // Mark items as synced
        const syncedIds = pendingItems.map(item => item.id!);
        await databaseService.markAsSynced(syncedIds);
        result.itemsSynced = syncedIds.length;
      }
    } catch (error: any) {
      console.error('Push changes failed:', error);
      result.errors.push(error.message || 'Failed to push changes');
    }

    return result;
  }

  private async pullChanges(): Promise<SyncResult> {
    const result: SyncResult = {
      status: 'idle',
      itemsSynced: 0,
      conflicts: [],
      errors: [],
    };

    try {
      // Pull changes from server
      const response = await apiService.pullChanges(this.lastSyncTime || undefined);

      let itemsUpdated = 0;

      // Update suppliers
      if (response.suppliers && response.suppliers.length > 0) {
        for (const supplier of response.suppliers) {
          await this.mergeSupplier(supplier);
          itemsUpdated++;
        }
      }

      // Update products
      if (response.products && response.products.length > 0) {
        for (const product of response.products) {
          await this.mergeProduct(product);
          itemsUpdated++;
        }
      }

      // Update rates
      if (response.rates && response.rates.length > 0) {
        for (const rate of response.rates) {
          await this.mergeRate(rate);
          itemsUpdated++;
        }
      }

      // Update payments
      if (response.payments && response.payments.length > 0) {
        for (const payment of response.payments) {
          await this.mergePayment(payment);
          itemsUpdated++;
        }
      }

      result.itemsSynced = itemsUpdated;

      // Clean up old synced items
      await databaseService.clearSyncedItems();
    } catch (error: any) {
      console.error('Pull changes failed:', error);
      result.errors.push(error.message || 'Failed to pull changes');
    }

    return result;
  }

  private async mergeSupplier(serverData: any): Promise<void> {
    const localData = await databaseService.getSupplier(serverData.id);

    if (!localData) {
      // New supplier from server
      await databaseService.saveSupplier({ ...serverData, synced: 1 });
    } else if (localData.version < serverData.version) {
      // Server has newer version
      await databaseService.saveSupplier({ ...serverData, synced: 1 });
    }
    // If local version is equal or newer, keep local data
  }

  private async mergeProduct(serverData: any): Promise<void> {
    const localData = await databaseService.getProduct(serverData.id);

    if (!localData) {
      await databaseService.saveProduct({ ...serverData, synced: 1 });
    } else if (localData.version < serverData.version) {
      await databaseService.saveProduct({ ...serverData, synced: 1 });
    }
  }

  private async mergeRate(serverData: any): Promise<void> {
    // For now, rates can be directly saved from server
    // In a full implementation, we would check for local modifications
    // and handle conflicts if needed
    console.log('Merging rate:', serverData.id);
    // TODO: Implement proper rate merging when rate editing is supported in frontend
  }

  private async mergePayment(serverData: any): Promise<void> {
    // Payments are typically not modified after creation
    // They are only created or viewed
    // So we can directly save server data
    console.log('Merging payment:', serverData.id);
    // TODO: If payment editing is implemented, add version conflict detection
  }

  async resolveConflict(
    conflict: SyncConflict,
    resolution: 'server' | 'client'
  ): Promise<void> {
    if (resolution === 'server') {
      // Accept server version
      switch (conflict.entity_type) {
        case 'suppliers':
          await databaseService.saveSupplier({ ...conflict.server_data, synced: 1 });
          break;
        case 'products':
          await databaseService.saveProduct({ ...conflict.server_data, synced: 1 });
          break;
        // Add other entity types as needed
      }
    } else {
      // Keep client version and force push
      // This would require special handling in the backend
      console.log('Client resolution selected, will retry sync');
    }
  }

  enableAutoSync(enabled: boolean, intervalMinutes: number = 5): void {
    this.autoSyncEnabled = enabled;

    if (enabled) {
      // Start periodic sync with configurable interval
      const intervalMs = intervalMinutes * 60 * 1000;
      this.syncIntervalId = setInterval(() => {
        if (networkService.isOnline() && !this.isSyncing) {
          this.sync();
        }
      }, intervalMs);
    } else {
      if (this.syncIntervalId) {
        clearInterval(this.syncIntervalId);
        this.syncIntervalId = null;
      }
    }
  }

  getLastSyncTime(): string | null {
    return this.lastSyncTime;
  }

  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  addListener(listener: SyncStatusListener): () => void {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(status: SyncStatus, result?: SyncResult): void {
    this.listeners.forEach(listener => {
      try {
        listener(status, result);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }
}

export default new SyncService();
