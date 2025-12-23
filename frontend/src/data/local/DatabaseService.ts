import * as SQLite from 'expo-sqlite';

export class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async init(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('collectpay.db');
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        permissions TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT
      );

      -- Suppliers table
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT,
        credit_limit REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        metadata TEXT,
        is_active INTEGER DEFAULT 1,
        version INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        last_sync_at TEXT
      );

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        unit TEXT NOT NULL,
        category TEXT,
        metadata TEXT,
        is_active INTEGER DEFAULT 1,
        version INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        last_sync_at TEXT
      );

      -- Rates table
      CREATE TABLE IF NOT EXISTS rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        supplier_id INTEGER,
        rate REAL NOT NULL,
        effective_from TEXT NOT NULL,
        effective_to TEXT,
        is_active INTEGER DEFAULT 1,
        notes TEXT,
        version INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        last_sync_at TEXT,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );

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
        amount REAL NOT NULL,
        notes TEXT,
        collector_id INTEGER,
        sync_status TEXT DEFAULT 'pending',
        version INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        last_sync_at TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (rate_id) REFERENCES rates(id)
      );

      -- Payments table
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        reference_number TEXT UNIQUE NOT NULL,
        supplier_id INTEGER NOT NULL,
        payment_date TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_type TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        transaction_reference TEXT,
        notes TEXT,
        balance_before REAL DEFAULT 0,
        balance_after REAL DEFAULT 0,
        processed_by INTEGER,
        sync_status TEXT DEFAULT 'pending',
        version INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        last_sync_at TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );

      -- Sync queue table
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        entity_uuid TEXT,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
      CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
      CREATE INDEX IF NOT EXISTS idx_rates_product ON rates(product_id, effective_from);
      CREATE INDEX IF NOT EXISTS idx_collections_supplier ON collections(supplier_id, collection_date);
      CREATE INDEX IF NOT EXISTS idx_collections_sync ON collections(sync_status);
      CREATE INDEX IF NOT EXISTS idx_payments_supplier ON payments(supplier_id, payment_date);
      CREATE INDEX IF NOT EXISTS idx_payments_sync ON payments(sync_status);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
    `);
  }

  public async execute(sql: string, params: any[] = []): Promise<SQLite.SQLiteRunResult> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.runAsync(sql, params);
  }

  public async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync(sql, params);
  }

  public async queryFirst(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getFirstAsync(sql, params);
  }

  public async transaction(callback: () => Promise<void>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.withTransactionAsync(callback);
  }

  public async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}
