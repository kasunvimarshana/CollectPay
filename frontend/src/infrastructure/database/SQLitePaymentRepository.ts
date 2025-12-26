import { Payment } from '../../domain/entities';
import { PaymentRepository } from '../../domain/repositories';
import { Database } from '../database/Database';

export class SQLitePaymentRepository implements PaymentRepository {
  async findById(id: string): Promise<Payment | null> {
    const db = await Database.getInstance();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM payments WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    return result ? this.mapToEntity(result) : null;
  }

  async findAll(): Promise<Payment[]> {
    const db = await Database.getInstance();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM payments WHERE deleted_at IS NULL ORDER BY payment_date DESC'
    );

    return results.map(row => this.mapToEntity(row));
  }

  async findBySupplierId(supplierId: string): Promise<Payment[]> {
    const db = await Database.getInstance();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM payments WHERE supplier_id = ? AND deleted_at IS NULL ORDER BY payment_date DESC',
      [supplierId]
    );

    return results.map(row => this.mapToEntity(row));
  }

  async save(payment: Payment): Promise<void> {
    const db = await Database.getInstance();
    
    await db.runAsync(
      `INSERT OR REPLACE INTO payments 
       (id, supplier_id, amount, type, payment_date, notes, reference_number, 
        user_id, idempotency_key, version, sync_status, sync_error, 
        created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment.id,
        payment.supplierId,
        payment.amount,
        payment.type,
        payment.paymentDate,
        payment.notes || null,
        payment.referenceNumber || null,
        payment.userId,
        payment.idempotencyKey,
        payment.version,
        payment.syncStatus || 'pending',
        payment.syncError || null,
        payment.createdAt,
        payment.updatedAt,
        payment.deletedAt || null,
      ]
    );
  }

  async saveBatch(payments: Payment[]): Promise<void> {
    const db = await Database.getInstance();
    
    for (const payment of payments) {
      await this.save(payment);
    }
  }

  async delete(id: string): Promise<void> {
    const db = await Database.getInstance();
    const now = new Date().toISOString();
    
    await db.runAsync(
      'UPDATE payments SET deleted_at = ?, sync_status = ? WHERE id = ?',
      [now, 'pending', id]
    );
  }

  async getUnsyncedChanges(): Promise<Payment[]> {
    const db = await Database.getInstance();
    const results = await db.getAllAsync<any>(
      "SELECT * FROM payments WHERE sync_status = 'pending' ORDER BY created_at ASC"
    );

    return results.map(row => this.mapToEntity(row));
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await Database.getInstance();
    
    await db.runAsync(
      "UPDATE payments SET sync_status = 'synced', sync_error = NULL WHERE id = ?",
      [id]
    );
  }

  private mapToEntity(row: any): Payment {
    return {
      id: row.id,
      supplierId: row.supplier_id,
      amount: row.amount,
      type: row.type as 'advance' | 'partial' | 'final',
      paymentDate: row.payment_date,
      notes: row.notes,
      referenceNumber: row.reference_number,
      userId: row.user_id,
      idempotencyKey: row.idempotency_key,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      syncStatus: row.sync_status as 'pending' | 'synced' | 'conflict' | 'error',
      syncError: row.sync_error,
    };
  }
}
