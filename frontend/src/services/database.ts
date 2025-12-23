import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

// Types for database operations
export interface DatabaseChangeLog {
  id?: number;
  entity_type: 'suppliers' | 'products' | 'rates' | 'payments';
  entity_id?: string;
  operation: 'create' | 'update' | 'delete';
  data: string; // JSON stringified data
  timestamp: string;
  synced: 0 | 1;
  client_id: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly dbName = 'synccollect.db';

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(this.dbName);
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create suppliers table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        status TEXT DEFAULT 'active',
        created_by INTEGER,
        updated_by INTEGER,
        version INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT,
        synced INTEGER DEFAULT 0
      );
    `);

    // Create products table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        supplier_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        sku TEXT,
        units TEXT,
        default_unit TEXT,
        status TEXT DEFAULT 'active',
        created_by INTEGER,
        updated_by INTEGER,
        version INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );
    `);

    // Create product_rates table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS product_rates (
        id INTEGER PRIMARY KEY,
        product_id INTEGER NOT NULL,
        rate REAL NOT NULL,
        unit TEXT NOT NULL,
        effective_from TEXT NOT NULL,
        effective_to TEXT,
        is_active INTEGER DEFAULT 1,
        created_by INTEGER,
        updated_by INTEGER,
        version INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);

    // Create payments table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY,
        supplier_id INTEGER NOT NULL,
        product_id INTEGER,
        amount REAL NOT NULL,
        payment_type TEXT NOT NULL,
        payment_method TEXT,
        reference_number TEXT,
        notes TEXT,
        payment_date TEXT NOT NULL,
        created_by INTEGER,
        updated_by INTEGER,
        version INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);

    // Create sync queue table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        client_id TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        last_error TEXT
      );
    `);

    // Create sync log table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sync_type TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        status TEXT NOT NULL,
        items_synced INTEGER DEFAULT 0,
        errors TEXT
      );
    `);

    console.log('Database tables created successfully');
  }

  // Supplier operations
  async getSuppliers(includeDeleted = false): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = includeDeleted 
      ? 'SELECT * FROM suppliers ORDER BY created_at DESC'
      : 'SELECT * FROM suppliers WHERE deleted_at IS NULL ORDER BY created_at DESC';
    
    const result = await this.db.getAllAsync(query);
    return result.map(row => this.parseRow(row));
  }

  async getSupplier(id: number): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getFirstAsync(
      'SELECT * FROM suppliers WHERE id = ?',
      [id]
    );
    
    return result ? this.parseRow(result) : null;
  }

  async saveSupplier(supplier: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    const isNew = !supplier.id;
    
    if (isNew) {
      // Insert new supplier
      const result = await this.db.runAsync(
        `INSERT INTO suppliers (name, contact_person, phone, email, address, status, 
         created_by, version, created_at, updated_at, synced) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          supplier.name,
          supplier.contact_person || null,
          supplier.phone || null,
          supplier.email || null,
          supplier.address || null,
          supplier.status || 'active',
          supplier.created_by || 1,
          1,
          now,
          now,
          0
        ]
      );
      
      supplier.id = result.lastInsertRowId;
      
      // Add to sync queue
      await this.addToSyncQueue('suppliers', String(supplier.id), 'create', supplier);
    } else {
      // Update existing supplier
      await this.db.runAsync(
        `UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ?, 
         address = ?, status = ?, updated_by = ?, version = version + 1, 
         updated_at = ?, synced = ? WHERE id = ?`,
        [
          supplier.name,
          supplier.contact_person || null,
          supplier.phone || null,
          supplier.email || null,
          supplier.address || null,
          supplier.status || 'active',
          supplier.updated_by || 1,
          now,
          0,
          supplier.id
        ]
      );
      
      // Add to sync queue
      await this.addToSyncQueue('suppliers', String(supplier.id), 'update', supplier);
    }
  }

  async deleteSupplier(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    await this.db.runAsync(
      'UPDATE suppliers SET deleted_at = ?, synced = ? WHERE id = ?',
      [now, 0, id]
    );
    
    // Add to sync queue
    await this.addToSyncQueue('suppliers', String(id), 'delete', { id });
  }

  // Product operations
  async getProducts(supplierId?: number): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM products WHERE deleted_at IS NULL';
    const params: any[] = [];
    
    if (supplierId) {
      query += ' AND supplier_id = ?';
      params.push(supplierId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await this.db.getAllAsync(query, params);
    return result.map(row => this.parseRow(row));
  }

  async getProduct(id: number): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getFirstAsync(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    return result ? this.parseRow(result) : null;
  }

  async saveProduct(product: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    const isNew = !product.id;
    const unitsJson = product.units ? JSON.stringify(product.units) : null;
    
    if (isNew) {
      const result = await this.db.runAsync(
        `INSERT INTO products (supplier_id, name, description, sku, units, default_unit, 
         status, created_by, version, created_at, updated_at, synced) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.supplier_id,
          product.name,
          product.description || null,
          product.sku || null,
          unitsJson,
          product.default_unit || null,
          product.status || 'active',
          product.created_by || 1,
          1,
          now,
          now,
          0
        ]
      );
      
      product.id = result.lastInsertRowId;
      await this.addToSyncQueue('products', String(product.id), 'create', product);
    } else {
      await this.db.runAsync(
        `UPDATE products SET supplier_id = ?, name = ?, description = ?, sku = ?, 
         units = ?, default_unit = ?, status = ?, updated_by = ?, 
         version = version + 1, updated_at = ?, synced = ? WHERE id = ?`,
        [
          product.supplier_id,
          product.name,
          product.description || null,
          product.sku || null,
          unitsJson,
          product.default_unit || null,
          product.status || 'active',
          product.updated_by || 1,
          now,
          0,
          product.id
        ]
      );
      
      await this.addToSyncQueue('products', String(product.id), 'update', product);
    }
  }

  async deleteProduct(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    await this.db.runAsync(
      'UPDATE products SET deleted_at = ?, synced = ? WHERE id = ?',
      [now, 0, id]
    );
    
    await this.addToSyncQueue('products', String(id), 'delete', { id });
  }

  // Payment operations
  async getPayments(supplierId?: number, productId?: number): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM payments WHERE deleted_at IS NULL';
    const params: any[] = [];
    
    if (supplierId) {
      query += ' AND supplier_id = ?';
      params.push(supplierId);
    }
    
    if (productId) {
      query += ' AND product_id = ?';
      params.push(productId);
    }
    
    query += ' ORDER BY payment_date DESC';
    
    const result = await this.db.getAllAsync(query, params);
    return result.map(row => this.parseRow(row));
  }

  async savePayment(payment: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    const isNew = !payment.id;
    
    if (isNew) {
      const result = await this.db.runAsync(
        `INSERT INTO payments (supplier_id, product_id, amount, payment_type, 
         payment_method, reference_number, notes, payment_date, created_by, 
         version, created_at, updated_at, synced) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payment.supplier_id,
          payment.product_id || null,
          payment.amount,
          payment.payment_type,
          payment.payment_method || null,
          payment.reference_number || null,
          payment.notes || null,
          payment.payment_date,
          payment.created_by || 1,
          1,
          now,
          now,
          0
        ]
      );
      
      payment.id = result.lastInsertRowId;
      await this.addToSyncQueue('payments', String(payment.id), 'create', payment);
    } else {
      await this.db.runAsync(
        `UPDATE payments SET supplier_id = ?, product_id = ?, amount = ?, 
         payment_type = ?, payment_method = ?, reference_number = ?, notes = ?, 
         payment_date = ?, updated_by = ?, version = version + 1, 
         updated_at = ?, synced = ? WHERE id = ?`,
        [
          payment.supplier_id,
          payment.product_id || null,
          payment.amount,
          payment.payment_type,
          payment.payment_method || null,
          payment.reference_number || null,
          payment.notes || null,
          payment.payment_date,
          payment.updated_by || 1,
          now,
          0,
          payment.id
        ]
      );
      
      await this.addToSyncQueue('payments', String(payment.id), 'update', payment);
    }
  }

  async deletePayment(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    await this.db.runAsync(
      'UPDATE payments SET deleted_at = ?, synced = ? WHERE id = ?',
      [now, 0, id]
    );
    
    await this.addToSyncQueue('payments', String(id), 'delete', { id });
  }

  // Sync queue operations
  async addToSyncQueue(
    entityType: string,
    entityId: string,
    operation: string,
    data: any
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const clientId = await this.generateClientId();
    const timestamp = new Date().toISOString();
    
    await this.db.runAsync(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, data, timestamp, client_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [entityType, entityId, operation, JSON.stringify(data), timestamp, clientId]
    );
  }

  async getPendingSyncItems(): Promise<DatabaseChangeLog[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      'SELECT * FROM sync_queue WHERE synced = 0 ORDER BY timestamp ASC'
    );
    
    return result.map(row => ({
      id: row.id as number,
      entity_type: row.entity_type as any,
      entity_id: row.entity_id as string,
      operation: row.operation as any,
      data: row.data as string,
      timestamp: row.timestamp as string,
      synced: row.synced as 0 | 1,
      client_id: row.client_id as string,
    }));
  }

  async markAsSynced(ids: number[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const placeholders = ids.map(() => '?').join(',');
    await this.db.runAsync(
      `UPDATE sync_queue SET synced = 1 WHERE id IN (${placeholders})`,
      ids
    );
  }

  async clearSyncedItems(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Keep synced items for 7 days for debugging
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    
    await this.db.runAsync(
      'DELETE FROM sync_queue WHERE synced = 1 AND timestamp < ?',
      [cutoffDate.toISOString()]
    );
  }

  // Utility methods
  private parseRow(row: any): any {
    const parsed = { ...row };
    
    // Parse JSON fields
    if (parsed.units && typeof parsed.units === 'string') {
      try {
        parsed.units = JSON.parse(parsed.units);
      } catch (e) {
        parsed.units = null;
      }
    }
    
    // Convert integer booleans to actual booleans
    if ('is_active' in parsed) {
      parsed.is_active = Boolean(parsed.is_active);
    }
    if ('synced' in parsed) {
      parsed.synced = Boolean(parsed.synced);
    }
    
    return parsed;
  }

  private async generateClientId(): Promise<string> {
    // Use expo-crypto for cryptographically secure random ID
    const timestamp = Date.now().toString();
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const randomHex = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const combined = timestamp + randomHex;
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combined
    );
    return digest.substring(0, 32);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export default new DatabaseService();
