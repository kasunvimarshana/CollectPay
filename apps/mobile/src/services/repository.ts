import type { NewUser, UpdateUser, UserRecord } from "@/domain/User";
import { exec, writeTxn } from "./db";

function serialize(obj: any) {
  return JSON.stringify(obj ?? null);
}
function deserialize<T>(txt: string | null): T | undefined {
  return txt ? (JSON.parse(txt) as T) : undefined;
}

export const userRepo = {
  async list(): Promise<UserRecord[]> {
    const rows = await exec<any>(
      `SELECT * FROM users WHERE deleted_at IS NULL ORDER BY updated_at DESC`
    );
    return rows.map((r) => ({
      ...r,
      attributes: deserialize(r.attributes),
    })) as UserRecord[];
  },
  async get(id: string): Promise<UserRecord | undefined> {
    const rows = await exec<any>(`SELECT * FROM users WHERE id = ?`, [id]);
    if (!rows[0]) return undefined;
    const r = rows[0];
    return { ...r, attributes: deserialize(r.attributes) } as UserRecord;
  },
  async upsert(local: UserRecord) {
    await writeTxn(async (tx) => {
      tx.executeSql(
        `INSERT INTO users (id, name, email, role, attributes, version, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name, email=excluded.email, role=excluded.role,
           attributes=excluded.attributes, version=excluded.version,
           updated_at=excluded.updated_at, deleted_at=excluded.deleted_at`,
        [
          local.id,
          local.name,
          local.email,
          local.role,
          serialize(local.attributes),
          local.version,
          local.updated_at ?? null,
          local.deleted_at ?? null,
        ]
      );
    });
  },
  async createLocal(payload: NewUser & { id: string; version?: number }) {
    const now = new Date().toISOString();
    await writeTxn(async (tx) => {
      tx.executeSql(
        `INSERT INTO users (id, name, email, role, attributes, version, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
        [
          payload.id,
          payload.name,
          payload.email,
          payload.role,
          serialize(payload.attributes),
          payload.version ?? 0,
          now,
        ]
      );
      tx.executeSql(
        `INSERT INTO outbox (op, table_name, record_id, payload) VALUES (?, 'users', ?, ?)`,
        ["create", payload.id, serialize(payload)]
      );
    });
  },
  async updateLocal(payload: UpdateUser) {
    const now = new Date().toISOString();
    const existing = await this.get(payload.id);
    if (!existing) throw new Error("User not found");
    const merged: UserRecord = {
      ...existing,
      ...payload,
      version: existing.version + 1,
      updated_at: now,
    };
    await writeTxn(async (tx) => {
      tx.executeSql(
        `UPDATE users SET name=?, email=?, role=?, attributes=?, version=?, updated_at=? WHERE id=?`,
        [
          merged.name,
          merged.email,
          merged.role,
          serialize(merged.attributes),
          merged.version,
          merged.updated_at,
          merged.id,
        ]
      );
      tx.executeSql(
        `INSERT INTO outbox (op, table_name, record_id, payload) VALUES (?, 'users', ?, ?)`,
        ["update", merged.id, serialize(payload)]
      );
    });
  },
  async deleteLocal(id: string) {
    const now = new Date().toISOString();
    await writeTxn(async (tx) => {
      tx.executeSql(`UPDATE users SET deleted_at=?, updated_at=? WHERE id=?`, [
        now,
        now,
        id,
      ]);
      tx.executeSql(
        `INSERT INTO outbox (op, table_name, record_id) VALUES ('delete', 'users', ?)`,
        [id]
      );
    });
  },
  async applyRemote(remote: UserRecord) {
    await this.upsert(remote);
  },
};

export const outbox = {
  async nextBatch(limit = 20) {
    return exec<any>(`SELECT * FROM outbox ORDER BY id ASC LIMIT ?`, [limit]);
  },
  async listAll() {
    return exec<any>(`SELECT * FROM outbox ORDER BY id ASC`);
  },
  async markProcessed(id: number) {
    await writeTxn(async (tx) =>
      tx.executeSql(`DELETE FROM outbox WHERE id=?`, [id])
    );
  },
  async bumpAttempts(id: number) {
    await writeTxn(async (tx) =>
      tx.executeSql(`UPDATE outbox SET attempts = attempts + 1 WHERE id=?`, [
        id,
      ])
    );
  },
  async clearAll() {
    await writeTxn(async (tx) => tx.executeSql(`DELETE FROM outbox`));
  },
};

export const syncState = {
  async getToken() {
    const rows = await exec<any>(
      `SELECT value FROM sync_state WHERE key='token'`
    );
    return rows[0]?.value as string | undefined;
  },
  async setToken(token: string) {
    await writeTxn(async (tx) => {
      tx.executeSql(
        `INSERT INTO sync_state (key, value) VALUES ('token', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
        [token]
      );
    });
  },
};
