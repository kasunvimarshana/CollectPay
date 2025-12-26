// Sync orchestration engine
import Database from "../database/Database";
import ApiClient from "../network/ApiClient";
import NetworkMonitor from "../network/NetworkMonitor";
import SecureStorage from "../storage/SecureStorage";
import { EventEmitter } from "events";

class SyncEngine extends EventEmitter {
  constructor() {
    super();
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.autoSyncEnabled = true;
  }

  async init() {
    // Load last sync time
    const lastSync = await Database.queryFirst(
      "SELECT value FROM sync_metadata WHERE key = 'last_sync_time'"
    );
    this.lastSyncTime = lastSync?.value || null;

    // Listen for network regain
    NetworkMonitor.on("networkRegained", () => {
      if (this.autoSyncEnabled) {
        this.triggerSync("network_regained");
      }
    });
  }

  async triggerSync(reason = "manual") {
    if (this.isSyncing) {
      console.log("Sync already in progress");
      return { status: "in_progress" };
    }

    if (!NetworkMonitor.getConnectionStatus()) {
      console.log("Cannot sync: offline");
      return { status: "offline" };
    }

    console.log(`Sync triggered: ${reason}`);
    this.emit("syncStarted", { reason });
    this.isSyncing = true;

    try {
      const result = await this.performSync();
      this.emit("syncCompleted", result);
      return result;
    } catch (error) {
      console.error("Sync error:", error);
      this.emit("syncFailed", { error: error.message });
      return { status: "error", error: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  async performSync() {
    const results = {
      pushed: 0,
      pulled: 0,
      conflicts: [],
      errors: [],
    };

    // Step 1: Push local changes
    const pushResult = await this.pushChanges();
    results.pushed = pushResult.success;
    results.conflicts = pushResult.conflicts;
    results.errors = pushResult.errors;

    // Step 2: Pull remote changes
    if (this.lastSyncTime) {
      const pullResult = await this.pullChanges();
      results.pulled = pullResult.count;
    } else {
      // First sync - full sync
      const fullResult = await this.fullSync();
      results.pulled = fullResult.count;
    }

    // Step 3: Update sync metadata
    const now = new Date().toISOString();
    await Database.execute(
      `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) 
       VALUES ('last_sync_time', ?, ?)`,
      [now, now]
    );
    this.lastSyncTime = now;

    return { status: "success", ...results, timestamp: now };
  }

  async pushChanges() {
    const result = {
      success: 0,
      conflicts: [],
      errors: [],
    };

    // Get pending sync queue items
    const queueItems = await Database.query(
      "SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC LIMIT 100"
    );

    if (queueItems.length === 0) {
      return result;
    }

    // Prepare sync data
    const syncData = queueItems.map((item) => ({
      entity_type: item.entity_type,
      operation: item.operation,
      data: JSON.parse(item.payload),
      version: JSON.parse(item.payload).version || 1,
    }));

    try {
      const deviceId = await SecureStorage.getDeviceId();
      const response = await ApiClient.syncData(syncData, deviceId);

      // Process results
      if (response.results.success) {
        for (const item of response.results.success) {
          result.success++;
          // Update local entity with server data
          await this.updateLocalEntity(item);
          // Remove from queue
          const queueItem = queueItems.find(
            (q) =>
              q.entity_type === item.entity_type &&
              JSON.parse(q.payload).uuid === item.data.uuid
          );
          if (queueItem) {
            await Database.execute("DELETE FROM sync_queue WHERE id = ?", [
              queueItem.id,
            ]);
          }
        }
      }

      // Handle conflicts
      if (response.results.conflicts) {
        result.conflicts = response.results.conflicts;
        // Store conflicts for manual resolution
        for (const conflict of response.results.conflicts) {
          await this.storeConflict(conflict);
        }
      }

      // Handle errors
      if (response.results.failed) {
        result.errors = response.results.failed;
      }
    } catch (error) {
      console.error("Push changes error:", error);
      result.errors.push({ message: error.message });
    }

    return result;
  }

  async pullChanges() {
    const result = { count: 0 };

    try {
      const response = await ApiClient.pullChanges(this.lastSyncTime);

      if (response.changes) {
        // Update local database with remote changes
        await this.applyRemoteChanges(response.changes);

        result.count =
          (response.changes.suppliers?.length || 0) +
          (response.changes.products?.length || 0) +
          (response.changes.rates?.length || 0) +
          (response.changes.collections?.length || 0) +
          (response.changes.payments?.length || 0);
      }
    } catch (error) {
      console.error("Pull changes error:", error);
      throw error;
    }

    return result;
  }

  async fullSync() {
    const result = { count: 0 };

    try {
      const response = await ApiClient.fullSync();

      if (response.data) {
        // Clear local data and replace with server data
        await Database.transaction(async (db) => {
          await db.execute("DELETE FROM suppliers WHERE synced = 1");
          await db.execute("DELETE FROM products WHERE synced = 1");
          await db.execute("DELETE FROM rates WHERE synced = 1");
          await db.execute("DELETE FROM collections WHERE synced = 1");
          await db.execute("DELETE FROM payments WHERE synced = 1");

          await this.applyRemoteChanges(response.data);
        });

        result.count =
          (response.data.suppliers?.length || 0) +
          (response.data.products?.length || 0) +
          (response.data.rates?.length || 0) +
          (response.data.collections?.length || 0) +
          (response.data.payments?.length || 0);
      }
    } catch (error) {
      console.error("Full sync error:", error);
      throw error;
    }

    return result;
  }

  async applyRemoteChanges(changes) {
    // Apply suppliers
    if (changes.suppliers) {
      for (const supplier of changes.suppliers) {
        await this.upsertEntity("suppliers", supplier);
      }
    }

    // Apply products
    if (changes.products) {
      for (const product of changes.products) {
        await this.upsertEntity("products", product);
      }
    }

    // Apply rates
    if (changes.rates) {
      for (const rate of changes.rates) {
        await this.upsertEntity("rates", rate);
      }
    }

    // Apply collections
    if (changes.collections) {
      for (const collection of changes.collections) {
        await this.upsertEntity("collections", collection);
      }
    }

    // Apply payments
    if (changes.payments) {
      for (const payment of changes.payments) {
        await this.upsertEntity("payments", payment);
      }
    }
  }

  async upsertEntity(tableName, data) {
    const existing = await Database.queryFirst(
      `SELECT id FROM ${tableName} WHERE server_id = ?`,
      [data.id]
    );

    const mappedData = this.mapServerToLocal(data);

    if (existing) {
      // Update
      const setClauses = Object.keys(mappedData)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = [...Object.values(mappedData), existing.id];
      await Database.execute(
        `UPDATE ${tableName} SET ${setClauses}, synced = 1 WHERE id = ?`,
        values
      );
    } else {
      // Insert
      const columns = ["server_id", ...Object.keys(mappedData), "synced"];
      const placeholders = columns.map(() => "?").join(", ");
      const values = [data.id, ...Object.values(mappedData), 1];
      await Database.execute(
        `INSERT INTO ${tableName} (${columns.join(
          ", "
        )}) VALUES (${placeholders})`,
        values
      );
    }
  }

  mapServerToLocal(serverData) {
    const { id, created_by, updated_by, deleted_at, ...rest } = serverData;

    // Convert metadata and calculation_details to JSON strings
    if (rest.metadata && typeof rest.metadata === "object") {
      rest.metadata = JSON.stringify(rest.metadata);
    }
    if (
      rest.calculation_details &&
      typeof rest.calculation_details === "object"
    ) {
      rest.calculation_details = JSON.stringify(rest.calculation_details);
    }

    return rest;
  }

  async updateLocalEntity(syncResult) {
    // Update local entity with server-returned data
    await this.upsertEntity(syncResult.entity_type + "s", syncResult.data);
  }

  async storeConflict(conflict) {
    // Store conflict for manual resolution
    const now = new Date().toISOString();
    await Database.execute(
      `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) 
       VALUES (?, ?, ?)`,
      [
        `conflict_${conflict.entity_type}_${
          conflict.client_data.id || conflict.client_data.uuid
        }`,
        JSON.stringify(conflict),
        now,
      ]
    );
    console.log("Conflict stored:", conflict);
  }

  async resolveConflict(conflictId, resolution) {
    // resolution: 'keep_local' | 'keep_server' | 'merge'
    const conflictData = await Database.queryFirst(
      "SELECT value FROM sync_metadata WHERE key LIKE ?",
      [`conflict_%${conflictId}%`]
    );

    if (!conflictData) {
      throw new Error("Conflict not found");
    }

    const conflict = JSON.parse(conflictData.value);

    if (resolution === "keep_server") {
      // Apply server data
      await this.upsertEntity(
        conflict.entity_type + "s",
        conflict.server_data.data
      );
    } else if (resolution === "keep_local") {
      // Re-queue local data for sync
      await Database.execute(
        `INSERT INTO sync_queue (entity_type, entity_id, operation, payload, status, created_at)
         VALUES (?, ?, 'update', ?, 'pending', ?)`,
        [
          conflict.entity_type,
          conflict.client_data.id,
          JSON.stringify(conflict.client_data),
          new Date().toISOString(),
        ]
      );
    }

    // Remove conflict marker
    await Database.execute("DELETE FROM sync_metadata WHERE key LIKE ?", [
      `conflict_%${conflictId}%`,
    ]);
  }

  async getConflicts() {
    const conflicts = await Database.query(
      "SELECT key, value FROM sync_metadata WHERE key LIKE 'conflict_%'"
    );
    return conflicts.map((c) => ({
      id: c.key.replace("conflict_", ""),
      ...JSON.parse(c.value),
    }));
  }

  getStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      isOnline: NetworkMonitor.getConnectionStatus(),
    };
  }

  async getPendingCount() {
    const result = await Database.queryFirst(
      "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'"
    );
    return result?.count || 0;
  }

  async getPendingSyncCount() {
    return await this.getPendingCount();
  }

  async clearSyncQueue() {
    await Database.execute("DELETE FROM sync_queue WHERE status = 'pending'");
  }

  setAutoSync(enabled) {
    this.autoSyncEnabled = enabled;
  }
}

export default new SyncEngine();
