import { DatabaseService } from '../local/DatabaseService';
import { SecureStorageService } from '../local/SecureStorageService';
import { ApiService } from '../remote/ApiService';
import { NetworkService } from '../remote/NetworkService';
import { SyncItem, SyncResult } from '../../domain/entities';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'conflict';

export class SyncService {
  private static instance: SyncService;
  private db: DatabaseService;
  private secureStorage: SecureStorageService;
  private api: ApiService;
  private network: NetworkService;
  private isSyncing: boolean = false;
  private lastSyncAt: string | null = null;
  private listeners: Set<(status: SyncStatus, message?: string) => void> = new Set();

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.secureStorage = SecureStorageService.getInstance();
    this.api = ApiService.getInstance();
    this.network = NetworkService.getInstance();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  public async init(): Promise<void> {
    // Load last sync timestamp
    const lastSync = await this.secureStorage.getItem('last_sync_at');
    if (lastSync) {
      this.lastSyncAt = lastSync;
    }

    // Setup network listener for automatic sync
    this.network.addListener(async (status) => {
      if (status === 'online' && !this.isSyncing) {
        // Network regained, trigger sync
        await this.sync();
      }
    });
  }

  public addListener(callback: (status: SyncStatus, message?: string) => void): void {
    this.listeners.add(callback);
  }

  public removeListener(callback: (status: SyncStatus, message?: string) => void): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(status: SyncStatus, message?: string): void {
    this.listeners.forEach((callback) => {
      try {
        callback(status, message);
      } catch (error) {
        console.error('Sync listener error:', error);
      }
    });
  }

  public async sync(force: boolean = false): Promise<SyncResult | null> {
    // Prevent concurrent syncs
    if (this.isSyncing && !force) {
      console.log('Sync already in progress');
      return null;
    }

    // Check network connectivity
    const isOnline = await this.network.isOnline();
    if (!isOnline) {
      this.notifyListeners('error', 'No internet connection');
      return null;
    }

    this.isSyncing = true;
    this.notifyListeners('syncing', 'Synchronizing data...');

    try {
      const deviceId = await this.secureStorage.getDeviceId() || await this.secureStorage.setDeviceId();
      
      // Phase 1: Push local changes
      const pendingChanges = await this.getPendingChanges();
      let pushResults: SyncResult | null = null;

      if (pendingChanges.length > 0) {
        pushResults = await this.pushChanges(deviceId, pendingChanges);
        await this.processPushResults(pushResults);
      }

      // Phase 2: Pull server changes
      const entityTypes = ['suppliers', 'products', 'rates', 'collections', 'payments'];
      const pullResults = await this.pullChanges(deviceId, entityTypes);
      await this.applyServerChanges(pullResults);

      // Update last sync timestamp
      this.lastSyncAt = new Date().toISOString();
      await this.secureStorage.setItem('last_sync_at', this.lastSyncAt);

      this.notifyListeners('success', 'Sync completed successfully');
      
      return pushResults;
    } catch (error: any) {
      console.error('Sync failed:', error);
      this.notifyListeners('error', error.message || 'Sync failed');
      return null;
    } finally {
      this.isSyncing = false;
    }
  }

  private async getPendingChanges(): Promise<SyncItem[]> {
    const syncQueue = await this.db.query(
      'SELECT * FROM sync_queue WHERE status = ? ORDER BY created_at ASC LIMIT 100',
      ['pending']
    );

    return syncQueue.map((item: any) => ({
      entity_type: item.entity_type,
      operation: item.operation,
      data: JSON.parse(item.payload),
      timestamp: item.created_at,
    }));
  }

  private async pushChanges(deviceId: string, changes: SyncItem[]): Promise<SyncResult> {
    try {
      const response = await this.api.syncPush(deviceId, changes);
      return response.results;
    } catch (error: any) {
      console.error('Push failed:', error);
      throw new Error('Failed to push changes to server');
    }
  }

  private async processPushResults(results: SyncResult): Promise<void> {
    await this.db.transaction(async () => {
      // Process successful syncs
      for (const item of results.success) {
        if (item.entity) {
          await this.updateLocalEntity(item.entity);
        }
      }

      // Process conflicts
      for (const conflict of results.conflicts) {
        this.notifyListeners('conflict', `Conflict detected: ${conflict.message}`);
        // Implement conflict resolution strategy (server wins by default)
        if (conflict.server_data) {
          await this.updateLocalEntity(conflict.server_data);
        }
      }

      // Process errors
      for (const error of results.errors) {
        console.error('Sync error:', error);
      }
    });
  }

  private async pullChanges(deviceId: string, entityTypes: string[]): Promise<any> {
    try {
      const response = await this.api.syncPull(deviceId, this.lastSyncAt, entityTypes);
      return response.changes;
    } catch (error: any) {
      console.error('Pull failed:', error);
      throw new Error('Failed to pull changes from server');
    }
  }

  private async applyServerChanges(changes: any): Promise<void> {
    await this.db.transaction(async () => {
      // Apply suppliers
      if (changes.suppliers) {
        for (const supplier of changes.suppliers) {
          await this.upsertSupplier(supplier);
        }
      }

      // Apply products
      if (changes.products) {
        for (const product of changes.products) {
          await this.upsertProduct(product);
        }
      }

      // Apply rates
      if (changes.rates) {
        for (const rate of changes.rates) {
          await this.upsertRate(rate);
        }
      }

      // Apply collections
      if (changes.collections) {
        for (const collection of changes.collections) {
          await this.upsertCollection(collection);
        }
      }

      // Apply payments
      if (changes.payments) {
        for (const payment of changes.payments) {
          await this.upsertPayment(payment);
        }
      }
    });
  }

  private async updateLocalEntity(entity: any): Promise<void> {
    // Determine entity type and update accordingly
    if (entity.credit_limit !== undefined) {
      await this.upsertSupplier(entity);
    } else if (entity.unit !== undefined && entity.quantity === undefined) {
      await this.upsertProduct(entity);
    } else if (entity.rate !== undefined && entity.effective_from !== undefined) {
      await this.upsertRate(entity);
    } else if (entity.collection_date !== undefined) {
      await this.upsertCollection(entity);
    } else if (entity.payment_date !== undefined) {
      await this.upsertPayment(entity);
    }
  }

  private async upsertSupplier(supplier: any): Promise<void> {
    const existing = await this.db.queryFirst('SELECT * FROM suppliers WHERE id = ?', [supplier.id]);
    
    const sql = existing
      ? `UPDATE suppliers SET code=?, name=?, address=?, phone=?, email=?, credit_limit=?, current_balance=?, 
         metadata=?, is_active=?, version=?, updated_at=?, last_sync_at=? WHERE id=?`
      : `INSERT INTO suppliers (code, name, address, phone, email, credit_limit, current_balance, 
         metadata, is_active, version, created_at, updated_at, last_sync_at, id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = existing
      ? [
          supplier.code, supplier.name, supplier.address, supplier.phone, supplier.email,
          supplier.credit_limit, supplier.current_balance, JSON.stringify(supplier.metadata),
          supplier.is_active ? 1 : 0, supplier.version, supplier.updated_at, supplier.last_sync_at,
          supplier.id
        ]
      : [
          supplier.code, supplier.name, supplier.address, supplier.phone, supplier.email,
          supplier.credit_limit, supplier.current_balance, JSON.stringify(supplier.metadata),
          supplier.is_active ? 1 : 0, supplier.version, supplier.created_at, supplier.updated_at,
          supplier.last_sync_at, supplier.id
        ];

    await this.db.execute(sql, params);
  }

  private async upsertProduct(product: any): Promise<void> {
    const existing = await this.db.queryFirst('SELECT * FROM products WHERE id = ?', [product.id]);
    
    const sql = existing
      ? `UPDATE products SET code=?, name=?, description=?, unit=?, category=?, metadata=?, 
         is_active=?, version=?, updated_at=?, last_sync_at=? WHERE id=?`
      : `INSERT INTO products (code, name, description, unit, category, metadata, is_active, 
         version, created_at, updated_at, last_sync_at, id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = existing
      ? [
          product.code, product.name, product.description, product.unit, product.category,
          JSON.stringify(product.metadata), product.is_active ? 1 : 0, product.version,
          product.updated_at, product.last_sync_at, product.id
        ]
      : [
          product.code, product.name, product.description, product.unit, product.category,
          JSON.stringify(product.metadata), product.is_active ? 1 : 0, product.version,
          product.created_at, product.updated_at, product.last_sync_at, product.id
        ];

    await this.db.execute(sql, params);
  }

  private async upsertRate(rate: any): Promise<void> {
    const existing = await this.db.queryFirst('SELECT * FROM rates WHERE id = ?', [rate.id]);
    
    const sql = existing
      ? `UPDATE rates SET product_id=?, supplier_id=?, rate=?, effective_from=?, effective_to=?, 
         is_active=?, notes=?, version=?, updated_at=?, last_sync_at=? WHERE id=?`
      : `INSERT INTO rates (product_id, supplier_id, rate, effective_from, effective_to, is_active, 
         notes, version, created_at, updated_at, last_sync_at, id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = existing
      ? [
          rate.product_id, rate.supplier_id, rate.rate, rate.effective_from, rate.effective_to,
          rate.is_active ? 1 : 0, rate.notes, rate.version, rate.updated_at, rate.last_sync_at,
          rate.id
        ]
      : [
          rate.product_id, rate.supplier_id, rate.rate, rate.effective_from, rate.effective_to,
          rate.is_active ? 1 : 0, rate.notes, rate.version, rate.created_at, rate.updated_at,
          rate.last_sync_at, rate.id
        ];

    await this.db.execute(sql, params);
  }

  private async upsertCollection(collection: any): Promise<void> {
    const existing = await this.db.queryFirst('SELECT * FROM collections WHERE uuid = ?', [collection.uuid]);
    
    const sql = existing
      ? `UPDATE collections SET supplier_id=?, product_id=?, rate_id=?, collection_date=?, quantity=?, 
         unit=?, rate_applied=?, amount=?, notes=?, sync_status=?, version=?, updated_at=?, 
         last_sync_at=? WHERE uuid=?`
      : `INSERT INTO collections (uuid, supplier_id, product_id, rate_id, collection_date, quantity, 
         unit, rate_applied, amount, notes, collector_id, sync_status, version, created_at, updated_at, 
         last_sync_at, id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = existing
      ? [
          collection.supplier_id, collection.product_id, collection.rate_id, collection.collection_date,
          collection.quantity, collection.unit, collection.rate_applied, collection.amount,
          collection.notes, collection.sync_status, collection.version, collection.updated_at,
          collection.last_sync_at, collection.uuid
        ]
      : [
          collection.uuid, collection.supplier_id, collection.product_id, collection.rate_id,
          collection.collection_date, collection.quantity, collection.unit, collection.rate_applied,
          collection.amount, collection.notes, collection.collector_id, collection.sync_status,
          collection.version, collection.created_at, collection.updated_at, collection.last_sync_at,
          collection.id
        ];

    await this.db.execute(sql, params);
  }

  private async upsertPayment(payment: any): Promise<void> {
    const existing = await this.db.queryFirst('SELECT * FROM payments WHERE uuid = ?', [payment.uuid]);
    
    const sql = existing
      ? `UPDATE payments SET supplier_id=?, payment_date=?, amount=?, payment_type=?, payment_method=?, 
         transaction_reference=?, notes=?, balance_before=?, balance_after=?, sync_status=?, version=?, 
         updated_at=?, last_sync_at=? WHERE uuid=?`
      : `INSERT INTO payments (uuid, reference_number, supplier_id, payment_date, amount, payment_type, 
         payment_method, transaction_reference, notes, balance_before, balance_after, processed_by, 
         sync_status, version, created_at, updated_at, last_sync_at, id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = existing
      ? [
          payment.supplier_id, payment.payment_date, payment.amount, payment.payment_type,
          payment.payment_method, payment.transaction_reference, payment.notes, payment.balance_before,
          payment.balance_after, payment.sync_status, payment.version, payment.updated_at,
          payment.last_sync_at, payment.uuid
        ]
      : [
          payment.uuid, payment.reference_number, payment.supplier_id, payment.payment_date,
          payment.amount, payment.payment_type, payment.payment_method, payment.transaction_reference,
          payment.notes, payment.balance_before, payment.balance_after, payment.processed_by,
          payment.sync_status, payment.version, payment.created_at, payment.updated_at,
          payment.last_sync_at, payment.id
        ];

    await this.db.execute(sql, params);
  }

  public getLastSyncAt(): string | null {
    return this.lastSyncAt;
  }

  public isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}
