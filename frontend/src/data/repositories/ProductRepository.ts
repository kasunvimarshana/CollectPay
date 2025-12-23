import { DatabaseService } from '../local/DatabaseService';
import { Product } from '../../domain/entities';

export class ProductRepository {
  private static instance: ProductRepository;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): ProductRepository {
    if (!ProductRepository.instance) {
      ProductRepository.instance = new ProductRepository();
    }
    return ProductRepository.instance;
  }

  public async getAll(): Promise<Product[]> {
    const rows = await this.db.query(
      'SELECT * FROM products WHERE is_active = 1 ORDER BY name'
    );
    return rows.map(this.mapRowToProduct);
  }

  public async getById(id: number): Promise<Product | null> {
    const row = await this.db.queryFirst('SELECT * FROM products WHERE id = ?', [id]);
    return row ? this.mapRowToProduct(row) : null;
  }

  public async getByCode(code: string): Promise<Product | null> {
    const row = await this.db.queryFirst('SELECT * FROM products WHERE code = ?', [code]);
    return row ? this.mapRowToProduct(row) : null;
  }

  public async getByCategory(category: string): Promise<Product[]> {
    const rows = await this.db.query(
      'SELECT * FROM products WHERE category = ? AND is_active = 1 ORDER BY name',
      [category]
    );
    return rows.map(this.mapRowToProduct);
  }

  public async search(query: string): Promise<Product[]> {
    const rows = await this.db.query(
      'SELECT * FROM products WHERE (name LIKE ? OR code LIKE ?) AND is_active = 1 ORDER BY name',
      [`%${query}%`, `%${query}%`]
    );
    return rows.map(this.mapRowToProduct);
  }

  public async getCurrentRate(productId: number, supplierId?: number, date?: string): Promise<any | null> {
    const checkDate = date || new Date().toISOString().split('T')[0];
    
    let query = `
      SELECT * FROM rates 
      WHERE product_id = ? 
        AND is_active = 1 
        AND effective_from <= ? 
        AND (effective_to IS NULL OR effective_to >= ?)
    `;
    const params: any[] = [productId, checkDate, checkDate];

    if (supplierId) {
      query += ' AND supplier_id = ?';
      params.push(supplierId);
    } else {
      query += ' AND supplier_id IS NULL';
    }

    query += ' ORDER BY effective_from DESC LIMIT 1';

    return await this.db.queryFirst(query, params);
  }

  public async create(product: Omit<Product, 'id' | 'version' | 'created_at' | 'updated_at'>): Promise<Product> {
    const now = new Date().toISOString();
    
    const result = await this.db.execute(
      `INSERT INTO products (code, name, description, unit, category, metadata, is_active, version, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        product.code,
        product.name,
        product.description || null,
        product.unit,
        product.category || null,
        product.metadata ? JSON.stringify(product.metadata) : null,
        product.is_active ? 1 : 0,
        now,
        now,
      ]
    );

    await this.addToSyncQueue('create', result.lastInsertRowId!, product);
    const created = await this.getById(result.lastInsertRowId!);
    return created!;
  }

  public async update(id: number, product: Partial<Product>): Promise<Product> {
    const now = new Date().toISOString();
    const existing = await this.getById(id);
    
    if (!existing) {
      throw new Error('Product not found');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (product.code !== undefined) {
      updates.push('code = ?');
      params.push(product.code);
    }
    if (product.name !== undefined) {
      updates.push('name = ?');
      params.push(product.name);
    }
    if (product.description !== undefined) {
      updates.push('description = ?');
      params.push(product.description);
    }
    if (product.unit !== undefined) {
      updates.push('unit = ?');
      params.push(product.unit);
    }
    if (product.category !== undefined) {
      updates.push('category = ?');
      params.push(product.category);
    }
    if (product.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(product.is_active ? 1 : 0);
    }

    updates.push('version = version + 1');
    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    await this.db.execute(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    await this.addToSyncQueue('update', id, { ...existing, ...product });
    const updated = await this.getById(id);
    return updated!;
  }

  public async delete(id: number): Promise<void> {
    const product = await this.getById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    await this.db.execute('DELETE FROM products WHERE id = ?', [id]);
    await this.addToSyncQueue('delete', id, product);
  }

  private async addToSyncQueue(operation: string, entityId: number, data: any): Promise<void> {
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, payload, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      ['products', entityId, operation, JSON.stringify(data), now, now]
    );
  }

  private mapRowToProduct(row: any): Product {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      unit: row.unit,
      category: row.category,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      is_active: row.is_active === 1,
      version: row.version,
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_sync_at: row.last_sync_at,
    };
  }
}
