import type { User, UserId } from "../../domain/models/User";
import type { UserRepository } from "../../domain/repositories/UserRepository";
import { SQLiteClient } from "./SQLiteClient";

function toIntBool(value?: boolean): number {
  return value ? 1 : 0;
}

export class SQLiteUserRepository implements UserRepository {
  private client = SQLiteClient.getInstance();

  async init(): Promise<void> {
    await this.client.init();
  }

  async list(): Promise<User[]> {
    const rows = await this.client.all<User>(
      "SELECT id, name, email, updatedAt, deviceId, deleted FROM users WHERE COALESCE(deleted, 0) = 0 ORDER BY updatedAt DESC"
    );
    return rows.map((r) => ({ ...r, deleted: !!r.deleted }));
  }

  async get(id: UserId): Promise<User | null> {
    const row = await this.client.one<User>(
      "SELECT id, name, email, updatedAt, deviceId, deleted FROM users WHERE id = ?",
      [id]
    );
    return row ? { ...row, deleted: !!row.deleted } : null;
  }

  async create(user: User): Promise<void> {
    await this.client.withTransaction(async (db) => {
      await db.runAsync(
        "INSERT OR REPLACE INTO users (id, name, email, updatedAt, deviceId, deleted) VALUES (?, ?, ?, ?, ?, ?)",
        [
          user.id,
          user.name,
          user.email,
          user.updatedAt,
          user.deviceId,
          toIntBool(user.deleted),
        ]
      );
      await db.runAsync(
        "INSERT INTO sync_operations (op, entity, entityId, payload, timestamp, deviceId, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          "create",
          "user",
          user.id,
          JSON.stringify(user),
          user.updatedAt,
          user.deviceId,
          "pending",
        ]
      );
    });
  }

  async update(user: User): Promise<void> {
    await this.client.withTransaction(async (db) => {
      await db.runAsync(
        "UPDATE users SET name = ?, email = ?, updatedAt = ?, deviceId = ?, deleted = ? WHERE id = ?",
        [
          user.name,
          user.email,
          user.updatedAt,
          user.deviceId,
          toIntBool(user.deleted),
          user.id,
        ]
      );
      await db.runAsync(
        "INSERT INTO sync_operations (op, entity, entityId, payload, timestamp, deviceId, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          "update",
          "user",
          user.id,
          JSON.stringify(user),
          user.updatedAt,
          user.deviceId,
          "pending",
        ]
      );
    });
  }

  async delete(id: UserId): Promise<void> {
    const now = Date.now();
    await this.client.withTransaction(async (db) => {
      await db.runAsync(
        "UPDATE users SET deleted = 1, updatedAt = ? WHERE id = ?",
        [now, id]
      );
      await db.runAsync(
        "INSERT INTO sync_operations (op, entity, entityId, payload, timestamp, deviceId, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          "delete",
          "user",
          id,
          JSON.stringify({ id, updatedAt: now }),
          now,
          "local",
          "pending",
        ]
      );
    });
  }
}
