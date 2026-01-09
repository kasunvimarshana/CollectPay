/**
 * Local Storage Service using SQLite
 * Provides offline data persistence
 */

import * as SQLite from "expo-sqlite";
import Logger from "../../core/utils/Logger";

export interface PendingSync {
  id?: number;
  entity: string;
  action: "create" | "update" | "delete";
  data: string;
  timestamp: number;
  synced: number;
}

class LocalStorageService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initializationPromise: Promise<void> | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize database
   */
  async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this.isInitialized && this.db) {
      return;
    }

    // If initialization is in progress, wait for it
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Start initialization
    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  /**
   * Perform actual database initialization
   */
  private async performInitialization(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync("app.db");
      await this.createTables();
      this.isInitialized = true;
      Logger.info("Database initialized successfully", undefined, 'DB');
    } catch (error) {
      Logger.error("Database initialization error", error, 'DB');
      this.db = null;
      this.isInitialized = false;
      this.initializationPromise = null;
      throw error;
    }
  }

  /**
   * Ensure database is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized || !this.db) {
      await this.initialize();
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    // Create pending sync queue table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS pending_sync (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity TEXT NOT NULL,
        action TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        synced INTEGER DEFAULT 0
      );
    `);

    // Create local suppliers cache
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY,
        code TEXT,
        name TEXT,
        contact_person TEXT,
        phone TEXT,
        region TEXT,
        is_active INTEGER,
        data TEXT NOT NULL,
        synced_at INTEGER
      );
    `);

    // Create local products cache
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        code TEXT,
        name TEXT,
        base_unit TEXT,
        is_active INTEGER,
        data TEXT NOT NULL,
        synced_at INTEGER
      );
    `);

    // Create local collections cache
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY,
        supplier_id INTEGER,
        product_id INTEGER,
        collection_date TEXT,
        quantity REAL,
        unit TEXT,
        total_amount REAL,
        data TEXT NOT NULL,
        synced_at INTEGER,
        pending_sync INTEGER DEFAULT 0
      );
    `);

    // Create local payments cache
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY,
        supplier_id INTEGER,
        payment_date TEXT,
        amount REAL,
        type TEXT,
        data TEXT NOT NULL,
        synced_at INTEGER,
        pending_sync INTEGER DEFAULT 0
      );
    `);

    // Create local rates cache
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS rates (
        id INTEGER PRIMARY KEY,
        product_id INTEGER,
        rate REAL,
        unit TEXT,
        effective_from TEXT,
        effective_to TEXT,
        is_active INTEGER,
        data TEXT NOT NULL,
        synced_at INTEGER
      );
    `);
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(
    entity: string,
    action: "create" | "update" | "delete",
    data: any
  ): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    await this.db.runAsync(
      "INSERT INTO pending_sync (entity, action, data, timestamp, synced) VALUES (?, ?, ?, ?, ?)",
      [entity, action, JSON.stringify(data), Date.now(), 0]
    );
  }

  /**
   * Get pending sync items
   */
  async getPendingSyncItems(): Promise<PendingSync[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    const result = await this.db.getAllAsync<PendingSync>(
      "SELECT * FROM pending_sync WHERE synced = 0 ORDER BY timestamp ASC"
    );

    return result.map((row) => ({
      ...row,
      data: typeof row.data === "string" ? row.data : JSON.stringify(row.data),
    }));
  }

  /**
   * Mark sync item as synced
   */
  async markSynced(id: number): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    await this.db.runAsync("UPDATE pending_sync SET synced = 1 WHERE id = ?", [
      id,
    ]);
  }

  /**
   * Delete synced items (cleanup)
   */
  async deleteSyncedItems(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    await this.db.runAsync("DELETE FROM pending_sync WHERE synced = 1");
  }

  /**
   * Cache suppliers locally
   */
  async cacheSuppliers(suppliers: any[]): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    for (const supplier of suppliers) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO suppliers 
         (id, code, name, contact_person, phone, region, is_active, data, synced_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          supplier.id,
          supplier.code,
          supplier.name,
          supplier.contact_person,
          supplier.phone,
          supplier.region,
          supplier.is_active ? 1 : 0,
          JSON.stringify(supplier),
          Date.now(),
        ]
      );
    }
  }

  /**
   * Get cached suppliers
   */
  async getCachedSuppliers(): Promise<any[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    const result = await this.db.getAllAsync<any>(
      "SELECT data FROM suppliers WHERE is_active = 1 ORDER BY name"
    );

    return result
      .map((row) => {
        try {
          return typeof row.data === "string" ? JSON.parse(row.data) : row.data;
        } catch (error) {
          console.error("Error parsing supplier data:", error);
          return null;
        }
      })
      .filter((item) => item !== null);
  }

  /**
   * Cache products locally
   */
  async cacheProducts(products: any[]): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    for (const product of products) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO products 
         (id, code, name, base_unit, is_active, data, synced_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id,
          product.code,
          product.name,
          product.base_unit,
          product.is_active ? 1 : 0,
          JSON.stringify(product),
          Date.now(),
        ]
      );
    }
  }

  /**
   * Get cached products
   */
  async getCachedProducts(): Promise<any[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    const result = await this.db.getAllAsync<any>(
      "SELECT data FROM products WHERE is_active = 1 ORDER BY name"
    );

    return result
      .map((row) => {
        try {
          return typeof row.data === "string" ? JSON.parse(row.data) : row.data;
        } catch (error) {
          console.error("Error parsing product data:", error);
          return null;
        }
      })
      .filter((item) => item !== null);
  }

  /**
   * Cache rates locally
   */
  async cacheRates(rates: any[]): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    for (const rate of rates) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO rates 
         (id, product_id, rate, unit, effective_from, effective_to, is_active, data, synced_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rate.id,
          rate.product_id,
          rate.rate,
          rate.unit,
          rate.effective_from,
          rate.effective_to,
          rate.is_active ? 1 : 0,
          JSON.stringify(rate),
          Date.now(),
        ]
      );
    }
  }

  /**
   * Get cached rates
   */
  async getCachedRates(productId?: number): Promise<any[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    // Validate productId if provided
    if (
      productId !== undefined &&
      (!Number.isInteger(productId) || productId < 0)
    ) {
      throw new Error("Invalid productId: must be a positive integer");
    }

    let query = "SELECT data FROM rates WHERE is_active = 1";
    const params: any[] = [];

    if (productId !== undefined) {
      query += " AND product_id = ?";
      params.push(productId);
    }

    query += " ORDER BY effective_from DESC";

    const result = await this.db.getAllAsync<any>(query, params);

    return result
      .map((row) => {
        try {
          return typeof row.data === "string" ? JSON.parse(row.data) : row.data;
        } catch (error) {
          console.error("Error parsing rate data:", error);
          return null;
        }
      })
      .filter((item) => item !== null);
  }

  /**
   * Cache collections locally
   */
  async cacheCollections(collections: any[]): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    for (const collection of collections) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO collections 
         (id, supplier_id, product_id, collection_date, quantity, unit, total_amount, data, synced_at, pending_sync) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          collection.id,
          collection.supplier_id,
          collection.product_id,
          collection.collection_date,
          collection.quantity,
          collection.unit,
          collection.total_amount,
          JSON.stringify(collection),
          Date.now(),
          0,
        ]
      );
    }
  }

  /**
   * Get cached collections
   */
  async getCachedCollections(): Promise<any[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    const result = await this.db.getAllAsync<any>(
      "SELECT data FROM collections WHERE pending_sync = 0 ORDER BY collection_date DESC"
    );

    return result
      .map((row) => {
        try {
          return typeof row.data === "string" ? JSON.parse(row.data) : row.data;
        } catch (error) {
          console.error("Error parsing collection data:", error);
          return null;
        }
      })
      .filter((item) => item !== null);
  }

  /**
   * Cache payments locally
   */
  async cachePayments(payments: any[]): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    for (const payment of payments) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO payments 
         (id, supplier_id, payment_date, amount, type, data, synced_at, pending_sync) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payment.id,
          payment.supplier_id,
          payment.payment_date,
          payment.amount,
          payment.type,
          JSON.stringify(payment),
          Date.now(),
          0,
        ]
      );
    }
  }

  /**
   * Get cached payments
   */
  async getCachedPayments(): Promise<any[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    const result = await this.db.getAllAsync<any>(
      "SELECT data FROM payments WHERE pending_sync = 0 ORDER BY payment_date DESC"
    );

    return result
      .map((row) => {
        try {
          return typeof row.data === "string" ? JSON.parse(row.data) : row.data;
        } catch (error) {
          console.error("Error parsing payment data:", error);
          return null;
        }
      })
      .filter((item) => item !== null);
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database initialization failed");

    await this.db.execAsync(`
      DELETE FROM suppliers;
      DELETE FROM products;
      DELETE FROM rates;
      DELETE FROM collections;
      DELETE FROM payments;
    `);
  }
}

export default new LocalStorageService();
