import * as SQLite from "expo-sqlite";

export type SQLParams = any;

export class SQLiteClient {
  private static instance: SQLiteClient | null = null;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  static getInstance(): SQLiteClient {
    if (!SQLiteClient.instance) {
      SQLiteClient.instance = new SQLiteClient();
    }
    return SQLiteClient.instance;
  }

  async init(): Promise<void> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync("app.db");
      // Recommended pragmas and schema creation
      await this.db.execAsync("PRAGMA journal_mode = WAL;");
      await this.db.execAsync("PRAGMA foreign_keys = ON;");
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          updatedAt INTEGER NOT NULL,
          deviceId TEXT NOT NULL,
          deleted INTEGER DEFAULT 0
        );
      `);
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_operations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          op TEXT NOT NULL,
          entity TEXT NOT NULL,
          entityId TEXT NOT NULL,
          payload TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          deviceId TEXT NOT NULL,
          status TEXT NOT NULL,
          retries INTEGER DEFAULT 0
        );
      `);
    }
  }

  private ensureDb(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error("SQLite database is not initialized. Call init() first.");
    }
    return this.db;
  }

  async withTransaction(
    task: (db: SQLite.SQLiteDatabase) => Promise<void>
  ): Promise<void> {
    const db = this.ensureDb();
    await db.withTransactionAsync(async () => {
      await task(db);
    });
  }

  async run(sql: string, params: SQLParams = []): Promise<void> {
    const db = this.ensureDb();
    await db.runAsync(sql, params as any);
  }

  async all<T>(sql: string, params: SQLParams = []): Promise<T[]> {
    const db = this.ensureDb();
    const rows = await db.getAllAsync<T>(sql, params as any);
    return rows;
  }

  async one<T>(sql: string, params: SQLParams = []): Promise<T | null> {
    const db = this.ensureDb();
    const row = await db.getFirstAsync<T>(sql, params as any);
    return row ?? null;
  }
}
