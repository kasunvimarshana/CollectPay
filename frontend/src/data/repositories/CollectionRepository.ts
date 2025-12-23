import { DatabaseService } from '../local/DatabaseService';
import { Collection } from '../../domain/entities';
import * as Crypto from 'expo-crypto';

export class CollectionRepository {
  private static instance: CollectionRepository;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): CollectionRepository {
    if (!CollectionRepository.instance) {
      CollectionRepository.instance = new CollectionRepository();
    }
    return CollectionRepository.instance;
  }

  public async getAll(limit: number = 100): Promise<Collection[]> {
    const rows = await this.db.query(
      'SELECT * FROM collections ORDER BY collection_date DESC, created_at DESC LIMIT ?',
      [limit]
    );
    return rows.map(this.mapRowToCollection);
  }

  public async getById(id: number): Promise<Collection | null> {
    const row = await this.db.queryFirst('SELECT * FROM collections WHERE id = ?', [id]);
    return row ? this.mapRowToCollection(row) : null;
  }

  public async getByUuid(uuid: string): Promise<Collection | null> {
    const row = await this.db.queryFirst('SELECT * FROM collections WHERE uuid = ?', [uuid]);
    return row ? this.mapRowToCollection(row) : null;
  }

  public async getBySupplier(supplierId: number, limit: number = 50): Promise<Collection[]> {
    const rows = await this.db.query(
      'SELECT * FROM collections WHERE supplier_id = ? ORDER BY collection_date DESC LIMIT ?',
      [supplierId, limit]
    );
    return rows.map(this.mapRowToCollection);
  }

  public async getByDateRange(fromDate: string, toDate: string): Promise<Collection[]> {
    const rows = await this.db.query(
      'SELECT * FROM collections WHERE collection_date BETWEEN ? AND ? ORDER BY collection_date DESC',
      [fromDate, toDate]
    );
    return rows.map(this.mapRowToCollection);
  }

  public async getPending(): Promise<Collection[]> {
    const rows = await this.db.query(
      'SELECT * FROM collections WHERE sync_status = ? ORDER BY created_at ASC',
      ['pending']
    );
    return rows.map(this.mapRowToCollection);
  }

  public async create(collection: Omit<Collection, 'id' | 'uuid' | 'version' | 'created_at' | 'updated_at'>): Promise<Collection> {
    const now = new Date().toISOString();
    const uuid = Crypto.randomUUID();
    
    // Calculate amount if not provided
    const amount = collection.amount || (collection.quantity * collection.rate_applied);

    const result = await this.db.execute(
      `INSERT INTO collections (uuid, supplier_id, product_id, rate_id, collection_date, quantity, 
       unit, rate_applied, amount, notes, collector_id, sync_status, version, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1, ?, ?)`,
      [
        uuid,
        collection.supplier_id,
        collection.product_id,
        collection.rate_id || null,
        collection.collection_date,
        collection.quantity,
        collection.unit,
        collection.rate_applied,
        amount,
        collection.notes || null,
        collection.collector_id || null,
        now,
        now,
      ]
    );

    await this.addToSyncQueue('create', result.lastInsertRowId!, uuid, {
      ...collection,
      uuid,
      amount,
    });

    const created = await this.getById(result.lastInsertRowId!);
    return created!;
  }

  public async update(id: number, collection: Partial<Collection>): Promise<Collection> {
    const now = new Date().toISOString();
    const existing = await this.getById(id);
    
    if (!existing) {
      throw new Error('Collection not found');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (collection.quantity !== undefined) {
      updates.push('quantity = ?');
      params.push(collection.quantity);
      
      // Recalculate amount if quantity changed
      const rate = collection.rate_applied || existing.rate_applied;
      updates.push('amount = ?');
      params.push(collection.quantity * rate);
    }

    if (collection.collection_date !== undefined) {
      updates.push('collection_date = ?');
      params.push(collection.collection_date);
    }

    if (collection.notes !== undefined) {
      updates.push('notes = ?');
      params.push(collection.notes);
    }

    updates.push('sync_status = ?');
    params.push('pending');
    updates.push('version = version + 1');
    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    await this.db.execute(
      `UPDATE collections SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    await this.addToSyncQueue('update', id, existing.uuid, { ...existing, ...collection });
    const updated = await this.getById(id);
    return updated!;
  }

  public async delete(id: number): Promise<void> {
    const collection = await this.getById(id);
    if (!collection) {
      throw new Error('Collection not found');
    }

    await this.db.execute('DELETE FROM collections WHERE id = ?', [id]);
    await this.addToSyncQueue('delete', id, collection.uuid, collection);
  }

  public async getTotalForSupplier(supplierId: number): Promise<number> {
    const result = await this.db.queryFirst(
      'SELECT COALESCE(SUM(amount), 0) as total FROM collections WHERE supplier_id = ? AND sync_status = ?',
      [supplierId, 'synced']
    );
    return parseFloat(result?.total || 0);
  }

  private async addToSyncQueue(operation: string, entityId: number, entityUuid: string, data: any): Promise<void> {
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO sync_queue (entity_type, entity_id, entity_uuid, operation, payload, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
      ['collections', entityId, entityUuid, operation, JSON.stringify(data), now, now]
    );
  }

  private mapRowToCollection(row: any): Collection {
    return {
      id: row.id,
      uuid: row.uuid,
      supplier_id: row.supplier_id,
      product_id: row.product_id,
      rate_id: row.rate_id,
      collection_date: row.collection_date,
      quantity: parseFloat(row.quantity),
      unit: row.unit,
      rate_applied: parseFloat(row.rate_applied),
      amount: parseFloat(row.amount),
      notes: row.notes,
      collector_id: row.collector_id,
      sync_status: row.sync_status,
      version: row.version,
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_sync_at: row.last_sync_at,
    };
  }
}
