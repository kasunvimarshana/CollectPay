import { Supplier } from '../../domain/entities';
import { SupplierRepository } from '../../domain/repositories';
import { Database } from '../database/Database';

export class SQLiteSupplierRepository implements SupplierRepository {
  async findById(id: string): Promise<Supplier | null> {
    const db = await Database.getInstance();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM suppliers WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    return result ? this.mapToEntity(result) : null;
  }

  async findAll(): Promise<Supplier[]> {
    const db = await Database.getInstance();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM suppliers WHERE deleted_at IS NULL ORDER BY name ASC'
    );

    return results.map(row => this.mapToEntity(row));
  }

  async save(supplier: Supplier): Promise<void> {
    const db = await Database.getInstance();
    
    await db.runAsync(
      `INSERT OR REPLACE INTO suppliers 
       (id, name, code, address, phone, email, notes, user_id, version, 
        sync_status, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplier.id,
        supplier.name,
        supplier.code,
        supplier.address || null,
        supplier.phone || null,
        supplier.email || null,
        supplier.notes || null,
        supplier.userId,
        supplier.version,
        'pending',
        supplier.createdAt,
        supplier.updatedAt,
        supplier.deletedAt || null,
      ]
    );
  }

  async delete(id: string): Promise<void> {
    const db = await Database.getInstance();
    const now = new Date().toISOString();
    
    await db.runAsync(
      'UPDATE suppliers SET deleted_at = ?, sync_status = ? WHERE id = ?',
      [now, 'pending', id]
    );
  }

  async getUnsyncedChanges(): Promise<Supplier[]> {
    const db = await Database.getInstance();
    const results = await db.getAllAsync<any>(
      "SELECT * FROM suppliers WHERE sync_status = 'pending' ORDER BY created_at ASC"
    );

    return results.map(row => this.mapToEntity(row));
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await Database.getInstance();
    
    await db.runAsync(
      "UPDATE suppliers SET sync_status = 'synced' WHERE id = ?",
      [id]
    );
  }

  private mapToEntity(row: any): Supplier {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      address: row.address,
      phone: row.phone,
      email: row.email,
      notes: row.notes,
      userId: row.user_id,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}
