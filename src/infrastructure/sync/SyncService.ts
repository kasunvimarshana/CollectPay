import { SQLiteClient } from "../persistence/sqlite/SQLiteClient";
import type { SyncProvider, SyncOperation } from "./providers/SyncProvider";
import { LastWriteWins } from "./conflict/Resolution";
import * as Network from "expo-network";

export class SyncService {
  private client = SQLiteClient.getInstance();
  private resolver = new LastWriteWins();
  private syncing = false;

  async isOnline(): Promise<boolean> {
    const state = await Network.getNetworkStateAsync();
    return !!state.isConnected && !!state.isInternetReachable;
  }

  async processQueue(provider: SyncProvider): Promise<void> {
    if (this.syncing) return;
    this.syncing = true;
    try {
      const ops = await this.client.all<SyncOperation>(
        "SELECT id, op, entity, entityId, payload, timestamp, deviceId FROM sync_operations WHERE status = 'pending' ORDER BY timestamp ASC"
      );
      for (const op of ops) {
        try {
          const res = await provider.apply(op);
          if (res === "applied" || res === "ignored") {
            await this.client.run(
              "UPDATE sync_operations SET status = 'synced' WHERE id = ?",
              [op.id]
            );
          } else if (res === "conflict") {
            await this.client.run(
              "UPDATE sync_operations SET status = 'error' WHERE id = ?",
              [op.id]
            );
          }
        } catch (e) {
          await this.client.run(
            "UPDATE sync_operations SET status = 'error', retries = retries + 1 WHERE id = ?",
            [op.id]
          );
        }
      }
    } finally {
      this.syncing = false;
    }
  }
}
