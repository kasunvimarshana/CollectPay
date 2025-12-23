import { DatabaseService } from '../local/DatabaseService';
import { Supplier } from '../../domain/entities';
import * as Crypto from 'expo-crypto';

export class SupplierRepository {
  private static instance: SupplierRepository;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): SupplierRepository {
    if (!SupplierRepository.instance) {
      SupplierRepository.instance = new SupplierRepository();
    }
    return SupplierRepository.instance;
  }

  public async getAll(): Promise<Supplier[]> {
    const rows = await this.db.query(
      'SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name'
    );
    return rows.map(this.mapRowToSupplier);
  }

  public async getById(id: number): Promise<Supplier | null> {
    const row = await this.db.queryFirst('SELECT * FROM suppliers WHERE id = ?', [id]);
    return row ? this.mapRowToSupplier(row) : null;
  }

  public async getByCode(code: string): Promise<Supplier | null> {
    const row = await this.db.queryFirst('SELECT * FROM suppliers WHERE code = ?', [code]);
    return row ? this.mapRowToSupplier(row) : null;
  }

  public async search(query: string): Promise<Supplier[]> {
    const rows = await this.db.query(
      'SELECT * FROM suppliers WHERE (name LIKE ? OR code LIKE ? OR phone LIKE ?) AND is_active = 1 ORDER BY name',
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows.map(this.mapRowToSupplier);
  }

  public async create(supplier: Omit<Supplier, 'id' | 'version' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const now = new Date().toISOString();
    
    const result = await this.db.execute(
      `INSERT INTO suppliers (code, name, address, phone, email, credit_limit, current_balance, 
       metadata, is_active, version, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        supplier.code,
        supplier.name,
        supplier.address || null,
        supplier.phone || null,
        supplier.email || null,
        supplier.credit_limit,
        supplier.current_balance,
        supplier.metadata ? JSON.stringify(supplier.metadata) : null,
        supplier.is_active ? 1 : 0,
        now,
        now,
      ]
    );

    // Add to sync queue
    await this.addToSyncQueue('create', result.lastInsertRowId!, supplier);

    const created = await this.getById(result.lastInsertRowId!);
    return created!;
  }

  public async update(id: number, supplier: Partial<Supplier>): Promise<Supplier> {
    const now = new Date().toISOString();
    const existing = await this.getById(id);
    
    if (!existing) {
      throw new Error('Supplier not found');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (supplier.code !== undefined) {
      updates.push('code = ?');
      params.push(supplier.code);
    }
    if (supplier.name !== undefined) {
      updates.push('name = ?');
      params.push(supplier.name);
    }
    if (supplier.address !== undefined) {
      updates.push('address = ?');
      params.push(supplier.address);
    }
    if (supplier.phone !== undefined) {
      updates.push('phone = ?');
      params.push(supplier.phone);
    }
    if (supplier.email !== undefined) {
      updates.push('email = ?');
      params.push(supplier.email);
    }
    if (supplier.credit_limit !== undefined) {
      updates.push('credit_limit = ?');
      params.push(supplier.credit_limit);
    }
    if (supplier.current_balance !== undefined) {
      updates.push('current_balance = ?');
      params.push(supplier.current_balance);
    }
    if (supplier.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(supplier.is_active ? 1 : 0);
    }

    updates.push('version = version + 1');
    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    await this.db.execute(
      `UPDATE suppliers SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Add to sync queue
    await this.addToSyncQueue('update', id, { ...existing, ...supplier });

    const updated = await this.getById(id);
    return updated!;
  }

  public async delete(id: number): Promise<void> {
    const supplier = await this.getById(id);
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    await this.db.execute('DELETE FROM suppliers WHERE id = ?', [id]);
    
    // Add to sync queue
    await this.addToSyncQueue('delete', id, supplier);
  }

  private async addToSyncQueue(operation: string, entityId: number, data: any): Promise<void> {
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, payload, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      ['suppliers', entityId, operation, JSON.stringify(data), now, now]
    );
  }

  private mapRowToSupplier(row: any): Supplier {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      address: row.address,
      phone: row.phone,
      email: row.email,
      credit_limit: parseFloat(row.credit_limit),
      current_balance: parseFloat(row.current_balance),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      is_active: row.is_active === 1,
      version: row.version,
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_sync_at: row.last_sync_at,
    };
  }
}
