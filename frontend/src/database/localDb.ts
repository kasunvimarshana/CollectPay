import * as SQLite from 'expo-sqlite';
import { Transaction, Payment, Supplier } from '../types';

class LocalDatabase {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    this.db = await SQLite.openDatabaseAsync('fieldledger.db');
    await this.createTables();
  }

  private async createTables() {
    if (!this.db) return;

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT,
        contact_person TEXT,
        status TEXT DEFAULT 'active',
        notes TEXT,
        metadata TEXT,
        created_by INTEGER,
        created_at TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        base_unit TEXT NOT NULL,
        alternate_units TEXT,
        status TEXT DEFAULT 'active',
        metadata TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        supplier_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        rate REAL NOT NULL,
        amount REAL NOT NULL,
        transaction_date TEXT NOT NULL,
        notes TEXT,
        metadata TEXT,
        created_by INTEGER NOT NULL,
        device_id INTEGER,
        synced_at TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        supplier_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_type TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        reference_number TEXT,
        payment_date TEXT NOT NULL,
        notes TEXT,
        metadata TEXT,
        created_by INTEGER NOT NULL,
        device_id INTEGER,
        synced_at TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_uuid TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_supplier ON transactions(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_synced ON transactions(synced);
      CREATE INDEX IF NOT EXISTS idx_payments_supplier ON payments(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_payments_synced ON payments(synced);
    `);
  }

  // Transaction operations
  async saveTransaction(transaction: Transaction): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(
      `INSERT OR REPLACE INTO transactions 
       (uuid, supplier_id, product_id, quantity, unit, rate, amount, 
        transaction_date, notes, metadata, created_by, device_id, 
        synced_at, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.uuid,
        transaction.supplier_id,
        transaction.product_id,
        transaction.quantity,
        transaction.unit,
        transaction.rate,
        transaction.amount,
        transaction.transaction_date,
        transaction.notes || null,
        JSON.stringify(transaction.metadata || {}),
        transaction.created_by,
        transaction.device_id || null,
        transaction.synced_at || null,
        transaction.created_at || new Date().toISOString(),
        new Date().toISOString(),
        transaction.synced_at ? 1 : 0,
      ]
    );
  }

  async getUnsyncedTransactions(): Promise<Transaction[]> {
    if (!this.db) return [];

    const result = await this.db.getAllAsync(
      'SELECT * FROM transactions WHERE synced = 0'
    );

    return result.map((row: any) => ({
      ...row,
      metadata: JSON.parse(row.metadata || '{}'),
      synced_at: row.synced_at || undefined,
    }));
  }

  async markTransactionSynced(uuid: string): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(
      'UPDATE transactions SET synced = 1, synced_at = ? WHERE uuid = ?',
      [new Date().toISOString(), uuid]
    );
  }

  // Payment operations
  async savePayment(payment: Payment): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(
      `INSERT OR REPLACE INTO payments 
       (uuid, supplier_id, amount, payment_type, payment_method, 
        reference_number, payment_date, notes, metadata, created_by, 
        device_id, synced_at, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment.uuid,
        payment.supplier_id,
        payment.amount,
        payment.payment_type,
        payment.payment_method,
        payment.reference_number || null,
        payment.payment_date,
        payment.notes || null,
        JSON.stringify(payment.metadata || {}),
        payment.created_by,
        payment.device_id || null,
        payment.synced_at || null,
        payment.created_at || new Date().toISOString(),
        new Date().toISOString(),
        payment.synced_at ? 1 : 0,
      ]
    );
  }

  async getUnsyncedPayments(): Promise<Payment[]> {
    if (!this.db) return [];

    const result = await this.db.getAllAsync(
      'SELECT * FROM payments WHERE synced = 0'
    );

    return result.map((row: any) => ({
      ...row,
      metadata: JSON.parse(row.metadata || '{}'),
      synced_at: row.synced_at || undefined,
    }));
  }

  async markPaymentSynced(uuid: string): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(
      'UPDATE payments SET synced = 1, synced_at = ? WHERE uuid = ?',
      [new Date().toISOString(), uuid]
    );
  }

  // Supplier operations
  async saveSupplier(supplier: Supplier): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(
      `INSERT OR REPLACE INTO suppliers 
       (id, code, name, address, phone, email, contact_person, status, 
        notes, metadata, created_by, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplier.id,
        supplier.code,
        supplier.name,
        supplier.address || null,
        supplier.phone || null,
        supplier.email || null,
        supplier.contact_person || null,
        supplier.status,
        supplier.notes || null,
        JSON.stringify(supplier.metadata || {}),
        supplier.created_by,
        supplier.created_at,
        supplier.updated_at,
        1,
      ]
    );
  }

  async getSuppliers(): Promise<Supplier[]> {
    if (!this.db) return [];

    const result = await this.db.getAllAsync('SELECT * FROM suppliers');

    return result.map((row: any) => ({
      ...row,
      metadata: JSON.parse(row.metadata || '{}'),
    }));
  }

  async getSupplier(id: number): Promise<Supplier | null> {
    if (!this.db) return null;

    const result = await this.db.getFirstAsync(
      'SELECT * FROM suppliers WHERE id = ?',
      [id]
    );

    if (!result) return null;

    return {
      ...(result as any),
      metadata: JSON.parse((result as any).metadata || '{}'),
    };
  }
}

export const localDb = new LocalDatabase();
export default localDb;
