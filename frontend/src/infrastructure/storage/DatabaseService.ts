import * as SQLite from 'expo-sqlite';

/**
 * Database service for managing local SQLite database
 * Implements offline-first storage for collections, payments, and related entities
 */
class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly DB_NAME = 'trackvault.db';
  private readonly DB_VERSION = 1;

  /**
   * Initialize database connection and create tables
   */
  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(this.DB_NAME);
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create all necessary tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Suppliers table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY,
        server_id INTEGER UNIQUE,
        name TEXT NOT NULL,
        code TEXT,
        contact_person TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        country TEXT,
        postal_code TEXT,
        status TEXT DEFAULT 'active',
        metadata TEXT,
        version INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT
      );
    `);

    // Products table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        server_id INTEGER UNIQUE,
        name TEXT NOT NULL,
        code TEXT,
        description TEXT,
        unit TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        metadata TEXT,
        version INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT
      );
    `);

    // Product rates table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS product_rates (
        id INTEGER PRIMARY KEY,
        server_id INTEGER UNIQUE,
        product_id INTEGER NOT NULL,
        product_server_id INTEGER,
        rate_per_unit REAL NOT NULL,
        effective_from TEXT NOT NULL,
        effective_to TEXT,
        version INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    // Collections table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY,
        server_id INTEGER UNIQUE,
        supplier_id INTEGER NOT NULL,
        supplier_server_id INTEGER,
        product_id INTEGER NOT NULL,
        product_server_id INTEGER,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        collection_date TEXT NOT NULL,
        rate_per_unit REAL,
        total_amount REAL,
        notes TEXT,
        collected_by INTEGER,
        metadata TEXT,
        version INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      );
    `);

    // Payments table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY,
        server_id INTEGER UNIQUE,
        supplier_id INTEGER NOT NULL,
        supplier_server_id INTEGER,
        amount REAL NOT NULL,
        payment_date TEXT NOT NULL,
        payment_type TEXT NOT NULL,
        payment_method TEXT,
        reference_number TEXT,
        notes TEXT,
        paid_by INTEGER,
        metadata TEXT,
        version INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
      );
    `);

    // Sync queue table for pending operations
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL,
        synced_at TEXT
      );
    `);

    // Create indexes for better performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_collections_date ON collections(collection_date);
      CREATE INDEX IF NOT EXISTS idx_collections_supplier ON collections(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
      CREATE INDEX IF NOT EXISTS idx_payments_supplier ON payments(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(synced_at);
    `);
  }

  /**
   * Get database instance
   */
  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
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
  async clearAll(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.execAsync(`
      DELETE FROM sync_queue;
      DELETE FROM payments;
      DELETE FROM collections;
      DELETE FROM product_rates;
      DELETE FROM products;
      DELETE FROM suppliers;
    `);
  }
}

export default new DatabaseService();
