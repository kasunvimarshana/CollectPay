import * as SQLite from 'expo-sqlite';

const DB_NAME = 'fieldsyncledger.db';

export class Database {
  private static instance: SQLite.SQLiteDatabase | null = null;

  static async getInstance(): Promise<SQLite.SQLiteDatabase> {
    if (!this.instance) {
      this.instance = await SQLite.openDatabaseAsync(DB_NAME);
      await this.initializeTables();
    }
    return this.instance;
  }

  private static async initializeTables(): Promise<void> {
    const db = this.instance!;

    // Users table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        permissions TEXT,
        version INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );
    `);

    // Suppliers table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT,
        notes TEXT,
        user_id TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        sync_status TEXT DEFAULT 'synced',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
      CREATE INDEX IF NOT EXISTS idx_suppliers_sync ON suppliers(sync_status);
    `);

    // Products table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        unit TEXT NOT NULL,
        description TEXT,
        user_id TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        sync_status TEXT DEFAULT 'synced',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
      CREATE INDEX IF NOT EXISTS idx_products_sync ON products(sync_status);
    `);

    // Rate versions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS rate_versions (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        rate REAL NOT NULL,
        effective_from TEXT NOT NULL,
        effective_to TEXT,
        user_id TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        sync_status TEXT DEFAULT 'synced',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
      CREATE INDEX IF NOT EXISTS idx_rate_versions_product ON rate_versions(product_id);
      CREATE INDEX IF NOT EXISTS idx_rate_versions_dates ON rate_versions(effective_from, effective_to);
      CREATE INDEX IF NOT EXISTS idx_rate_versions_sync ON rate_versions(sync_status);
    `);

    // Collections table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        supplier_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity REAL NOT NULL,
        rate_version_id TEXT NOT NULL,
        applied_rate REAL NOT NULL,
        collection_date TEXT NOT NULL,
        notes TEXT,
        user_id TEXT NOT NULL,
        idempotency_key TEXT UNIQUE NOT NULL,
        version INTEGER DEFAULT 1,
        sync_status TEXT DEFAULT 'pending',
        sync_error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (rate_version_id) REFERENCES rate_versions(id)
      );
      CREATE INDEX IF NOT EXISTS idx_collections_supplier ON collections(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_collections_product ON collections(product_id);
      CREATE INDEX IF NOT EXISTS idx_collections_date ON collections(collection_date);
      CREATE INDEX IF NOT EXISTS idx_collections_sync ON collections(sync_status);
      CREATE INDEX IF NOT EXISTS idx_collections_idempotency ON collections(idempotency_key);
    `);

    // Payments table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        supplier_id TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        payment_date TEXT NOT NULL,
        notes TEXT,
        reference_number TEXT,
        user_id TEXT NOT NULL,
        idempotency_key TEXT UNIQUE NOT NULL,
        version INTEGER DEFAULT 1,
        sync_status TEXT DEFAULT 'pending',
        sync_error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );
      CREATE INDEX IF NOT EXISTS idx_payments_supplier ON payments(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
      CREATE INDEX IF NOT EXISTS idx_payments_sync ON payments(sync_status);
      CREATE INDEX IF NOT EXISTS idx_payments_idempotency ON payments(idempotency_key);
    `);

    // Sync queue table for tracking pending sync operations
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
    `);
  }

  static async clearAllData(): Promise<void> {
    const db = await this.getInstance();
    await db.execAsync(`
      DELETE FROM payments;
      DELETE FROM collections;
      DELETE FROM rate_versions;
      DELETE FROM products;
      DELETE FROM suppliers;
      DELETE FROM sync_queue;
    `);
  }

  static async close(): Promise<void> {
    if (this.instance) {
      await this.instance.closeAsync();
      this.instance = null;
    }
  }
}
