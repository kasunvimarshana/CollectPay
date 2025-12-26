import * as SQLite from "expo-sqlite";
import { BaseEntity, SyncStatus } from "../domain/entities";
import { v4 as uuidv4 } from "uuid";

const DB_NAME = "fieldsync.db";

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.db = await SQLite.openDatabaseAsync(DB_NAME);
    await this.createTables();
    this.initialized = true;
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'collector',
        status TEXT NOT NULL DEFAULT 'active',
        metadata TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        version INTEGER NOT NULL DEFAULT 1,
        last_synced_at TEXT,
        client_id TEXT UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      -- Suppliers table
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        phone TEXT,
        address TEXT,
        region TEXT,
        bank_name TEXT,
        bank_account TEXT,
        bank_branch TEXT,
        payment_method TEXT NOT NULL DEFAULT 'cash',
        credit_limit REAL NOT NULL DEFAULT 0,
        current_balance REAL NOT NULL DEFAULT 0,
        opening_balance REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        collector_id TEXT,
        owner_id TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        version INTEGER NOT NULL DEFAULT 1,
        last_synced_at TEXT,
        client_id TEXT UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        FOREIGN KEY (collector_id) REFERENCES users(id)
      );

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        category TEXT,
        description TEXT,
        base_unit TEXT NOT NULL,
        unit_conversions TEXT NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'active',
        sync_status TEXT NOT NULL DEFAULT 'pending',
        version INTEGER NOT NULL DEFAULT 1,
        last_synced_at TEXT,
        client_id TEXT UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      -- Product rates table
      CREATE TABLE IF NOT EXISTS product_rates (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        rate REAL NOT NULL,
        effective_from TEXT NOT NULL,
        effective_to TEXT,
        is_current INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        version INTEGER NOT NULL DEFAULT 1,
        last_synced_at TEXT,
        client_id TEXT UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      -- Collections table
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        supplier_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        collector_id TEXT NOT NULL,
        collected_at TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        quantity_in_base_unit REAL NOT NULL,
        rate_at_collection REAL NOT NULL,
        gross_amount REAL NOT NULL,
        deductions REAL NOT NULL DEFAULT 0,
        net_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        version INTEGER NOT NULL DEFAULT 1,
        last_synced_at TEXT,
        client_id TEXT UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (collector_id) REFERENCES users(id)
      );

      -- Payments table
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        supplier_id TEXT NOT NULL,
        payment_type TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        amount REAL NOT NULL,
        settlement_period_start TEXT,
        settlement_period_end TEXT,
        total_collection_amount REAL,
        total_deductions REAL,
        previous_balance REAL,
        advances REAL,
        calculated_amount REAL,
        reference_number TEXT UNIQUE,
        paid_at TEXT,
        approved_by TEXT,
        approved_at TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        version INTEGER NOT NULL DEFAULT 1,
        last_synced_at TEXT,
        client_id TEXT UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
      );

      -- Sync state table
      CREATE TABLE IF NOT EXISTS sync_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        last_sync_timestamp TEXT,
        device_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Sync queue table
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        data TEXT NOT NULL,
        version INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        client_id TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_suppliers_region ON suppliers(region);
      CREATE INDEX IF NOT EXISTS idx_suppliers_collector ON suppliers(collector_id);
      CREATE INDEX IF NOT EXISTS idx_suppliers_sync ON suppliers(sync_status);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_sync ON products(sync_status);
      CREATE INDEX IF NOT EXISTS idx_product_rates_product ON product_rates(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_rates_current ON product_rates(is_current);
      CREATE INDEX IF NOT EXISTS idx_collections_supplier ON collections(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_collections_collector ON collections(collector_id);
      CREATE INDEX IF NOT EXISTS idx_collections_date ON collections(collected_at);
      CREATE INDEX IF NOT EXISTS idx_collections_sync ON collections(sync_status);
      CREATE INDEX IF NOT EXISTS idx_payments_supplier ON payments(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_payments_sync ON payments(sync_status);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
    `);
  }

  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) throw new Error("Database not initialized");
    return this.db;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.initialized = false;
    }
  }
}

export const databaseService = new DatabaseService();

// Base repository for SQLite
export abstract class SQLiteRepository<T extends BaseEntity> {
  protected abstract tableName: string;
  protected abstract mapToEntity(row: Record<string, unknown>): T;
  protected abstract mapToRow(entity: Partial<T>): Record<string, unknown>;

  protected get db(): SQLite.SQLiteDatabase {
    return databaseService.getDatabase();
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.db.getFirstAsync<Record<string, unknown>>(
      `SELECT * FROM ${this.tableName} WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return result ? this.mapToEntity(result) : null;
  }

  async findAll(options?: {
    where?: Record<string, unknown>;
    orderBy?: { field: string; direction: "asc" | "desc" }[];
    limit?: number;
    offset?: number;
  }): Promise<T[]> {
    let query = `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL`;
    const params: unknown[] = [];

    if (options?.where) {
      for (const [key, value] of Object.entries(options.where)) {
        query += ` AND ${this.toSnakeCase(key)} = ?`;
        params.push(value);
      }
    }

    if (options?.orderBy?.length) {
      const orderClauses = options.orderBy.map(
        (o) => `${this.toSnakeCase(o.field)} ${o.direction.toUpperCase()}`
      );
      query += ` ORDER BY ${orderClauses.join(", ")}`;
    }

    if (options?.limit) {
      query += ` LIMIT ?`;
      params.push(options.limit);
    }

    if (options?.offset) {
      query += ` OFFSET ?`;
      params.push(options.offset);
    }

    const results = await this.db.getAllAsync<Record<string, unknown>>(
      query,
      params
    );
    return results.map((row) => this.mapToEntity(row));
  }

  async save(entity: Partial<T>): Promise<T> {
    const now = new Date().toISOString();
    const id = entity.id || uuidv4();
    const clientId = entity.clientId || uuidv4();

    const data: Partial<T> = {
      ...entity,
      id,
      clientId,
      syncStatus: "pending" as SyncStatus,
      version: 1,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    } as Partial<T>;

    const row = this.mapToRow(data);
    const columns = Object.keys(row);
    const placeholders = columns.map(() => "?").join(", ");
    const values = Object.values(row);

    await this.db.runAsync(
      `INSERT INTO ${this.tableName} (${columns.join(
        ", "
      )}) VALUES (${placeholders})`,
      values
    );

    // Add to sync queue
    await this.addToSyncQueue(id, "create", data);

    return this.findById(id) as Promise<T>;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`${this.tableName} not found: ${id}`);

    const now = new Date().toISOString();
    const updateData: Partial<T> = {
      ...data,
      updatedAt: new Date(now),
      syncStatus: "pending" as SyncStatus,
      version: (existing.version || 0) + 1,
    } as Partial<T>;

    const row = this.mapToRow(updateData);
    const setClauses = Object.keys(row)
      .map((k) => `${k} = ?`)
      .join(", ");
    const values = [...Object.values(row), id];

    await this.db.runAsync(
      `UPDATE ${this.tableName} SET ${setClauses} WHERE id = ?`,
      values
    );

    // Add to sync queue
    await this.addToSyncQueue(id, "update", updateData);

    return this.findById(id) as Promise<T>;
  }

  async softDelete(id: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.runAsync(
      `UPDATE ${this.tableName} SET deleted_at = ?, sync_status = 'pending', updated_at = ? WHERE id = ?`,
      [now, now, id]
    );

    // Add to sync queue
    await this.addToSyncQueue(id, "delete", { id });
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
  }

  async findPendingSync(): Promise<T[]> {
    const results = await this.db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM ${this.tableName} WHERE sync_status = 'pending'`
    );
    return results.map((row) => this.mapToEntity(row));
  }

  async findByClientId(clientId: string): Promise<T | null> {
    const result = await this.db.getFirstAsync<Record<string, unknown>>(
      `SELECT * FROM ${this.tableName} WHERE client_id = ?`,
      [clientId]
    );
    return result ? this.mapToEntity(result) : null;
  }

  async markAsSynced(id: string, version: number): Promise<void> {
    const now = new Date().toISOString();
    await this.db.runAsync(
      `UPDATE ${this.tableName} SET sync_status = 'synced', version = ?, last_synced_at = ? WHERE id = ?`,
      [version, now, id]
    );
  }

  async markAsDirty(id: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE ${this.tableName} SET sync_status = 'pending' WHERE id = ?`,
      [id]
    );
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE deleted_at IS NULL`;
    const params: unknown[] = [];

    if (filter) {
      for (const [key, value] of Object.entries(filter)) {
        query += ` AND ${this.toSnakeCase(key)} = ?`;
        params.push(value);
      }
    }

    const result = await this.db.getFirstAsync<{ count: number }>(
      query,
      params
    );
    return result?.count ?? 0;
  }

  protected async addToSyncQueue(
    entityId: string,
    action: "create" | "update" | "delete",
    data: unknown
  ): Promise<void> {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO sync_queue (id, entity_type, entity_id, action, data, version, timestamp, client_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        this.tableName,
        entityId,
        action,
        JSON.stringify(data),
        1,
        now,
        uuidv4(),
        now,
      ]
    );
  }

  protected toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  protected toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}
