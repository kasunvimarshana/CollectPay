import { Product } from '../../domain/entities';
import { ProductRepository } from '../../domain/repositories';
import { Database } from '../database/Database';

export class SQLiteProductRepository implements ProductRepository {
  async findById(id: string): Promise<Product | null> {
    const db = await Database.getInstance();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM products WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    return result ? this.mapToEntity(result) : null;
  }

  async findAll(): Promise<Product[]> {
    const db = await Database.getInstance();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM products WHERE deleted_at IS NULL ORDER BY name ASC'
    );

    return results.map(row => this.mapToEntity(row));
  }

  async save(product: Product): Promise<void> {
    const db = await Database.getInstance();
    
    await db.runAsync(
      `INSERT OR REPLACE INTO products 
       (id, name, code, unit, description, user_id, version, 
        sync_status, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id,
        product.name,
        product.code,
        product.unit,
        product.description || null,
        product.userId,
        product.version,
        'pending',
        product.createdAt,
        product.updatedAt,
        product.deletedAt || null,
      ]
    );
  }

  async delete(id: string): Promise<void> {
    const db = await Database.getInstance();
    const now = new Date().toISOString();
    
    await db.runAsync(
      'UPDATE products SET deleted_at = ?, sync_status = ? WHERE id = ?',
      [now, 'pending', id]
    );
  }

  async getUnsyncedChanges(): Promise<Product[]> {
    const db = await Database.getInstance();
    const results = await db.getAllAsync<any>(
      "SELECT * FROM products WHERE sync_status = 'pending' ORDER BY created_at ASC"
    );

    return results.map(row => this.mapToEntity(row));
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await Database.getInstance();
    
    await db.runAsync(
      "UPDATE products SET sync_status = 'synced' WHERE id = ?",
      [id]
    );
  }

  private mapToEntity(row: any): Product {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      unit: row.unit,
      description: row.description,
      userId: row.user_id,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}
