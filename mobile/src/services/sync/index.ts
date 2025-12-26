import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { apiService } from "../api";
import { databaseService } from "../database";
import { supplierRepository } from "../database/SupplierRepository";
import { collectionRepository } from "../database/CollectionRepository";
import { paymentRepository } from "../database/PaymentRepository";
import { SyncChange, SyncConflict, SyncState } from "../../domain/entities";

const SYNC_STATE_KEY = "sync_state";
const SYNC_LOCK_KEY = "sync_lock";

export type SyncEventType =
  | "sync_started"
  | "sync_progress"
  | "sync_completed"
  | "sync_failed"
  | "conflict_detected";

export interface SyncEvent {
  type: SyncEventType;
  data?: unknown;
}

type SyncEventListener = (event: SyncEvent) => void;

class SyncService {
  private listeners: SyncEventListener[] = [];
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private syncState: SyncState = {
    pendingChangesCount: 0,
    isOnline: false,
    isSyncing: false,
    conflicts: [],
  };

  async initialize(): Promise<void> {
    await this.loadSyncState();
    this.startAutoSync();
  }

  subscribe(listener: SyncEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(event: SyncEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  private async loadSyncState(): Promise<void> {
    const stateJson = await AsyncStorage.getItem(SYNC_STATE_KEY);
    if (stateJson) {
      const saved = JSON.parse(stateJson);
      this.syncState = {
        ...saved,
        lastSyncTimestamp: saved.lastSyncTimestamp
          ? new Date(saved.lastSyncTimestamp)
          : undefined,
      };
    }
  }

  private async saveSyncState(): Promise<void> {
    await AsyncStorage.setItem(
      SYNC_STATE_KEY,
      JSON.stringify({
        ...this.syncState,
        lastSyncTimestamp: this.syncState.lastSyncTimestamp?.toISOString(),
      })
    );
  }

  getState(): SyncState {
    return { ...this.syncState };
  }

  private startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      const isOnline = await apiService.isOnline();
      if (isOnline && !this.isSyncing) {
        await this.sync();
      }
    }, intervalMs);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async sync(): Promise<SyncResult> {
    // Prevent concurrent syncs
    const lock = await AsyncStorage.getItem(SYNC_LOCK_KEY);
    if (lock) {
      return { success: false, message: "Sync already in progress" };
    }

    const isOnline = await apiService.isOnline();
    if (!isOnline) {
      return { success: false, message: "No network connection" };
    }

    try {
      await AsyncStorage.setItem(SYNC_LOCK_KEY, Date.now().toString());
      this.isSyncing = true;
      this.syncState.isSyncing = true;
      this.emit({ type: "sync_started" });

      // Step 1: Push local changes
      const pushResult = await this.pushChanges();

      // Step 2: Pull remote changes
      const pullResult = await this.pullChanges();

      // Step 3: Update sync state
      this.syncState.lastSyncTimestamp = new Date();
      this.syncState.pendingChangesCount = 0;
      this.syncState.conflicts = [
        ...pushResult.conflicts,
        ...pullResult.conflicts,
      ];
      await this.saveSyncState();

      this.emit({
        type: "sync_completed",
        data: {
          pushed: pushResult.processed,
          pulled: pullResult.processed,
          conflicts: this.syncState.conflicts.length,
        },
      });

      return {
        success: true,
        pushed: pushResult.processed,
        pulled: pullResult.processed,
        conflicts: this.syncState.conflicts,
      };
    } catch (error) {
      console.error("Sync failed:", error);
      this.emit({ type: "sync_failed", data: { error } });
      return {
        success: false,
        message: error instanceof Error ? error.message : "Sync failed",
      };
    } finally {
      await AsyncStorage.removeItem(SYNC_LOCK_KEY);
      this.isSyncing = false;
      this.syncState.isSyncing = false;
    }
  }

  private async pushChanges(): Promise<{
    processed: number;
    conflicts: SyncConflict[];
  }> {
    const changes: Record<string, SyncChange[]> = {};

    // Collect pending changes from all repositories
    const pendingSuppliers = await supplierRepository.findPendingSync();
    if (pendingSuppliers.length > 0) {
      changes["suppliers"] = pendingSuppliers.map((s) => ({
        id: s.id,
        entity: "suppliers",
        action: s.deletedAt ? "delete" : s.version === 1 ? "create" : "update",
        data: s,
        version: s.version,
        timestamp: s.updatedAt,
        clientId: s.clientId || uuidv4(),
      }));
    }

    const pendingCollections = await collectionRepository.findPendingSync();
    if (pendingCollections.length > 0) {
      changes["collections"] = pendingCollections.map((c) => ({
        id: c.id,
        entity: "collections",
        action: c.deletedAt ? "delete" : c.version === 1 ? "create" : "update",
        data: c,
        version: c.version,
        timestamp: c.updatedAt,
        clientId: c.clientId || uuidv4(),
      }));
    }

    const pendingPayments = await paymentRepository.findPendingSync();
    if (pendingPayments.length > 0) {
      changes["payments"] = pendingPayments.map((p) => ({
        id: p.id,
        entity: "payments",
        action: p.deletedAt ? "delete" : p.version === 1 ? "create" : "update",
        data: p,
        version: p.version,
        timestamp: p.updatedAt,
        clientId: p.clientId || uuidv4(),
      }));
    }

    if (Object.keys(changes).length === 0) {
      return { processed: 0, conflicts: [] };
    }

    this.emit({
      type: "sync_progress",
      data: { phase: "push", count: Object.values(changes).flat().length },
    });

    const response = await apiService.pushChanges(changes);

    // Mark successfully synced items
    for (const entityType of Object.keys(changes)) {
      for (const change of changes[entityType]) {
        const conflict = response.conflicts?.find(
          (c) => c.entityId === change.id && c.entityType === entityType
        );

        if (!conflict) {
          // No conflict, mark as synced
          switch (entityType) {
            case "suppliers":
              await supplierRepository.markAsSynced(
                change.id,
                change.version + 1
              );
              break;
            case "collections":
              await collectionRepository.markAsSynced(
                change.id,
                change.version + 1
              );
              break;
            case "payments":
              await paymentRepository.markAsSynced(
                change.id,
                change.version + 1
              );
              break;
          }
        } else {
          this.emit({ type: "conflict_detected", data: conflict });
        }
      }
    }

    return {
      processed: response.processed,
      conflicts: response.conflicts || [],
    };
  }

  private async pullChanges(): Promise<{
    processed: number;
    conflicts: SyncConflict[];
  }> {
    this.emit({ type: "sync_progress", data: { phase: "pull" } });

    const response = await apiService.pullChanges(
      this.syncState.lastSyncTimestamp
    );

    let processed = 0;

    // Apply changes from server
    if (response.changes) {
      for (const [entityType, entities] of Object.entries(response.changes)) {
        if (!entities || entities.length === 0) continue;

        switch (entityType) {
          case "suppliers":
            await supplierRepository.applyServerChanges(entities as any);
            break;
          case "collections":
            await collectionRepository.applyServerChanges(entities as any);
            break;
          case "payments":
            await paymentRepository.applyServerChanges(entities as any);
            break;
        }

        processed += entities.length;
      }
    }

    return { processed, conflicts: response.conflicts || [] };
  }

  async resolveConflict(
    conflict: SyncConflict,
    resolution: "local" | "server"
  ): Promise<void> {
    if (resolution === "server") {
      // Apply server version
      switch (conflict.entityType) {
        case "suppliers":
          await supplierRepository.applyServerChanges([
            conflict.serverData as any,
          ]);
          break;
        case "collections":
          await collectionRepository.applyServerChanges([
            conflict.serverData as any,
          ]);
          break;
        case "payments":
          await paymentRepository.applyServerChanges([
            conflict.serverData as any,
          ]);
          break;
      }
    } else {
      // Mark local version as pending to push again
      switch (conflict.entityType) {
        case "suppliers":
          await supplierRepository.markAsDirty(conflict.entityId);
          break;
        case "collections":
          await collectionRepository.markAsDirty(conflict.entityId);
          break;
        case "payments":
          await paymentRepository.markAsDirty(conflict.entityId);
          break;
      }
    }

    // Remove from conflicts list
    this.syncState.conflicts = this.syncState.conflicts.filter(
      (c) =>
        !(
          c.entityType === conflict.entityType &&
          c.entityId === conflict.entityId
        )
    );
    await this.saveSyncState();
  }

  async getPendingChangesCount(): Promise<number> {
    const suppliers = await supplierRepository.findPendingSync();
    const collections = await collectionRepository.findPendingSync();
    const payments = await paymentRepository.findPendingSync();
    return suppliers.length + collections.length + payments.length;
  }
}

export interface SyncResult {
  success: boolean;
  message?: string;
  pushed?: number;
  pulled?: number;
  conflicts?: SyncConflict[];
}

export const syncService = new SyncService();
