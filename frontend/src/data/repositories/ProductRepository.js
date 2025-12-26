// Repository for Product operations
import Database from "../../infrastructure/database/Database";
import NetworkMonitor from "../../infrastructure/network/NetworkMonitor";

class ProductRepository {
  async getAll(filters = {}) {
    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (filters.is_active !== undefined) {
      query += " AND is_active = ?";
      params.push(filters.is_active ? 1 : 0);
    }

    if (filters.category) {
      query += " AND category = ?";
      params.push(filters.category);
    }

    if (filters.search) {
      query += " AND (name LIKE ? OR code LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += " ORDER BY name ASC";

    return await Database.query(query, params);
  }

  async getById(id) {
    return await Database.queryFirst("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
  }

  async getByCode(code) {
    return await Database.queryFirst("SELECT * FROM products WHERE code = ?", [
      code,
    ]);
  }

  async create(data) {
    const now = new Date().toISOString();
    const code = data.code || `PRD${Date.now()}`;

    const result = await Database.execute(
      `INSERT INTO products (code, name, description, unit, category, is_active, metadata, synced, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        code,
        data.name,
        data.description || null,
        data.unit || "kg",
        data.category || null,
        data.is_active !== false ? 1 : 0,
        data.metadata ? JSON.stringify(data.metadata) : null,
        now,
        now,
      ]
    );

    await this.addToSyncQueue("create", result.lastInsertRowId, {
      code,
      ...data,
    });

    return await this.getById(result.lastInsertRowId);
  }

  async update(id, data) {
    const now = new Date().toISOString();
    const product = await this.getById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    await Database.execute(
      `UPDATE products SET 
        name = ?, description = ?, unit = ?, category = ?, 
        is_active = ?, metadata = ?, version = version + 1, 
        synced = 0, updated_at = ?
       WHERE id = ?`,
      [
        data.name || product.name,
        data.description !== undefined ? data.description : product.description,
        data.unit || product.unit,
        data.category !== undefined ? data.category : product.category,
        data.is_active !== undefined
          ? data.is_active
            ? 1
            : 0
          : product.is_active,
        data.metadata ? JSON.stringify(data.metadata) : product.metadata,
        now,
        id,
      ]
    );

    await this.addToSyncQueue("update", id, { id: product.server_id, ...data });

    return await this.getById(id);
  }

  async delete(id) {
    const product = await this.getById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    await Database.execute("DELETE FROM products WHERE id = ?", [id]);
    await this.addToSyncQueue("delete", id, { id: product.server_id });
  }

  async addToSyncQueue(operation, entityId, data) {
    const now = new Date().toISOString();
    await Database.execute(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, payload, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      ["product", entityId, operation, JSON.stringify(data), now]
    );
  }

  async getCategories() {
    const result = await Database.query(
      "SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category"
    );
    return result.map((r) => r.category);
  }

  async getActiveProducts() {
    return await this.getAll({ is_active: true });
  }
}

export default new ProductRepository();
