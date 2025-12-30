/**
 * Local Database Manager
 * Manages SQLite database for offline support
 */

import * as SQLite from 'expo-sqlite';

export class LocalDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly DB_NAME = 'ledgerflow.db';

  /**
   * Initialize database connection
   */
  async init(): Promise<void> {
    if (this.db) {
      return;
    }

    this.db = await SQLite.openDatabaseAsync(this.DB_NAME);
    await this.createTables();
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.execAsync(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        last_synced_at TEXT
      );

      -- Suppliers table
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT,
        address TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        last_synced_at TEXT
      );

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        unit TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        last_synced_at TEXT
      );

      -- Product rates table
      CREATE TABLE IF NOT EXISTS product_rates (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        rate REAL NOT NULL,
        effective_from TEXT NOT NULL,
        effective_to TEXT,
        created_at TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        last_synced_at TEXT,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      -- Collections table
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        supplier_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity REAL NOT NULL,
        rate REAL NOT NULL,
        total_amount REAL NOT NULL,
        collection_date TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        last_synced_at TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      -- Payments table
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        supplier_id TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_type TEXT NOT NULL,
        payment_date TEXT NOT NULL,
        reference_number TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        last_synced_at TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );

      -- Sync queue table for tracking pending operations
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        last_attempt_at TEXT,
        error_message TEXT
      );

      -- Audit log table
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        old_values TEXT,
        new_values TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT NOT NULL
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
      CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
      CREATE INDEX IF NOT EXISTS idx_product_rates_product_id ON product_rates(product_id);
      CREATE INDEX IF NOT EXISTS idx_collections_supplier_id ON collections(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_collections_product_id ON collections(product_id);
      CREATE INDEX IF NOT EXISTS idx_payments_supplier_id ON payments(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_sync_status ON users(sync_status);
    `);
  }

  /**
   * Execute a SQL query
   */
  async execute(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return await this.db.runAsync(sql, params);
  }

  /**
   * Execute a SQL query and return all rows
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return await this.db.getAllAsync<T>(sql, params);
  }

  /**
   * Execute a SQL query and return first row
   */
  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return await this.db.getFirstAsync<T>(sql, params);
  }

  /**
   * Begin transaction
   */
  async beginTransaction(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.execAsync('BEGIN TRANSACTION;');
  }

  /**
   * Commit transaction
   */
  async commit(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.execAsync('COMMIT;');
  }

  /**
   * Rollback transaction
   */
  async rollback(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.execAsync('ROLLBACK;');
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }

  /**
   * Clear all data (for testing or reset)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.execAsync(`
      DELETE FROM audit_logs;
      DELETE FROM sync_queue;
      DELETE FROM payments;
      DELETE FROM collections;
      DELETE FROM product_rates;
      DELETE FROM products;
      DELETE FROM suppliers;
      DELETE FROM users;
    `);
  }
}

// Singleton instance
let localDatabaseInstance: LocalDatabase | null = null;

/**
 * Get local database instance
 */
export function getLocalDatabase(): LocalDatabase {
  if (!localDatabaseInstance) {
    localDatabaseInstance = new LocalDatabase();
  }
  return localDatabaseInstance;
}
