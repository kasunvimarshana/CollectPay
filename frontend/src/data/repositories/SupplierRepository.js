// Repository for Supplier operations
import Database from '../../infrastructure/database/Database';
import ApiClient from '../../infrastructure/network/ApiClient';
import NetworkMonitor from '../../infrastructure/network/NetworkMonitor';
import uuid from 'react-native-uuid';

class SupplierRepository {
  async getAll(filters = {}) {
    let query = 'SELECT * FROM suppliers WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR code LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY name ASC';

    return await Database.query(query, params);
  }

  async getById(id) {
    return await Database.queryFirst('SELECT * FROM suppliers WHERE id = ?', [id]);
  }

  async create(data) {
    const now = new Date().toISOString();
    const code = data.code || `SUP${Date.now()}`;
    
    const result = await Database.execute(
      `INSERT INTO suppliers (code, name, contact_person, phone, email, address, status, metadata, synced, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        code,
        data.name,
        data.contact_person || null,
        data.phone || null,
        data.email || null,
        data.address || null,
        data.status || 'active',
        data.metadata ? JSON.stringify(data.metadata) : null,
        now,
        now,
      ]
    );

    // Add to sync queue
    await this.addToSyncQueue('create', result.lastInsertRowId, data);

    // Try to sync immediately if online
    if (NetworkMonitor.getConnectionStatus()) {
      // Trigger sync event
      // SyncEngine will handle it
    }

    return await this.getById(result.lastInsertRowId);
  }

  async update(id, data) {
    const now = new Date().toISOString();
    const supplier = await this.getById(id);

    await Database.execute(
      `UPDATE suppliers SET 
        name = ?, contact_person = ?, phone = ?, email = ?, 
        address = ?, status = ?, metadata = ?, 
        version = version + 1, synced = 0, updated_at = ?
       WHERE id = ?`,
      [
        data.name || supplier.name,
        data.contact_person !== undefined ? data.contact_person : supplier.contact_person,
        data.phone !== undefined ? data.phone : supplier.phone,
        data.email !== undefined ? data.email : supplier.email,
        data.address !== undefined ? data.address : supplier.address,
        data.status || supplier.status,
        data.metadata ? JSON.stringify(data.metadata) : supplier.metadata,
        now,
        id,
      ]
    );

    await this.addToSyncQueue('update', id, { ...supplier, ...data });

    return await this.getById(id);
  }

  async delete(id) {
    await Database.execute('DELETE FROM suppliers WHERE id = ?', [id]);
    await this.addToSyncQueue('delete', id, { id });
  }

  async addToSyncQueue(operation, entityId, data) {
    const now = new Date().toISOString();
    await Database.execute(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, payload, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      ['supplier', entityId, operation, JSON.stringify(data), now]
    );
  }

  async getBalance(supplierId) {
    // Calculate outstanding balance locally
    const collections = await Database.query(
      'SELECT SUM(total_amount) as total FROM collections WHERE supplier_id = ?',
      [supplierId]
    );

    const payments = await Database.query(
      'SELECT SUM(amount) as total FROM payments WHERE supplier_id = ?',
      [supplierId]
    );

    const totalCollections = collections[0]?.total || 0;
    const totalPayments = payments[0]?.total || 0;

    return {
      total_collections: totalCollections,
      total_payments: totalPayments,
      outstanding_balance: totalCollections - totalPayments,
    };
  }
}

export default new SupplierRepository();
