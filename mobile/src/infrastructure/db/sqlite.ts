import * as SQLite from "expo-sqlite";

export const db = (SQLite as any).openDatabaseSync
  ? (SQLite as any).openDatabaseSync("pkv.db")
  : (SQLite as any).openDatabase("pkv.db");

export function initSchema(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx: any) => {
        // Basic tables
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS suppliers (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          phone TEXT,
          lat REAL,
          lng REAL,
          active INTEGER NOT NULL
        );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          unit TEXT NOT NULL
        );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS rates (
          id TEXT PRIMARY KEY NOT NULL,
          supplierId TEXT NOT NULL,
          productId TEXT NOT NULL,
          pricePerUnit REAL NOT NULL,
          currency TEXT NOT NULL,
          effectiveFrom TEXT NOT NULL,
          effectiveTo TEXT,
          FOREIGN KEY(supplierId) REFERENCES suppliers(id),
          FOREIGN KEY(productId) REFERENCES products(id)
        );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS collections (
          id TEXT PRIMARY KEY NOT NULL,
          supplierId TEXT NOT NULL,
          productId TEXT NOT NULL,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          collectedAt TEXT NOT NULL,
          notes TEXT,
          synced INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY(supplierId) REFERENCES suppliers(id),
          FOREIGN KEY(productId) REFERENCES products(id)
        );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY NOT NULL,
          supplierId TEXT NOT NULL,
          amount REAL NOT NULL,
          currency TEXT NOT NULL,
          type TEXT NOT NULL,
          reference TEXT,
          paidAt TEXT NOT NULL,
          synced INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY(supplierId) REFERENCES suppliers(id)
        );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY NOT NULL,
          entity TEXT NOT NULL,
          payload TEXT NOT NULL,
          createdAt INTEGER NOT NULL
        );`
        );
      },
      reject,
      resolve
    );
  });
}
