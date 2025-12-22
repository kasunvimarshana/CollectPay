import * as SQLite from "expo-sqlite";
import { Collection, Payment, Supplier, SyncQueueItem } from "@/types";

/**
 * Offline-first database layer using SQLite
 * Handles local data persistence and sync queue management
 */
class Database {
  private db: SQLite.WebSQLDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = SQLite.openDatabase("paymate.db");

    await this.executeQuery(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        contact_number TEXT NOT NULL,
        address TEXT,
        latitude REAL,
        longitude REAL,
        is_active INTEGER DEFAULT 1,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      )
    `);

    await this.executeQuery(`
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        supplier_id TEXT NOT NULL,
        collected_by TEXT NOT NULL,
        product_type TEXT NOT NULL,
        quantity_value REAL NOT NULL,
        quantity_unit TEXT NOT NULL,
        rate_per_unit INTEGER NOT NULL,
        rate_currency TEXT DEFAULT 'USD',
        total_amount INTEGER NOT NULL,
        total_currency TEXT DEFAULT 'USD',
        notes TEXT,
        status TEXT DEFAULT 'pending',
        collection_date TEXT NOT NULL,
        sync_id TEXT UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      )
    `);

    await this.executeQuery(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        supplier_id TEXT NOT NULL,
        paid_by TEXT NOT NULL,
        amount INTEGER NOT NULL,
        currency TEXT DEFAULT 'USD',
        type TEXT NOT NULL,
        method TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        reference_number TEXT,
        notes TEXT,
        payment_date TEXT NOT NULL,
        sync_id TEXT UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      )
    `);

    await this.executeQuery(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TEXT NOT NULL
      )
    `);

    await this.executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_collections_supplier 
      ON collections(supplier_id, collection_date DESC)
    `);

    await this.executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_payments_supplier 
      ON payments(supplier_id, payment_date DESC)
    `);

    await this.executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_sync_queue_status 
      ON sync_queue(status, created_at)
    `);
  }

  private executeQuery(
    sql: string,
    params: any[] = []
  ): Promise<SQLite.SQLResultSet> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Supplier operations
  async saveSupplier(supplier: Supplier): Promise<void> {
    await this.executeQuery(
      `INSERT OR REPLACE INTO suppliers 
       (id, name, contact_number, address, latitude, longitude, is_active, 
        created_by, created_at, updated_at, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplier.id,
        supplier.name,
        supplier.contactNumber,
        supplier.address,
        supplier.location?.latitude,
        supplier.location?.longitude,
        supplier.isActive ? 1 : 0,
        supplier.createdBy,
        supplier.createdAt,
        supplier.updatedAt,
        1, // Mark as synced when saving from server
      ]
    );
  }

  async getSupplier(id: string): Promise<Supplier | null> {
    const result = await this.executeQuery(
      "SELECT * FROM suppliers WHERE id = ?",
      [id]
    );

    if (result.rows.length === 0) return null;

    return this.mapToSupplier(result.rows.item(0));
  }

  async getAllSuppliers(activeOnly: boolean = false): Promise<Supplier[]> {
    const sql = activeOnly
      ? "SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name"
      : "SELECT * FROM suppliers ORDER BY name";

    const result = await this.executeQuery(sql);
    const suppliers: Supplier[] = [];

    for (let i = 0; i < result.rows.length; i++) {
      suppliers.push(this.mapToSupplier(result.rows.item(i)));
    }

    return suppliers;
  }

  // Collection operations
  async saveCollection(collection: Collection): Promise<void> {
    await this.executeQuery(
      `INSERT OR REPLACE INTO collections 
       (id, supplier_id, collected_by, product_type, quantity_value, quantity_unit,
        rate_per_unit, rate_currency, total_amount, total_currency, notes, status,
        collection_date, sync_id, created_at, updated_at, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        collection.id,
        collection.supplierId,
        collection.collectedBy,
        collection.productType,
        collection.quantity.value,
        collection.quantity.unit,
        collection.ratePerUnit.amount,
        collection.ratePerUnit.currency,
        collection.totalAmount.amount,
        collection.totalAmount.currency,
        collection.notes,
        collection.status,
        collection.collectionDate,
        collection.syncId,
        collection.createdAt,
        collection.updatedAt,
        collection.syncId ? 1 : 0,
      ]
    );
  }

  async getCollection(id: string): Promise<Collection | null> {
    const result = await this.executeQuery(
      "SELECT * FROM collections WHERE id = ?",
      [id]
    );

    if (result.rows.length === 0) return null;

    return this.mapToCollection(result.rows.item(0));
  }

  async getCollectionsBySupplier(supplierId: string): Promise<Collection[]> {
    const result = await this.executeQuery(
      "SELECT * FROM collections WHERE supplier_id = ? ORDER BY collection_date DESC",
      [supplierId]
    );

    const collections: Collection[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      collections.push(this.mapToCollection(result.rows.item(i)));
    }

    return collections;
  }

  async getUnsyncedCollections(): Promise<Collection[]> {
    const result = await this.executeQuery(
      "SELECT * FROM collections WHERE synced = 0 ORDER BY created_at"
    );

    const collections: Collection[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      collections.push(this.mapToCollection(result.rows.item(i)));
    }

    return collections;
  }

  // Payment operations
  async savePayment(payment: Payment): Promise<void> {
    await this.executeQuery(
      `INSERT OR REPLACE INTO payments 
       (id, supplier_id, paid_by, amount, currency, type, method, status,
        reference_number, notes, payment_date, sync_id, created_at, updated_at, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment.id,
        payment.supplierId,
        payment.paidBy,
        payment.amount.amount,
        payment.amount.currency,
        payment.type,
        payment.method,
        payment.status,
        payment.referenceNumber,
        payment.notes,
        payment.paymentDate,
        payment.syncId,
        payment.createdAt,
        payment.updatedAt,
        payment.syncId ? 1 : 0,
      ]
    );
  }

  async getPayment(id: string): Promise<Payment | null> {
    const result = await this.executeQuery(
      "SELECT * FROM payments WHERE id = ?",
      [id]
    );

    if (result.rows.length === 0) return null;

    return this.mapToPayment(result.rows.item(0));
  }

  async getPaymentsBySupplier(supplierId: string): Promise<Payment[]> {
    const result = await this.executeQuery(
      "SELECT * FROM payments WHERE supplier_id = ? ORDER BY payment_date DESC",
      [supplierId]
    );

    const payments: Payment[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      payments.push(this.mapToPayment(result.rows.item(i)));
    }

    return payments;
  }

  async getUnsyncedPayments(): Promise<Payment[]> {
    const result = await this.executeQuery(
      "SELECT * FROM payments WHERE synced = 0 ORDER BY created_at"
    );

    const payments: Payment[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      payments.push(this.mapToPayment(result.rows.item(i)));
    }

    return payments;
  }

  // Sync queue operations
  async addToSyncQueue(
    item: Omit<SyncQueueItem, "id" | "createdAt">
  ): Promise<void> {
    const id = this.generateUUID();
    const createdAt = new Date().toISOString();

    await this.executeQuery(
      `INSERT INTO sync_queue 
       (id, entity_type, entity_id, operation, payload, status, retry_count, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        item.entityType,
        item.entityId,
        item.operation,
        JSON.stringify(item.payload),
        item.status,
        item.retryCount,
        createdAt,
      ]
    );
  }

  async getPendingSyncItems(limit: number = 100): Promise<SyncQueueItem[]> {
    const result = await this.executeQuery(
      `SELECT * FROM sync_queue 
       WHERE status IN ('pending', 'failed') 
       ORDER BY created_at 
       LIMIT ?`,
      [limit]
    );

    const items: SyncQueueItem[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      items.push(this.mapToSyncQueueItem(result.rows.item(i)));
    }

    return items;
  }

  async updateSyncQueueItemStatus(
    id: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    await this.executeQuery(
      "UPDATE sync_queue SET status = ?, error_message = ? WHERE id = ?",
      [status, errorMessage, id]
    );
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    await this.executeQuery("DELETE FROM sync_queue WHERE id = ?", [id]);
  }

  // Helper methods
  private mapToSupplier(row: any): Supplier {
    return {
      id: row.id,
      name: row.name,
      contactNumber: row.contact_number,
      address: row.address,
      location:
        row.latitude && row.longitude
          ? { latitude: row.latitude, longitude: row.longitude }
          : undefined,
      isActive: row.is_active === 1,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapToCollection(row: any): Collection {
    return {
      id: row.id,
      supplierId: row.supplier_id,
      collectedBy: row.collected_by,
      productType: row.product_type,
      quantity: {
        value: row.quantity_value,
        unit: row.quantity_unit,
      },
      ratePerUnit: {
        amount: row.rate_per_unit,
        currency: row.rate_currency,
        formatted: this.formatMoney(row.rate_per_unit, row.rate_currency),
      },
      totalAmount: {
        amount: row.total_amount,
        currency: row.total_currency,
        formatted: this.formatMoney(row.total_amount, row.total_currency),
      },
      notes: row.notes,
      status: row.status,
      collectionDate: row.collection_date,
      syncId: row.sync_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapToPayment(row: any): Payment {
    return {
      id: row.id,
      supplierId: row.supplier_id,
      paidBy: row.paid_by,
      amount: {
        amount: row.amount,
        currency: row.currency,
        formatted: this.formatMoney(row.amount, row.currency),
      },
      type: row.type,
      method: row.method,
      status: row.status,
      referenceNumber: row.reference_number,
      notes: row.notes,
      paymentDate: row.payment_date,
      syncId: row.sync_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapToSyncQueueItem(row: any): SyncQueueItem {
    return {
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      operation: row.operation,
      payload: JSON.parse(row.payload),
      status: row.status,
      retryCount: row.retry_count,
      errorMessage: row.error_message,
      createdAt: row.created_at,
    };
  }

  private formatMoney(cents: number, currency: string): string {
    return `${currency} ${(cents / 100).toFixed(2)}`;
  }

  private generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async clearAllData(): Promise<void> {
    await this.executeQuery("DELETE FROM suppliers");
    await this.executeQuery("DELETE FROM collections");
    await this.executeQuery("DELETE FROM payments");
    await this.executeQuery("DELETE FROM sync_queue");
  }

  /**
   * Get all collections (not filtered by supplier)
   */
  async getAllCollections(): Promise<Collection[]> {
    const results = await this.query<any>(
      "SELECT * FROM collections ORDER BY created_at DESC"
    );
    return results.map(this.mapToCollection);
  }

  /**
   * Get all payments (not filtered by supplier)
   */
  async getAllPayments(): Promise<Payment[]> {
    const results = await this.query<any>(
      "SELECT * FROM payments ORDER BY created_at DESC"
    );
    return results.map(this.mapToPayment);
  }

  /**
   * Remove a sync queue item after successful sync
   */
  async removeSyncQueueItem(id: number): Promise<void> {
    await this.executeQuery("DELETE FROM sync_queue WHERE id = ?", [id]);
  }
}

export const database = new Database();
