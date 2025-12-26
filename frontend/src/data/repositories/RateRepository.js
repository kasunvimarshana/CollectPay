// Repository for Rate operations
import Database from "../../infrastructure/database/Database";

class RateRepository {
  async getAll(filters = {}) {
    let query = `
      SELECT r.*, p.name as product_name, p.unit as product_unit, 
             s.name as supplier_name
      FROM rates r
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.product_id) {
      query += " AND r.product_id = ?";
      params.push(filters.product_id);
    }

    if (filters.supplier_id) {
      query += " AND (r.supplier_id = ? OR r.supplier_id IS NULL)";
      params.push(filters.supplier_id);
    }

    if (filters.is_active !== undefined) {
      query += " AND r.is_active = ?";
      params.push(filters.is_active ? 1 : 0);
    }

    if (filters.effective_date) {
      query +=
        " AND r.effective_from <= ? AND (r.effective_to IS NULL OR r.effective_to >= ?)";
      params.push(filters.effective_date, filters.effective_date);
    }

    query += " ORDER BY r.effective_from DESC";

    return await Database.query(query, params);
  }

  async getById(id) {
    return await Database.queryFirst(
      `SELECT r.*, p.name as product_name, s.name as supplier_name
       FROM rates r
       LEFT JOIN products p ON r.product_id = p.id
       LEFT JOIN suppliers s ON r.supplier_id = s.id
       WHERE r.id = ?`,
      [id]
    );
  }

  /**
   * Get applicable rate for a product on a specific date
   * Priority: supplier-specific > general
   */
  async getApplicableRate(productId, date, supplierId = null) {
    // Try supplier-specific rate first
    if (supplierId) {
      const supplierRate = await Database.queryFirst(
        `SELECT * FROM rates 
         WHERE product_id = ? 
           AND supplier_id = ?
           AND applied_scope = 'supplier_specific'
           AND is_active = 1
           AND effective_from <= ?
           AND (effective_to IS NULL OR effective_to >= ?)
         ORDER BY effective_from DESC
         LIMIT 1`,
        [productId, supplierId, date, date]
      );

      if (supplierRate) {
        return supplierRate;
      }
    }

    // Fall back to general rate
    return await Database.queryFirst(
      `SELECT * FROM rates 
       WHERE product_id = ? 
         AND applied_scope = 'general'
         AND supplier_id IS NULL
         AND is_active = 1
         AND effective_from <= ?
         AND (effective_to IS NULL OR effective_to >= ?)
       ORDER BY effective_from DESC
       LIMIT 1`,
      [productId, date, date]
    );
  }

  async create(data) {
    const now = new Date().toISOString();

    const result = await Database.execute(
      `INSERT INTO rates (product_id, supplier_id, rate, effective_from, effective_to, 
                          is_active, applied_scope, notes, synced, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        data.product_id,
        data.supplier_id || null,
        data.rate,
        data.effective_from,
        data.effective_to || null,
        data.is_active !== false ? 1 : 0,
        data.applied_scope || "general",
        data.notes || null,
        now,
        now,
      ]
    );

    await this.addToSyncQueue("create", result.lastInsertRowId, data);

    return await this.getById(result.lastInsertRowId);
  }

  async update(id, data) {
    const now = new Date().toISOString();
    const rate = await this.getById(id);

    if (!rate) {
      throw new Error("Rate not found");
    }

    await Database.execute(
      `UPDATE rates SET 
        rate = ?, effective_from = ?, effective_to = ?,
        is_active = ?, applied_scope = ?, notes = ?,
        version = version + 1, synced = 0, updated_at = ?
       WHERE id = ?`,
      [
        data.rate !== undefined ? data.rate : rate.rate,
        data.effective_from || rate.effective_from,
        data.effective_to !== undefined ? data.effective_to : rate.effective_to,
        data.is_active !== undefined
          ? data.is_active
            ? 1
            : 0
          : rate.is_active,
        data.applied_scope || rate.applied_scope,
        data.notes !== undefined ? data.notes : rate.notes,
        now,
        id,
      ]
    );

    await this.addToSyncQueue("update", id, { id: rate.server_id, ...data });

    return await this.getById(id);
  }

  async delete(id) {
    const rate = await this.getById(id);
    if (!rate) {
      throw new Error("Rate not found");
    }

    await Database.execute("DELETE FROM rates WHERE id = ?", [id]);
    await this.addToSyncQueue("delete", id, { id: rate.server_id });
  }

  async addToSyncQueue(operation, entityId, data) {
    const now = new Date().toISOString();
    await Database.execute(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, payload, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      ["rate", entityId, operation, JSON.stringify(data), now]
    );
  }

  /**
   * Get current rates for all active products
   */
  async getCurrentRates() {
    const today = new Date().toISOString().split("T")[0];
    const products = await Database.query(
      "SELECT * FROM products WHERE is_active = 1"
    );

    const rates = [];
    for (const product of products) {
      const rate = await this.getApplicableRate(product.id, today);
      rates.push({
        product_id: product.id,
        product_name: product.name,
        product_unit: product.unit,
        current_rate: rate ? rate.rate : null,
        rate_id: rate?.id,
        effective_from: rate?.effective_from,
      });
    }

    return rates;
  }

  /**
   * Get rate history for a product
   */
  async getRateHistory(productId, supplierId = null) {
    let query = `
      SELECT r.*, p.name as product_name
      FROM rates r
      LEFT JOIN products p ON r.product_id = p.id
      WHERE r.product_id = ?
    `;
    const params = [productId];

    if (supplierId) {
      query += " AND (r.supplier_id = ? OR r.supplier_id IS NULL)";
      params.push(supplierId);
    }

    query += " ORDER BY r.effective_from DESC";

    return await Database.query(query, params);
  }
}

export default new RateRepository();
