import { db } from "../../infrastructure/db/sqlite";
import * as Network from "expo-network";
import { ApiClient } from "../services/api";
import { emit } from "../services/notify";
// Typings: use 'any' for Expo SQLite callbacks in this context

export class SyncManager {
  private processing = false;
  private nextRetryAt: number | null = null;
  private retryDelayMs = 15000;
  private readonly baseRetryMs = 15000;
  private readonly maxRetryMs = 5 * 60 * 1000; // 5 minutes
  constructor(
    private api: ApiClient,
    private getToken: () => Promise<string | null>
  ) {}

  async enqueue(entity: string, payload: any) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return new Promise<void>((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          "INSERT INTO sync_queue (id, entity, payload, createdAt) VALUES (?, ?, ?, ?)",
          [id, entity, JSON.stringify(payload), Date.now()],
          () => resolve(),
          (_: any, err: any) => {
            reject(err as Error);
            return false;
          }
        );
      });
    });
  }

  async processQueue() {
    if (this.processing) return;
    if (this.nextRetryAt && Date.now() < this.nextRetryAt) return;
    const state = await Network.getNetworkStateAsync();
    if (!state.isConnected) return;
    const token = await this.getToken();
    if (!token) return;
    this.processing = true;

    // Batch queue items into aggregated payload
    const items: Array<{ id: string; entity: string; payload: any }> =
      await new Promise((resolve, reject) => {
        db.readTransaction((tx: any) => {
          tx.executeSql(
            "SELECT * FROM sync_queue ORDER BY createdAt ASC",
            [],
            (_: any, { rows }: any) => {
              const out: Array<{ id: string; entity: string; payload: any }> =
                [];
              for (let i = 0; i < rows.length; i++) {
                const r = rows.item(i);
                out.push({
                  id: r.id,
                  entity: r.entity,
                  payload: JSON.parse(r.payload),
                });
              }
              resolve(out);
            },
            () => {
              reject(new Error("Failed to read sync queue"));
              return false;
            }
          );
        });
      });

    if (items.length === 0) {
      this.processing = false;
      return;
    }

    // Notify listeners that a sync cycle started
    emit("Sync started", "info", "sync", { status: "start" });

    const collections = items
      .filter((i) => i.entity === "collection")
      .map((i) => i.payload);
    const payments = items
      .filter((i) => i.entity === "payment")
      .map((i) => i.payload);
    const suppliers = items
      .filter((i) => i.entity === "supplier")
      .map((i) => ({ id: i.id, payload: i.payload }));

    try {
      const res = await this.api.post<{ ok: boolean; applied: number }>(
        "/sync",
        {
          collections,
          payments,
        }
      );
      if (res.ok) {
        // Remove successfully synced items
        for (const it of items) {
          await this.remove(it.id);
        }
        // Mark local rows as synced when applicable
        await this.markSynced(collections, payments);
        // Reset backoff on success
        this.retryDelayMs = this.baseRetryMs;
        const count =
          typeof res.applied === "number" ? res.applied : items.length;
        emit(`Synced ${count} item(s).`, "success");
        await this.emitQueueCount();
      }
    } catch {
      // swallow to retry later; add exponential backoff with jitter
      this.retryDelayMs = Math.min(this.retryDelayMs * 2, this.maxRetryMs);
      const jitter = Math.floor(this.retryDelayMs * (0.2 * Math.random()));
      this.nextRetryAt = Date.now() + this.retryDelayMs + jitter;
      emit("Sync failed. Will retry soon.", "error");
    }

    // Process supplier creations individually (no aggregate endpoint required)
    for (const s of suppliers) {
      try {
        const created = await this.api.post<any>("/suppliers", s.payload);
        await this.remove(s.id);
        // Update local row with server-assigned id if it differs
        const newId = created?.id ?? s.payload.id;
        if (newId !== s.payload.id) {
          await new Promise<void>((resolve, reject) => {
            db.transaction(
              (tx: any) => {
                tx.executeSql("UPDATE suppliers SET id = ? WHERE id = ?", [
                  newId,
                  s.payload.id,
                ]);
                // Remap foreign keys in related tables
                tx.executeSql(
                  "UPDATE collections SET supplierId = ? WHERE supplierId = ?",
                  [newId, s.payload.id]
                );
                tx.executeSql(
                  "UPDATE payments SET supplierId = ? WHERE supplierId = ?",
                  [newId, s.payload.id]
                );
                tx.executeSql(
                  "UPDATE rates SET supplierId = ? WHERE supplierId = ?",
                  [newId, s.payload.id]
                );
              },
              reject,
              resolve
            );
          });
        }
        await this.emitQueueCount();
      } catch {
        // keep for retry later; add exponential backoff with jitter
        this.retryDelayMs = Math.min(this.retryDelayMs * 2, this.maxRetryMs);
        const jitter = Math.floor(this.retryDelayMs * (0.2 * Math.random()));
        this.nextRetryAt = Date.now() + this.retryDelayMs + jitter;
        emit("Supplier sync failed. Will retry soon.", "error");
      }
    }
    this.processing = false;
    // Notify listeners that sync cycle ended
    emit("Sync finished", "info", "sync", { status: "stop" });
  }

  private async remove(id: string) {
    return new Promise<void>((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          "DELETE FROM sync_queue WHERE id = ?",
          [id],
          () => resolve(),
          (_: any, err: any) => {
            reject(err as Error);
            return false;
          }
        );
      });
    });
  }

  private async markSynced(collections: any[], payments: any[]) {
    return new Promise<void>((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          for (const c of collections) {
            tx.executeSql("UPDATE collections SET synced = 1 WHERE id = ?", [
              c.id,
            ]);
          }
          for (const p of payments) {
            tx.executeSql("UPDATE payments SET synced = 1 WHERE id = ?", [
              p.id,
            ]);
          }
        },
        reject,
        resolve
      );
    });
  }

  async removeByEntityAndPayloadId(entity: string, payloadId: string) {
    // Find queue entries for the given entity where payload.id matches
    const matches: Array<{ id: string }> = await new Promise(
      (resolve, reject) => {
        db.readTransaction((tx: any) => {
          tx.executeSql(
            "SELECT id, payload FROM sync_queue WHERE entity = ?",
            [entity],
            (_: any, { rows }: any) => {
              const out: Array<{ id: string }> = [];
              for (let i = 0; i < rows.length; i++) {
                const r = rows.item(i);
                try {
                  const p = JSON.parse(r.payload);
                  if (p?.id === payloadId) out.push({ id: r.id });
                } catch {}
              }
              resolve(out);
            },
            () => {
              reject(new Error("Failed to read sync queue by entity"));
              return false;
            }
          );
        });
      }
    );
    for (const m of matches) {
      await this.remove(m.id);
    }
    await this.emitQueueCount();
  }

  async retrySingle(entity: string, payload: any) {
    const state = await Network.getNetworkStateAsync();
    if (!state.isConnected) return false;
    const token = await this.getToken();
    if (!token) return false;
    try {
      if (entity === "collection") {
        const res = await this.api.post<{ ok: boolean }>("/sync", {
          collections: [payload],
          payments: [],
        });
        if (res.ok) {
          await this.removeByEntityAndPayloadId("collection", payload.id);
          await this.markSynced([payload], []);
          return true;
        }
      } else if (entity === "payment") {
        const res = await this.api.post<{ ok: boolean }>("/sync", {
          collections: [],
          payments: [payload],
        });
        if (res.ok) {
          await this.removeByEntityAndPayloadId("payment", payload.id);
          await this.markSynced([], [payload]);
          return true;
        }
      } else if (entity === "supplier") {
        const created = await this.api.post<any>("/suppliers", payload);
        await this.removeByEntityAndPayloadId("supplier", payload.id);
        const newId = created?.id ?? payload.id;
        if (newId !== payload.id) {
          await new Promise<void>((resolve, reject) => {
            db.transaction(
              (tx: any) => {
                tx.executeSql("UPDATE suppliers SET id = ? WHERE id = ?", [
                  newId,
                  payload.id,
                ]);
                // Remap foreign keys in related tables
                tx.executeSql(
                  "UPDATE collections SET supplierId = ? WHERE supplierId = ?",
                  [newId, payload.id]
                );
                tx.executeSql(
                  "UPDATE payments SET supplierId = ? WHERE supplierId = ?",
                  [newId, payload.id]
                );
                tx.executeSql(
                  "UPDATE rates SET supplierId = ? WHERE supplierId = ?",
                  [newId, payload.id]
                );
              },
              reject,
              resolve
            );
          });
        }
        return true;
      }
    } catch {}
    return false;
  }

  private async emitQueueCount() {
    return new Promise<void>((resolve) => {
      try {
        db.readTransaction((tx: any) => {
          tx.executeSql(
            "SELECT COUNT(*) as c FROM sync_queue",
            [],
            (_: any, { rows }: any) => {
              const c = Number(rows.item(0)?.c ?? 0);
              emit("Queue updated", "info", "queue", { count: c });
              resolve();
            },
            () => {
              resolve();
              return false;
            }
          );
        });
      } catch {
        resolve();
      }
    });
  }
}
