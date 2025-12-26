// Database initialization and management
import * as SQLite from 'expo-sqlite';

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = await SQLite.openDatabaseAsync('syncledger.db');
    await this.createTables();
  }

  async createTables() {
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        status TEXT DEFAULT 'active',
        metadata TEXT,
        version INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        unit TEXT DEFAULT 'kg',
        category TEXT,
        is_active INTEGER DEFAULT 1,
        metadata TEXT,
        version INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        product_id INTEGER NOT NULL,
        supplier_id INTEGER,
        rate REAL NOT NULL,
        effective_from TEXT NOT NULL,
        effective_to TEXT,
        is_active INTEGER DEFAULT 1,
        applied_scope TEXT DEFAULT 'general',
        notes TEXT,
        version INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );

      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        uuid TEXT UNIQUE NOT NULL,
        supplier_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        rate_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        rate_applied REAL NOT NULL,
        total_amount REAL NOT NULL,
        collection_date TEXT NOT NULL,
        collection_time TEXT,
        notes TEXT,
        version INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (rate_id) REFERENCES rates(id)
      );

      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER,
        uuid TEXT UNIQUE NOT NULL,
        supplier_id INTEGER NOT NULL,
        payment_type TEXT DEFAULT 'full',
        amount REAL NOT NULL,
        payment_date TEXT NOT NULL,
        payment_time TEXT,
        payment_method TEXT,
        reference_number TEXT,
        outstanding_before REAL DEFAULT 0,
        outstanding_after REAL DEFAULT 0,
        notes TEXT,
        calculation_details TEXT,
        version INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS sync_metadata (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
      CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
      CREATE INDEX IF NOT EXISTS idx_rates_product ON rates(product_id, effective_from);
      CREATE INDEX IF NOT EXISTS idx_collections_supplier ON collections(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_collections_date ON collections(collection_date);
      CREATE INDEX IF NOT EXISTS idx_payments_supplier ON payments(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
    `);
  }

  async execute(query, params = []) {
    return await this.db.runAsync(query, params);
  }

  async query(query, params = []) {
    return await this.db.getAllAsync(query, params);
  }

  async queryFirst(query, params = []) {
    return await this.db.getFirstAsync(query, params);
  }

  async transaction(callback) {
    try {
      await this.db.execAsync('BEGIN TRANSACTION');
      await callback(this);
      await this.db.execAsync('COMMIT');
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
  }
}

export default new Database();
