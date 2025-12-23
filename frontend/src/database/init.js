import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'transactrack.db';

export const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER,
      client_uuid TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      location TEXT,
      metadata TEXT,
      is_active INTEGER DEFAULT 1,
      is_synced INTEGER DEFAULT 0,
      synced_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER,
      code TEXT UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      unit_type TEXT,
      primary_unit TEXT,
      allowed_units TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER,
      product_id INTEGER NOT NULL,
      rate REAL NOT NULL,
      unit TEXT NOT NULL,
      effective_from TEXT NOT NULL,
      effective_to TEXT,
      is_current INTEGER DEFAULT 1,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER,
      client_uuid TEXT UNIQUE NOT NULL,
      collection_number TEXT,
      supplier_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      quantity_in_base_unit REAL,
      rate_id INTEGER NOT NULL,
      rate_applied REAL NOT NULL,
      amount REAL NOT NULL,
      collected_at TEXT NOT NULL,
      notes TEXT,
      metadata TEXT,
      is_synced INTEGER DEFAULT 0,
      synced_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (rate_id) REFERENCES product_rates(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER,
      client_uuid TEXT UNIQUE NOT NULL,
      payment_number TEXT,
      supplier_id INTEGER NOT NULL,
      payment_type TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      reference_number TEXT,
      notes TEXT,
      is_synced INTEGER DEFAULT 0,
      synced_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      client_uuid TEXT UNIQUE NOT NULL,
      operation TEXT NOT NULL,
      data TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      retry_count INTEGER DEFAULT 0,
      error_message TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS auth_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL,
      user_data TEXT NOT NULL,
      device_name TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_suppliers_synced ON suppliers(is_synced);
    CREATE INDEX IF NOT EXISTS idx_collections_synced ON collections(is_synced);
    CREATE INDEX IF NOT EXISTS idx_payments_synced ON payments(is_synced);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
    CREATE INDEX IF NOT EXISTS idx_product_rates_current ON product_rates(is_current);
  `);

  console.log('Database initialized successfully');
  return db;
};

export const getDatabase = async () => {
  return await SQLite.openDatabaseAsync(DATABASE_NAME);
};
