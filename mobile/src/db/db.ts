import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync("kv.db");
      await db.execAsync("PRAGMA journal_mode = WAL;");
      await migrate(db);
      return db;
    })();
  }
  return dbPromise;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      external_code TEXT,
      is_active INTEGER NOT NULL,
      version INTEGER NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      unit_type TEXT NOT NULL,
      is_active INTEGER NOT NULL,
      version INTEGER NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      unit_type TEXT NOT NULL,
      to_base_multiplier REAL NOT NULL,
      version INTEGER NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS collection_entries (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      unit_id TEXT NOT NULL,
      quantity REAL NOT NULL,
      quantity_in_base REAL NOT NULL,
      collected_at TEXT NOT NULL,
      entered_by_user_id INTEGER,
      notes TEXT,
      version INTEGER NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rates (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      rate_per_base REAL NOT NULL,
      effective_from TEXT NOT NULL,
      effective_to TEXT,
      set_by_user_id INTEGER,
      version INTEGER NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_at TEXT NOT NULL,
      entered_by_user_id INTEGER,
      notes TEXT,
      version INTEGER NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS outbox (
      op_id TEXT PRIMARY KEY,
      entity TEXT NOT NULL,
      type TEXT NOT NULL,
      id TEXT NOT NULL,
      base_version INTEGER,
      payload_json TEXT NOT NULL,
      client_updated_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conflicts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      op_id TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      op_type TEXT,
      base_version INTEGER,
      client_updated_at TEXT,
      reason TEXT NOT NULL,
      server_json TEXT,
      client_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_outbox_created_at ON outbox(created_at);
    CREATE INDEX IF NOT EXISTS idx_collection_supplier ON collection_entries(supplier_id, collected_at);
    CREATE INDEX IF NOT EXISTS idx_payment_supplier ON payments(supplier_id, paid_at);
  `);

  // Backfill/upgrade existing installs (SQLite doesn't support IF NOT EXISTS on ADD COLUMN).
  try {
    await db.execAsync("ALTER TABLE conflicts ADD COLUMN op_type TEXT");
  } catch {}
  try {
    await db.execAsync("ALTER TABLE conflicts ADD COLUMN base_version INTEGER");
  } catch {}
  try {
    await db.execAsync(
      "ALTER TABLE conflicts ADD COLUMN client_updated_at TEXT"
    );
  } catch {}
}

export async function getMeta(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM meta WHERE key = ?",
    [key]
  );
  return row?.value ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO meta(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, value]
  );
}
