import NetInfo from '@react-native-community/netinfo';
import { ApiClient } from '../api/ApiClient';
import { Database } from '../database/Database';
import { SyncPayload, SyncResponse } from '../../domain/entities';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSyncTime: string | null;
  pendingCount: number;
  error: string | null;
}

export class SyncService {
  private static instance: SyncService | null = null;
  private syncInProgress = false;
  private listeners: Array<(state: SyncState) => void> = [];
  private state: SyncState = {
    status: 'idle',
    lastSyncTime: null,
    pendingCount: 0,
    error: null,
  };

  static getInstance(): SyncService {
    if (!this.instance) {
      this.instance = new SyncService();
      this.instance.initializeNetworkListener();
    }
    return this.instance;
  }

  private initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.syncInProgress) {
        // Trigger auto-sync when network is restored
        this.sync().catch(console.error);
      }
    });
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  private updateState(updates: Partial<SyncState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  async sync(): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return;
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('No network connection, skipping sync');
      return;
    }

    this.syncInProgress = true;
    this.updateState({ status: 'syncing', error: null });

    try {
      // 1. Pull changes from server
      await this.pullFromServer();

      // 2. Push local changes to server
      await this.pushToServer();

      const now = new Date().toISOString();
      this.updateState({
        status: 'success',
        lastSyncTime: now,
        pendingCount: 0,
        error: null,
      });
    } catch (error: any) {
      console.error('Sync failed:', error);
      this.updateState({
        status: 'error',
        error: error.message || 'Sync failed',
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  private async pullFromServer(): Promise<void> {
    const lastSync = this.state.lastSyncTime || '1970-01-01T00:00:00Z';
    
    // Fetch updates from server
    const response = await ApiClient.get<{
      suppliers: any[];
      products: any[];
      collections: any[];
      payments: any[];
      rateVersions: any[];
    }>(`/sync/pull?since=${lastSync}`);

    if (!response.success || !response.data) {
      throw new Error('Failed to pull data from server');
    }

    const db = await Database.getInstance();

    // Update local database with server data
    // Suppliers
    for (const supplier of response.data.suppliers || []) {
      await db.runAsync(
        `INSERT OR REPLACE INTO suppliers 
         (id, name, code, address, phone, email, notes, user_id, version, 
          sync_status, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, ?)`,
        [
          supplier.id,
          supplier.name,
          supplier.code,
          supplier.address,
          supplier.phone,
          supplier.email,
          supplier.notes,
          supplier.user_id,
          supplier.version,
          supplier.created_at,
          supplier.updated_at,
          supplier.deleted_at,
        ]
      );
    }

    // Products
    for (const product of response.data.products || []) {
      await db.runAsync(
        `INSERT OR REPLACE INTO products 
         (id, name, code, unit, description, user_id, version, 
          sync_status, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, ?)`,
        [
          product.id,
          product.name,
          product.code,
          product.unit,
          product.description,
          product.user_id,
          product.version,
          product.created_at,
          product.updated_at,
          product.deleted_at,
        ]
      );
    }

    // Rate versions
    for (const rate of response.data.rateVersions || []) {
      await db.runAsync(
        `INSERT OR REPLACE INTO rate_versions 
         (id, product_id, rate, effective_from, effective_to, user_id, version, 
          sync_status, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, ?)`,
        [
          rate.id,
          rate.product_id,
          rate.rate,
          rate.effective_from,
          rate.effective_to,
          rate.user_id,
          rate.version,
          rate.created_at,
          rate.updated_at,
          rate.deleted_at,
        ]
      );
    }

    // Collections
    for (const collection of response.data.collections || []) {
      await db.runAsync(
        `INSERT OR REPLACE INTO collections 
         (id, supplier_id, product_id, quantity, rate_version_id, applied_rate, 
          collection_date, notes, user_id, idempotency_key, version, 
          sync_status, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, ?)`,
        [
          collection.id,
          collection.supplier_id,
          collection.product_id,
          collection.quantity,
          collection.rate_version_id,
          collection.applied_rate,
          collection.collection_date,
          collection.notes,
          collection.user_id,
          collection.idempotency_key,
          collection.version,
          collection.created_at,
          collection.updated_at,
          collection.deleted_at,
        ]
      );
    }

    // Payments
    for (const payment of response.data.payments || []) {
      await db.runAsync(
        `INSERT OR REPLACE INTO payments 
         (id, supplier_id, amount, type, payment_date, notes, reference_number, 
          user_id, idempotency_key, version, sync_status, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, ?)`,
        [
          payment.id,
          payment.supplier_id,
          payment.amount,
          payment.type,
          payment.payment_date,
          payment.notes,
          payment.reference_number,
          payment.user_id,
          payment.idempotency_key,
          payment.version,
          payment.created_at,
          payment.updated_at,
          payment.deleted_at,
        ]
      );
    }
  }

  private async pushToServer(): Promise<void> {
    const db = await Database.getInstance();

    // Collect all pending changes
    const payloads: SyncPayload[] = [];

    // Get unsynced suppliers
    const suppliers = await db.getAllAsync<any>(
      "SELECT * FROM suppliers WHERE sync_status = 'pending'"
    );
    for (const supplier of suppliers) {
      payloads.push({
        entityType: 'supplier',
        operation: supplier.deleted_at ? 'delete' : 'create',
        entityId: supplier.id,
        data: supplier,
        clientTimestamp: supplier.updated_at,
      });
    }

    // Get unsynced products
    const products = await db.getAllAsync<any>(
      "SELECT * FROM products WHERE sync_status = 'pending'"
    );
    for (const product of products) {
      payloads.push({
        entityType: 'product',
        operation: product.deleted_at ? 'delete' : 'create',
        entityId: product.id,
        data: product,
        clientTimestamp: product.updated_at,
      });
    }

    // Get unsynced rate versions
    const rates = await db.getAllAsync<any>(
      "SELECT * FROM rate_versions WHERE sync_status = 'pending'"
    );
    for (const rate of rates) {
      payloads.push({
        entityType: 'rate_version',
        operation: rate.deleted_at ? 'delete' : 'create',
        entityId: rate.id,
        data: rate,
        clientTimestamp: rate.updated_at,
      });
    }

    // Get unsynced collections
    const collections = await db.getAllAsync<any>(
      "SELECT * FROM collections WHERE sync_status = 'pending'"
    );
    for (const collection of collections) {
      payloads.push({
        entityType: 'collection',
        operation: collection.deleted_at ? 'delete' : 'create',
        entityId: collection.id,
        data: collection,
        clientTimestamp: collection.updated_at,
        idempotencyKey: collection.idempotency_key,
      });
    }

    // Get unsynced payments
    const payments = await db.getAllAsync<any>(
      "SELECT * FROM payments WHERE sync_status = 'pending'"
    );
    for (const payment of payments) {
      payloads.push({
        entityType: 'payment',
        operation: payment.deleted_at ? 'delete' : 'create',
        entityId: payment.id,
        data: payment,
        clientTimestamp: payment.updated_at,
        idempotencyKey: payment.idempotency_key,
      });
    }

    if (payloads.length === 0) {
      console.log('No pending changes to sync');
      return;
    }

    this.updateState({ pendingCount: payloads.length });

    // Send to server in batches
    const batchSize = 50;
    for (let i = 0; i < payloads.length; i += batchSize) {
      const batch = payloads.slice(i, i + batchSize);
      const response = await ApiClient.post<SyncResponse>('/sync/push', {
        changes: batch,
      });

      if (!response.success || !response.data) {
        throw new Error('Failed to push data to server');
      }

      // Mark synced items
      for (const payload of batch) {
        const table = this.getTableName(payload.entityType);
        await db.runAsync(
          `UPDATE ${table} SET sync_status = 'synced' WHERE id = ?`,
          [payload.entityId]
        );
      }

      // Handle conflicts if any
      if (response.data.conflicts && response.data.conflicts.length > 0) {
        console.warn('Sync conflicts detected:', response.data.conflicts);
        // In a production app, you'd want to handle these more gracefully
      }
    }
  }

  private getTableName(entityType: string): string {
    const mapping: Record<string, string> = {
      supplier: 'suppliers',
      product: 'products',
      collection: 'collections',
      payment: 'payments',
      rate_version: 'rate_versions',
    };
    return mapping[entityType] || entityType;
  }

  async getPendingCount(): Promise<number> {
    const db = await Database.getInstance();
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT 
        (SELECT COUNT(*) FROM suppliers WHERE sync_status = 'pending') +
        (SELECT COUNT(*) FROM products WHERE sync_status = 'pending') +
        (SELECT COUNT(*) FROM rate_versions WHERE sync_status = 'pending') +
        (SELECT COUNT(*) FROM collections WHERE sync_status = 'pending') +
        (SELECT COUNT(*) FROM payments WHERE sync_status = 'pending') as total`
    );
    return result?.total || 0;
  }

  getState(): SyncState {
    return { ...this.state };
  }
}
