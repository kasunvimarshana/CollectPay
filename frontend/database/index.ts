import * as SQLite from 'expo-sqlite';

const DB_NAME = 'paytrack.db';
const DB_VERSION = 1;

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the SQLite database
 */
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;

  db = await SQLite.openDatabaseAsync(DB_NAME);

  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create tables
  await createTables();

  return db;
};

/**
 * Get database instance
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

/**
 * Create all database tables
 */
const createTables = async () => {
  if (!db) return;

  await db.execAsync(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'collector',
      is_active INTEGER DEFAULT 1,
      token TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    -- Suppliers table
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      registration_number TEXT,
      metadata TEXT,
      is_active INTEGER DEFAULT 1,
      version INTEGER DEFAULT 1,
      is_synced INTEGER DEFAULT 0,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TEXT,
      updated_at TEXT,
      deleted_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_suppliers_uuid ON suppliers(uuid);
    CREATE INDEX IF NOT EXISTS idx_suppliers_is_synced ON suppliers(is_synced);
    CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      code TEXT UNIQUE,
      description TEXT,
      unit TEXT DEFAULT 'kg',
      category TEXT,
      is_active INTEGER DEFAULT 1,
      version INTEGER DEFAULT 1,
      is_synced INTEGER DEFAULT 0,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TEXT,
      updated_at TEXT,
      deleted_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_products_uuid ON products(uuid);
    CREATE INDEX IF NOT EXISTS idx_products_is_synced ON products(is_synced);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

    -- Rates table
    CREATE TABLE IF NOT EXISTS rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      supplier_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      rate REAL NOT NULL,
      effective_from TEXT NOT NULL,
      effective_to TEXT,
      is_active INTEGER DEFAULT 1,
      notes TEXT,
      version INTEGER DEFAULT 1,
      is_synced INTEGER DEFAULT 0,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TEXT,
      updated_at TEXT,
      deleted_at TEXT,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE INDEX IF NOT EXISTS idx_rates_uuid ON rates(uuid);
    CREATE INDEX IF NOT EXISTS idx_rates_is_synced ON rates(is_synced);
    CREATE INDEX IF NOT EXISTS idx_rates_supplier_product ON rates(supplier_id, product_id);
    CREATE INDEX IF NOT EXISTS idx_rates_effective ON rates(effective_from, effective_to);

    -- Collections table
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      supplier_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      rate_id INTEGER,
      collection_date TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      rate_applied REAL NOT NULL,
      total_amount REAL NOT NULL,
      notes TEXT,
      is_synced INTEGER DEFAULT 0,
      synced_at TEXT,
      collected_by INTEGER,
      version INTEGER DEFAULT 1,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TEXT,
      updated_at TEXT,
      deleted_at TEXT,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (rate_id) REFERENCES rates(id)
    );

    CREATE INDEX IF NOT EXISTS idx_collections_uuid ON collections(uuid);
    CREATE INDEX IF NOT EXISTS idx_collections_is_synced ON collections(is_synced);
    CREATE INDEX IF NOT EXISTS idx_collections_supplier ON collections(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_collections_date ON collections(collection_date);

    -- Payments table
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      supplier_id INTEGER NOT NULL,
      payment_date TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_type TEXT DEFAULT 'partial',
      payment_method TEXT,
      reference_number TEXT,
      notes TEXT,
      allocation TEXT,
      is_synced INTEGER DEFAULT 0,
      synced_at TEXT,
      processed_by INTEGER,
      version INTEGER DEFAULT 1,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TEXT,
      updated_at TEXT,
      deleted_at TEXT,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    CREATE INDEX IF NOT EXISTS idx_payments_uuid ON payments(uuid);
    CREATE INDEX IF NOT EXISTS idx_payments_is_synced ON payments(is_synced);
    CREATE INDEX IF NOT EXISTS idx_payments_supplier ON payments(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

    -- Sync queue table
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_uuid TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      retry_count INTEGER DEFAULT 0,
      error_message TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_uuid);

    -- App settings table
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT
    );
  `);
};

/**
 * Clear all data (for logout/reset)
 */
export const clearDatabase = async () => {
  const db = getDatabase();
  
  await db.execAsync(`
    DELETE FROM collections;
    DELETE FROM payments;
    DELETE FROM rates;
    DELETE FROM products;
    DELETE FROM suppliers;
    DELETE FROM sync_queue;
    DELETE FROM users;
    DELETE FROM app_settings;
  `);
};

/**
 * Drop all tables (for complete reset)
 */
export const dropTables = async () => {
  const db = getDatabase();
  
  await db.execAsync(`
    DROP TABLE IF EXISTS collections;
    DROP TABLE IF EXISTS payments;
    DROP TABLE IF EXISTS rates;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS suppliers;
    DROP TABLE IF EXISTS sync_queue;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS app_settings;
  `);
};

export default {
  initDatabase,
  getDatabase,
  clearDatabase,
  dropTables,
};
