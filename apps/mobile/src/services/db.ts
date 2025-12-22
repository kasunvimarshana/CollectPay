import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabase("kv.db");

export function initDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL,
            attributes TEXT,
            version INTEGER DEFAULT 0,
            updated_at TEXT,
            deleted_at TEXT
          )`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS outbox (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            op TEXT NOT NULL,
            table_name TEXT NOT NULL,
            record_id TEXT,
            payload TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            attempts INTEGER DEFAULT 0
          )`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS sync_state (
            key TEXT PRIMARY KEY,
            value TEXT
          )`
        );
      },
      (err) => reject(err),
      () => resolve()
    );
  });
}

export function exec<T = unknown>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.readTransaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, res) => {
          const rows = [] as T[];
          for (let i = 0; i < res.rows.length; i++) rows.push(res.rows.item(i));
          resolve(rows);
        },
        (_, err) => {
          reject(err);
          return true;
        }
      );
    });
  });
}

export function writeTxn<T>(
  fn: (tx: SQLite.SQLTransaction) => Promise<T> | void
): Promise<T | void> {
  return new Promise((resolve, reject) => {
    db.transaction(
      async (tx) => {
        try {
          const result = await fn(tx);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      },
      (err) => reject(err)
    );
  });
}
