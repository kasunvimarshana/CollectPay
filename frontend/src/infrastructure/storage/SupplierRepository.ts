import DatabaseService from './DatabaseService';
import { Supplier } from '../../shared/types';

/**
 * Repository for managing suppliers in local storage
 */
class SupplierRepository {
  /**
   * Get all suppliers
   */
  async getAll(): Promise<Supplier[]> {
    const db = DatabaseService.getDatabase();
    const result = await db.getAllAsync<any>(
      'SELECT * FROM suppliers WHERE deleted_at IS NULL ORDER BY name'
    );
    return result.map(this.mapToSupplier);
  }

  /**
   * Get supplier by ID
   */
  async getById(id: number): Promise<Supplier | null> {
    const db = DatabaseService.getDatabase();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM suppliers WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return result ? this.mapToSupplier(result) : null;
  }

  /**
   * Get supplier by server ID
   */
  async getByServerId(serverId: number): Promise<Supplier | null> {
    const db = DatabaseService.getDatabase();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM suppliers WHERE server_id = ? AND deleted_at IS NULL',
      [serverId]
    );
    return result ? this.mapToSupplier(result) : null;
  }

  /**
   * Search suppliers
   */
  async search(query: string): Promise<Supplier[]> {
    const db = DatabaseService.getDatabase();
    const searchPattern = `%${query}%`;
    const result = await db.getAllAsync<any>(
      'SELECT * FROM suppliers WHERE deleted_at IS NULL AND (name LIKE ? OR code LIKE ? OR contact_person LIKE ?) ORDER BY name',
      [searchPattern, searchPattern, searchPattern]
    );
    return result.map(this.mapToSupplier);
  }

  /**
   * Create a new supplier
   */
  async create(supplier: Partial<Supplier>): Promise<number> {
    const db = DatabaseService.getDatabase();
    const now = new Date().toISOString();
    
    const result = await db.runAsync(
      `INSERT INTO suppliers (
        server_id, name, code, contact_person, phone, email,
        address, city, state, country, postal_code, status,
        metadata, version, synced, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplier.id || null,
        supplier.name,
        supplier.code || null,
        supplier.contact_person || null,
        supplier.phone || null,
        supplier.email || null,
        supplier.address || null,
        supplier.city || null,
        supplier.state || null,
        supplier.country || null,
        supplier.postal_code || null,
        supplier.status || 'active',
        null,
        supplier.version || 1,
        supplier.id ? 1 : 0, // synced if has server_id
        now,
        now
      ]
    );

    return result.lastInsertRowId;
  }

  /**
   * Update a supplier
   */
  async update(id: number, supplier: Partial<Supplier>): Promise<void> {
    const db = DatabaseService.getDatabase();
    const now = new Date().toISOString();
    
    await db.runAsync(
      `UPDATE suppliers SET
        name = COALESCE(?, name),
        code = COALESCE(?, code),
        contact_person = COALESCE(?, contact_person),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        country = COALESCE(?, country),
        postal_code = COALESCE(?, postal_code),
        status = COALESCE(?, status),
        version = version + 1,
        synced = 0,
        updated_at = ?
      WHERE id = ?`,
      [
        supplier.name,
        supplier.code,
        supplier.contact_person,
        supplier.phone,
        supplier.email,
        supplier.address,
        supplier.city,
        supplier.state,
        supplier.country,
        supplier.postal_code,
        supplier.status,
        now,
        id
      ]
    );
  }

  /**
   * Delete a supplier (soft delete)
   */
  async delete(id: number): Promise<void> {
    const db = DatabaseService.getDatabase();
    const now = new Date().toISOString();
    
    await db.runAsync(
      'UPDATE suppliers SET deleted_at = ?, synced = 0 WHERE id = ?',
      [now, id]
    );
  }

  /**
   * Get unsynced suppliers
   */
  async getUnsynced(): Promise<Supplier[]> {
    const db = DatabaseService.getDatabase();
    const result = await db.getAllAsync<any>(
      'SELECT * FROM suppliers WHERE synced = 0'
    );
    return result.map(this.mapToSupplier);
  }

  /**
   * Mark supplier as synced
   */
  async markSynced(localId: number, serverId: number): Promise<void> {
    const db = DatabaseService.getDatabase();
    await db.runAsync(
      'UPDATE suppliers SET server_id = ?, synced = 1 WHERE id = ?',
      [serverId, localId]
    );
  }

  /**
   * Map database row to Supplier object
   */
  private mapToSupplier(row: any): Supplier {
    return {
      id: row.server_id || row.id,
      name: row.name,
      code: row.code,
      contact_person: row.contact_person,
      phone: row.phone,
      email: row.email,
      address: row.address,
      city: row.city,
      state: row.state,
      country: row.country,
      postal_code: row.postal_code,
      status: row.status,
      version: row.version,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    };
  }
}

export default new SupplierRepository();
