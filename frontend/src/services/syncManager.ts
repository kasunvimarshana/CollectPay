import { localDb } from '../database/localDb';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useNetworkStore } from '../store/networkStore';
import { AppState, AppStateStatus } from 'react-native';

class SyncManager {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  private lastSyncTime: Date | null = null;
  private pendingSyncTrigger: NodeJS.Timeout | null = null;

  /**
   * Initialize sync manager with event-driven triggers
   */
  async initialize() {
    // Subscribe to app state changes (foreground/background)
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange
    );

    // Subscribe to network state changes
    useNetworkStore.subscribe(
      (state) => state.isConnected,
      (isConnected, previousIsConnected) => {
        if (isConnected && !previousIsConnected) {
          // Network regained - trigger sync
          console.log('Network regained, triggering sync...');
          this.triggerSync('network_regain');
        }
      }
    );

    // Subscribe to authentication state
    useAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated) => {
        if (isAuthenticated) {
          // User authenticated - trigger sync
          console.log('User authenticated, triggering sync...');
          this.triggerSync('authentication');
        }
      }
    );
  }

  /**
   * Handle app state changes (foreground/background)
   */
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground - trigger sync
      console.log('App foregrounded, triggering sync...');
      this.triggerSync('app_foreground');
    }
  };

  /**
   * Trigger sync with debouncing to avoid rapid consecutive syncs
   */
  private triggerSync(reason: string) {
    // Clear any pending sync trigger
    if (this.pendingSyncTrigger) {
      clearTimeout(this.pendingSyncTrigger);
    }

    // Debounce sync triggers (wait 2 seconds before syncing)
    this.pendingSyncTrigger = setTimeout(() => {
      console.log(`Sync triggered by: ${reason}`);
      this.performSync();
    }, 2000);
  }

  /**
   * Start automatic periodic sync
   */
  async startAutoSync(intervalMs: number = 60000) {
    // Stop any existing interval
    this.stopAutoSync();

    // Start periodic sync
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, intervalMs);

    // Initial sync
    await this.performSync();
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Cleanup subscriptions
   */
  cleanup() {
    this.stopAutoSync();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    if (this.pendingSyncTrigger) {
      clearTimeout(this.pendingSyncTrigger);
    }
  }

  async performSync(): Promise<{ success: boolean; message: string }> {
    const { isConnected } = useNetworkStore.getState();
    const { device, isAuthenticated } = useAuthStore.getState();

    if (!isConnected || !isAuthenticated || !device) {
      return { success: false, message: 'Cannot sync: offline or not authenticated' };
    }

    if (this.isSyncing) {
      return { success: false, message: 'Sync already in progress' };
    }

    // Prevent sync more frequently than every 10 seconds
    if (this.lastSyncTime && Date.now() - this.lastSyncTime.getTime() < 10000) {
      return { success: false, message: 'Sync too frequent, please wait' };
    }

    this.isSyncing = true;

    try {
      // 1. Push local changes to server
      await this.pushLocalChanges(device.id);

      // 2. Pull server changes
      await this.pullServerChanges(device.id);

      this.lastSyncTime = new Date();
      this.isSyncing = false;
      return { success: true, message: 'Sync completed successfully' };
    } catch (error: any) {
      this.isSyncing = false;
      console.error('Sync error:', error);
      return { success: false, message: error.message || 'Sync failed' };
    }
  }

  private async pushLocalChanges(deviceId: number) {
    // Push transactions
    const unsyncedTransactions = await localDb.getUnsyncedTransactions();
    if (unsyncedTransactions.length > 0) {
      const result = await apiClient.syncTransactions(deviceId, unsyncedTransactions);
      
      // Mark synced transactions
      for (const syncedItem of result.synced) {
        if (syncedItem.status === 'created' || syncedItem.status === 'updated') {
          await localDb.markTransactionSynced(syncedItem.uuid);
        }
      }

      // Handle conflicts (server wins by default)
      for (const conflict of result.conflicts) {
        console.warn('Transaction conflict detected:', conflict);
        // TODO: Implement conflict resolution UI
      }
    }

    // Push payments
    const unsyncedPayments = await localDb.getUnsyncedPayments();
    if (unsyncedPayments.length > 0) {
      const result = await apiClient.syncPayments(deviceId, unsyncedPayments);
      
      // Mark synced payments
      for (const syncedItem of result.synced) {
        if (syncedItem.status === 'created' || syncedItem.status === 'updated') {
          await localDb.markPaymentSynced(syncedItem.uuid);
        }
      }

      // Handle conflicts
      for (const conflict of result.conflicts) {
        console.warn('Payment conflict detected:', conflict);
        // TODO: Implement conflict resolution UI
      }
    }
  }

  private async pullServerChanges(deviceId: number) {
    // Get last sync timestamp (you might want to store this)
    const updates = await apiClient.getUpdates(deviceId);

    // Update local database with server changes
    for (const supplier of updates.suppliers) {
      await localDb.saveSupplier(supplier);
    }

    for (const transaction of updates.transactions) {
      await localDb.saveTransaction(transaction);
    }

    for (const payment of updates.payments) {
      await localDb.savePayment(payment);
    }
  }

  async forceSyncNow(): Promise<{ success: boolean; message: string }> {
    // Force sync immediately, bypassing the frequency check
    const tempLastSync = this.lastSyncTime;
    this.lastSyncTime = null;
    const result = await this.performSync();
    if (!result.success && tempLastSync) {
      this.lastSyncTime = tempLastSync;
    }
    return result;
  }

  /**
   * Get sync status information
   */
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
    };
  }
}

export const syncManager = new SyncManager();
export default syncManager;
