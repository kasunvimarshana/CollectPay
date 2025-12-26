import { Collection } from '../../domain/entities';
import { CollectionRepository } from '../../domain/repositories';
import { Database } from '../database/Database';

export class SQLiteCollectionRepository implements CollectionRepository {
  async findById(id: string): Promise<Collection | null> {
    const db = await Database.getInstance();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM collections WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    return result ? this.mapToEntity(result) : null;
  }

  async findAll(): Promise<Collection[]> {
    const db = await Database.getInstance();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM collections WHERE deleted_at IS NULL ORDER BY collection_date DESC'
    );

    return results.map(row => this.mapToEntity(row));
  }

  async findBySupplierId(supplierId: string): Promise<Collection[]> {
    const db = await Database.getInstance();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM collections WHERE supplier_id = ? AND deleted_at IS NULL ORDER BY collection_date DESC',
      [supplierId]
    );

    return results.map(row => this.mapToEntity(row));
  }

  async save(collection: Collection): Promise<void> {
    const db = await Database.getInstance();
    
    await db.runAsync(
      `INSERT OR REPLACE INTO collections 
       (id, supplier_id, product_id, quantity, rate_version_id, applied_rate, 
        collection_date, notes, user_id, idempotency_key, version, sync_status, 
        sync_error, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        collection.id,
        collection.supplierId,
        collection.productId,
        collection.quantity,
        collection.rateVersionId,
        collection.appliedRate,
        collection.collectionDate,
        collection.notes || null,
        collection.userId,
        collection.idempotencyKey,
        collection.version,
        collection.syncStatus || 'pending',
        collection.syncError || null,
        collection.createdAt,
        collection.updatedAt,
        collection.deletedAt || null,
      ]
    );
  }

  async saveBatch(collections: Collection[]): Promise<void> {
    const db = await Database.getInstance();
    
    for (const collection of collections) {
      await this.save(collection);
    }
  }

  async delete(id: string): Promise<void> {
    const db = await Database.getInstance();
    const now = new Date().toISOString();
    
    await db.runAsync(
      'UPDATE collections SET deleted_at = ?, sync_status = ? WHERE id = ?',
      [now, 'pending', id]
    );
  }

  async getUnsyncedChanges(): Promise<Collection[]> {
    const db = await Database.getInstance();
    const results = await db.getAllAsync<any>(
      "SELECT * FROM collections WHERE sync_status = 'pending' ORDER BY created_at ASC"
    );

    return results.map(row => this.mapToEntity(row));
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await Database.getInstance();
    
    await db.runAsync(
      "UPDATE collections SET sync_status = 'synced', sync_error = NULL WHERE id = ?",
      [id]
    );
  }

  private mapToEntity(row: any): Collection {
    return {
      id: row.id,
      supplierId: row.supplier_id,
      productId: row.product_id,
      quantity: row.quantity,
      rateVersionId: row.rate_version_id,
      appliedRate: row.applied_rate,
      collectionDate: row.collection_date,
      notes: row.notes,
      userId: row.user_id,
      idempotencyKey: row.idempotency_key,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      syncStatus: row.sync_status as 'pending' | 'synced' | 'conflict' | 'error',
      syncError: row.sync_error,
    };
  }
}
