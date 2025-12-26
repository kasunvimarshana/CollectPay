// Repository for Collection operations
import Database from '../../infrastructure/database/Database';
import uuid from 'react-native-uuid';

class CollectionRepository {
  async getAll(filters = {}) {
    let query = `
      SELECT c.*, s.name as supplier_name, p.name as product_name
      FROM collections c
      LEFT JOIN suppliers s ON c.supplier_id = s.id
      LEFT JOIN products p ON c.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.supplier_id) {
      query += ' AND c.supplier_id = ?';
      params.push(filters.supplier_id);
    }

    if (filters.from_date) {
      query += ' AND c.collection_date >= ?';
      params.push(filters.from_date);
    }

    if (filters.to_date) {
      query += ' AND c.collection_date <= ?';
      params.push(filters.to_date);
    }

    query += ' ORDER BY c.collection_date DESC, c.created_at DESC';

    return await Database.query(query, params);
  }

  async getById(id) {
    return await Database.queryFirst(
      `SELECT c.*, s.name as supplier_name, p.name as product_name, r.rate as rate_value
       FROM collections c
       LEFT JOIN suppliers s ON c.supplier_id = s.id
       LEFT JOIN products p ON c.product_id = p.id
       LEFT JOIN rates r ON c.rate_id = r.id
       WHERE c.id = ?`,
      [id]
    );
  }

  async create(data) {
    const now = new Date().toISOString();
    const collectionUuid = data.uuid || uuid.v4();

    // Get applicable rate
    const rate = await this.getApplicableRate(
      data.product_id,
      data.collection_date,
      data.supplier_id
    );

    if (!rate) {
      throw new Error('No applicable rate found for this product and date');
    }

    const totalAmount = parseFloat(data.quantity) * parseFloat(rate.rate);

    const result = await Database.execute(
      `INSERT INTO collections 
       (uuid, supplier_id, product_id, rate_id, quantity, rate_applied, total_amount, 
        collection_date, collection_time, notes, synced, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        collectionUuid,
        data.supplier_id,
        data.product_id,
        rate.id,
        data.quantity,
        rate.rate,
        totalAmount,
        data.collection_date,
        data.collection_time || now,
        data.notes || null,
        now,
        now,
      ]
    );

    await this.addToSyncQueue('create', result.lastInsertRowId, {
      uuid: collectionUuid,
      supplier_id: data.supplier_id,
      product_id: data.product_id,
      quantity: data.quantity,
      collection_date: data.collection_date,
      collection_time: data.collection_time || now,
      notes: data.notes,
    });

    return await this.getById(result.lastInsertRowId);
  }

  async getApplicableRate(productId, date, supplierId = null) {
    let query = `
      SELECT * FROM rates 
      WHERE product_id = ? 
        AND is_active = 1
        AND effective_from <= ?
        AND (effective_to IS NULL OR effective_to >= ?)
    `;
    const params = [productId, date, date];

    if (supplierId) {
      // Try supplier-specific rate first
      const supplierRate = await Database.queryFirst(
        query + ' AND supplier_id = ? AND applied_scope = "supplier_specific" ORDER BY effective_from DESC LIMIT 1',
        [...params, supplierId]
      );
      if (supplierRate) return supplierRate;
    }

    // Fall back to general rate
    return await Database.queryFirst(
      query + ' AND applied_scope = "general" AND supplier_id IS NULL ORDER BY effective_from DESC LIMIT 1',
      params
    );
  }

  async addToSyncQueue(operation, entityId, data) {
    const now = new Date().toISOString();
    await Database.execute(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, payload, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      ['collection', entityId, operation, JSON.stringify(data), now]
    );
  }

  async getSummary(supplierId, fromDate = null, toDate = null) {
    let query = `
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.unit,
        SUM(c.quantity) as total_quantity,
        SUM(c.total_amount) as total_amount,
        COUNT(*) as collection_count
      FROM collections c
      LEFT JOIN products p ON c.product_id = p.id
      WHERE c.supplier_id = ?
    `;
    const params = [supplierId];

    if (fromDate) {
      query += ' AND c.collection_date >= ?';
      params.push(fromDate);
    }

    if (toDate) {
      query += ' AND c.collection_date <= ?';
      params.push(toDate);
    }

    query += ' GROUP BY p.id, p.name, p.unit';

    return await Database.query(query, params);
  }
}

export default new CollectionRepository();
