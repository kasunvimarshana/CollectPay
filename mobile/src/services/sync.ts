import { database } from "./database";
import { apiService } from "./api";
import { socketService } from "./socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, SYNC_CONFIG } from "@/config/constants";
import { Collection, Payment, Supplier } from "@/types";

/**
 * Sync Service - Manages offline-first synchronization between local DB and server
 * Implements conflict resolution and retry logic
 */
class SyncService {
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    // Start periodic sync
    this.startPeriodicSync();

    // Listen to network changes
    this.setupNetworkListener();
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.sync().catch((error) => {
        console.error("Periodic sync failed:", error);
      });
    }, SYNC_CONFIG.SYNC_INTERVAL);
  }

  private setupNetworkListener(): void {
    // When network is restored, trigger immediate sync
    // This would integrate with NetInfo listener
  }

  async sync(): Promise<{ success: boolean; synced: number; failed: number }> {
    if (this.isSyncing) {
      return { success: false, synced: 0, failed: 0 };
    }

    if (!apiService.getConnectionStatus()) {
      console.log("Skipping sync: No internet connection");
      return { success: false, synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let syncedCount = 0;
    let failedCount = 0;

    try {
      // Step 1: Push local changes to server
      const pushResult = await this.pushLocalChanges();
      syncedCount += pushResult.synced;
      failedCount += pushResult.failed;

      // Step 2: Pull server changes to local
      await this.pullServerChanges();

      // Step 3: Update last sync timestamp
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_SYNC,
        new Date().toISOString()
      );

      // Notify via socket
      socketService.emitSyncCompleted({ count: syncedCount });

      return { success: true, synced: syncedCount, failed: failedCount };
    } catch (error) {
      console.error("Sync failed:", error);
      return { success: false, synced: syncedCount, failed: failedCount };
    } finally {
      this.isSyncing = false;
    }
  }

  private async pushLocalChanges(): Promise<{
    synced: number;
    failed: number;
  }> {
    let synced = 0;
    let failed = 0;

    try {
      // Get pending sync queue items
      const queueItems = await database.getPendingSyncItems(
        SYNC_CONFIG.BATCH_SIZE
      );

      if (queueItems.length === 0) {
        return { synced, failed };
      }

      // Process each item
      for (const item of queueItems) {
        try {
          await this.processSyncQueueItem(item);
          await database.updateSyncQueueItemStatus(item.id, "synced");
          await database.removeSyncQueueItem(item.id);
          synced++;
        } catch (error: any) {
          console.error(`Failed to sync item ${item.id}:`, error);

          // Update retry count
          const newRetryCount = item.retryCount + 1;

          if (newRetryCount >= SYNC_CONFIG.MAX_RETRY_ATTEMPTS) {
            await database.updateSyncQueueItemStatus(
              item.id,
              "failed",
              error.message
            );
          } else {
            // Will retry in next sync
            await database.updateSyncQueueItemStatus(
              item.id,
              "pending",
              error.message
            );
          }

          failed++;
        }
      }
    } catch (error) {
      console.error("Error pushing local changes:", error);
    }

    return { synced, failed };
  }

  private async processSyncQueueItem(item: any): Promise<void> {
    const { entityType, operation, payload } = item;

    switch (entityType) {
      case "collection":
        await this.syncCollection(operation, payload);
        break;

      case "payment":
        await this.syncPayment(operation, payload);
        break;

      case "supplier":
        await this.syncSupplier(operation, payload);
        break;

      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  private async syncCollection(operation: string, payload: any): Promise<void> {
    switch (operation) {
      case "create":
        await apiService.createCollection(payload);
        break;

      case "update":
        await apiService.updateCollection(payload.id, payload);
        break;

      case "delete":
        await apiService.deleteCollection(payload.id);
        break;
    }
  }

  private async syncPayment(operation: string, payload: any): Promise<void> {
    switch (operation) {
      case "create":
        await apiService.createPayment(payload);
        break;

      case "update":
        await apiService.updatePayment(payload.id, payload);
        break;

      case "delete":
        await apiService.deletePayment(payload.id);
        break;
    }
  }

  private async syncSupplier(operation: string, payload: any): Promise<void> {
    switch (operation) {
      case "create":
        await apiService.createSupplier(payload);
        break;

      case "update":
        await apiService.updateSupplier(payload.id, payload);
        break;

      case "delete":
        await apiService.deleteSupplier(payload.id);
        break;
    }
  }

  private async pullServerChanges(): Promise<void> {
    try {
      const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);

      // Pull changes from server
      const response = await apiService.pullSyncData(lastSync || undefined);

      if (response.success && response.data) {
        const { suppliers, collections, payments } = response.data;

        // Update local database
        if (suppliers) {
          for (const supplier of suppliers) {
            await database.saveSupplier(supplier);
          }
        }

        if (collections) {
          for (const collection of collections) {
            await database.saveCollection(collection);
          }
        }

        if (payments) {
          for (const payment of payments) {
            await database.savePayment(payment);
          }
        }
      }
    } catch (error) {
      console.error("Error pulling server changes:", error);
      throw error;
    }
  }

  async queueForSync(
    entityType: "collection" | "payment" | "supplier",
    operation: "create" | "update" | "delete",
    payload: any
  ): Promise<void> {
    await database.addToSyncQueue({
      entityType,
      entityId: payload.id,
      operation,
      payload,
      status: "pending",
      retryCount: 0,
    });

    // Trigger immediate sync if online
    if (apiService.getConnectionStatus()) {
      this.sync().catch((error) => {
        console.error("Immediate sync failed:", error);
      });
    }
  }

  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async getLastSyncTime(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  }

  async getPendingSyncCount(): Promise<number> {
    const items = await database.getPendingSyncItems();
    return items.length;
  }
}

export const syncService = new SyncService();
