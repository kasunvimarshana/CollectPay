/**
 * Local Storage Service using SQLite
 * Provides offline data persistence
 */

import * as SQLite from 'expo-sqlite';

export interface PendingSync {
  id?: number;
  entity: string;
  action: 'create' | 'update' | 'delete';
  data: string;
  timestamp: number;
  synced: number;
}

class LocalStorageService {
  private db: SQLite.SQLiteDatabase | null = null;

  /**
   * Initialize database
   */
  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('ledger.db');
      await this.createTables();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

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
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(entity: string, action: 'create' | 'update' | 'delete', data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'INSERT INTO pending_sync (entity, action, data, timestamp, synced) VALUES (?, ?, ?, ?, ?)',
      [entity, action, JSON.stringify(data), Date.now(), 0]
    );
  }

  /**
   * Get pending sync items
   */
  async getPendingSyncItems(): Promise<PendingSync[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<PendingSync>(
      'SELECT * FROM pending_sync WHERE synced = 0 ORDER BY timestamp ASC'
    );

    return result.map(row => ({
      ...row,
      data: typeof row.data === 'string' ? row.data : JSON.stringify(row.data)
    }));
  }

  /**
   * Mark sync item as synced
   */
  async markSynced(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE pending_sync SET synced = 1 WHERE id = ?',
      [id]
    );
  }

  /**
   * Delete synced items (cleanup)
   */
  async deleteSyncedItems(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM pending_sync WHERE synced = 1');
  }

  /**
   * Cache suppliers locally
   */
  async cacheSuppliers(suppliers: any[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

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
          Date.now()
        ]
      );
    }
  }

  /**
   * Get cached suppliers
   */
  async getCachedSuppliers(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>(
      'SELECT data FROM suppliers WHERE is_active = 1 ORDER BY name'
    );

    return result.map(row => {
      try {
        return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      } catch (error) {
        console.error('Error parsing supplier data:', error);
        return null;
      }
    }).filter(item => item !== null);
  }

  /**
   * Cache products locally
   */
  async cacheProducts(products: any[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

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
          Date.now()
        ]
      );
    }
  }

  /**
   * Get cached products
   */
  async getCachedProducts(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>(
      'SELECT data FROM products WHERE is_active = 1 ORDER BY name'
    );

    return result.map(row => {
      try {
        return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      } catch (error) {
        console.error('Error parsing product data:', error);
        return null;
      }
    }).filter(item => item !== null);
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      DELETE FROM suppliers;
      DELETE FROM products;
      DELETE FROM collections;
      DELETE FROM payments;
    `);
  }
}

export default new LocalStorageService();
