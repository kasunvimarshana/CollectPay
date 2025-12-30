import DatabaseService from './DatabaseService';
import { Collection } from '../../shared/types';

/**
 * Repository for managing collections in local storage
 */
class CollectionRepository {
  /**
   * Get all collections
   */
  async getAll(limit?: number): Promise<Collection[]> {
    const db = DatabaseService.getDatabase();
    const sql = limit 
      ? 'SELECT * FROM collections WHERE deleted_at IS NULL ORDER BY collection_date DESC LIMIT ?'
      : 'SELECT * FROM collections WHERE deleted_at IS NULL ORDER BY collection_date DESC';
    
    const result = await db.getAllAsync<any>(sql, limit ? [limit] : []);
    return result.map(this.mapToCollection);
  }

  /**
   * Get collection by ID
   */
  async getById(id: number): Promise<Collection | null> {
    const db = DatabaseService.getDatabase();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM collections WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return result ? this.mapToCollection(result) : null;
  }

  /**
   * Get collections by supplier
   */
  async getBySupplier(supplierId: number): Promise<Collection[]> {
    const db = DatabaseService.getDatabase();
    const result = await db.getAllAsync<any>(
      'SELECT * FROM collections WHERE supplier_id = ? AND deleted_at IS NULL ORDER BY collection_date DESC',
      [supplierId]
    );
    return result.map(this.mapToCollection);
  }

  /**
   * Get collections by date range
   */
  async getByDateRange(fromDate: string, toDate: string): Promise<Collection[]> {
    const db = DatabaseService.getDatabase();
    const result = await db.getAllAsync<any>(
      'SELECT * FROM collections WHERE collection_date BETWEEN ? AND ? AND deleted_at IS NULL ORDER BY collection_date DESC',
      [fromDate, toDate]
    );
    return result.map(this.mapToCollection);
  }

  /**
   * Create a new collection
   */
  async create(collection: Partial<Collection>): Promise<number> {
    const db = DatabaseService.getDatabase();
    const now = new Date().toISOString();
    
    const result = await db.runAsync(
      `INSERT INTO collections (
        server_id, supplier_id, supplier_server_id, product_id, product_server_id,
        quantity, unit, collection_date, rate_per_unit, total_amount,
        notes, collected_by, metadata, version, synced, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        collection.id || null,
        collection.supplier_id,
        null,
        collection.product_id,
        null,
        collection.quantity,
        collection.unit,
        collection.collection_date,
        collection.rate_per_unit || null,
        collection.total_amount || null,
        collection.notes || null,
        collection.collected_by || null,
        null,
        collection.version || 1,
        collection.id ? 1 : 0,
        now,
        now
      ]
    );

    // Add to sync queue if not synced
    if (!collection.id) {
      await this.addToSyncQueue(result.lastInsertRowId, 'create', collection);
    }

    return result.lastInsertRowId;
  }

  /**
   * Update a collection
   */
  async update(id: number, collection: Partial<Collection>): Promise<void> {
    const db = DatabaseService.getDatabase();
    const now = new Date().toISOString();
    
    await db.runAsync(
      `UPDATE collections SET
        quantity = COALESCE(?, quantity),
        unit = COALESCE(?, unit),
        collection_date = COALESCE(?, collection_date),
        rate_per_unit = COALESCE(?, rate_per_unit),
        total_amount = COALESCE(?, total_amount),
        notes = COALESCE(?, notes),
        version = version + 1,
        synced = 0,
        updated_at = ?
      WHERE id = ?`,
      [
        collection.quantity,
        collection.unit,
        collection.collection_date,
        collection.rate_per_unit,
        collection.total_amount,
        collection.notes,
        now,
        id
      ]
    );

    // Add to sync queue
    await this.addToSyncQueue(id, 'update', collection);
  }

  /**
   * Delete a collection (soft delete)
   */
  async delete(id: number): Promise<void> {
    const db = DatabaseService.getDatabase();
    const now = new Date().toISOString();
    
    await db.runAsync(
      'UPDATE collections SET deleted_at = ?, synced = 0 WHERE id = ?',
      [now, id]
    );

    // Add to sync queue
    await this.addToSyncQueue(id, 'delete', {});
  }

  /**
   * Get unsynced collections
   */
  async getUnsynced(): Promise<Collection[]> {
    const db = DatabaseService.getDatabase();
    const result = await db.getAllAsync<any>(
      'SELECT * FROM collections WHERE synced = 0'
    );
    return result.map(this.mapToCollection);
  }

  /**
   * Mark collection as synced
   */
  async markSynced(localId: number, serverId: number): Promise<void> {
    const db = DatabaseService.getDatabase();
    await db.runAsync(
      'UPDATE collections SET server_id = ?, synced = 1 WHERE id = ?',
      [serverId, localId]
    );
  }

  /**
   * Add operation to sync queue
   */
  private async addToSyncQueue(entityId: number, operation: string, data: any): Promise<void> {
    const db = DatabaseService.getDatabase();
    const now = new Date().toISOString();
    
    await db.runAsync(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, data, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      ['collection', entityId, operation, JSON.stringify(data), now]
    );
  }

  /**
   * Map database row to Collection object
   */
  private mapToCollection(row: any): Collection {
    return {
      id: row.server_id || row.id,
      supplier_id: row.supplier_server_id || row.supplier_id,
      product_id: row.product_server_id || row.product_id,
      quantity: row.quantity,
      unit: row.unit,
      collection_date: row.collection_date,
      rate_per_unit: row.rate_per_unit,
      total_amount: row.total_amount,
      notes: row.notes,
      collected_by: row.collected_by,
      version: row.version,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    };
  }
}

export default new CollectionRepository();
