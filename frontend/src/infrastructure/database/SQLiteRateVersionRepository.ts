import { RateVersion } from '../../domain/entities';
import { RateVersionRepository } from '../../domain/repositories';
import { Database } from '../database/Database';

export class SQLiteRateVersionRepository implements RateVersionRepository {
  async findById(id: string): Promise<RateVersion | null> {
    const db = await Database.getInstance();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM rate_versions WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    return result ? this.mapToEntity(result) : null;
  }

  async findByProductId(productId: string): Promise<RateVersion[]> {
    const db = await Database.getInstance();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM rate_versions WHERE product_id = ? AND deleted_at IS NULL ORDER BY effective_from DESC',
      [productId]
    );

    return results.map(row => this.mapToEntity(row));
  }

  async findLatestForProduct(productId: string): Promise<RateVersion | null> {
    const db = await Database.getInstance();
    const now = new Date().toISOString();
    
    const result = await db.getFirstAsync<any>(
      `SELECT * FROM rate_versions 
       WHERE product_id = ? 
         AND deleted_at IS NULL 
         AND effective_from <= ? 
         AND (effective_to IS NULL OR effective_to >= ?)
       ORDER BY effective_from DESC 
       LIMIT 1`,
      [productId, now, now]
    );

    return result ? this.mapToEntity(result) : null;
  }

  async save(rateVersion: RateVersion): Promise<void> {
    const db = await Database.getInstance();
    
    await db.runAsync(
      `INSERT OR REPLACE INTO rate_versions 
       (id, product_id, rate, effective_from, effective_to, user_id, version, 
        sync_status, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rateVersion.id,
        rateVersion.productId,
        rateVersion.rate,
        rateVersion.effectiveFrom,
        rateVersion.effectiveTo || null,
        rateVersion.userId,
        rateVersion.version,
        'pending',
        rateVersion.createdAt,
        rateVersion.updatedAt,
        rateVersion.deletedAt || null,
      ]
    );
  }

  async delete(id: string): Promise<void> {
    const db = await Database.getInstance();
    const now = new Date().toISOString();
    
    await db.runAsync(
      'UPDATE rate_versions SET deleted_at = ?, sync_status = ? WHERE id = ?',
      [now, 'pending', id]
    );
  }

  async getUnsyncedChanges(): Promise<RateVersion[]> {
    const db = await Database.getInstance();
    const results = await db.getAllAsync<any>(
      "SELECT * FROM rate_versions WHERE sync_status = 'pending' ORDER BY created_at ASC"
    );

    return results.map(row => this.mapToEntity(row));
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await Database.getInstance();
    
    await db.runAsync(
      "UPDATE rate_versions SET sync_status = 'synced' WHERE id = ?",
      [id]
    );
  }

  private mapToEntity(row: any): RateVersion {
    return {
      id: row.id,
      productId: row.product_id,
      rate: row.rate,
      effectiveFrom: row.effective_from,
      effectiveTo: row.effective_to,
      userId: row.user_id,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}
