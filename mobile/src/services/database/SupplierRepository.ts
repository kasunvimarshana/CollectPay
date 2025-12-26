import { Supplier } from "../../domain/entities";
import { SQLiteRepository } from "./index";
import { ISupplierRepository } from "../../domain/repositories";

export class SupplierRepository
  extends SQLiteRepository<Supplier>
  implements ISupplierRepository
{
  protected tableName = "suppliers";

  protected mapToEntity(row: Record<string, unknown>): Supplier {
    return {
      id: row.id as string,
      name: row.name as string,
      code: row.code as string,
      phone: row.phone as string | undefined,
      address: row.address as string | undefined,
      region: row.region as string | undefined,
      bankName: row.bank_name as string | undefined,
      bankAccount: row.bank_account as string | undefined,
      bankBranch: row.bank_branch as string | undefined,
      paymentMethod: row.payment_method as "cash" | "bank_transfer" | "cheque",
      creditLimit: row.credit_limit as number,
      currentBalance: row.current_balance as number,
      openingBalance: row.opening_balance as number,
      status: row.status as "active" | "inactive",
      collectorId: row.collector_id as string | undefined,
      ownerId: row.owner_id as string | undefined,
      syncStatus: row.sync_status as Supplier["syncStatus"],
      version: row.version as number,
      lastSyncedAt: row.last_synced_at
        ? new Date(row.last_synced_at as string)
        : undefined,
      clientId: row.client_id as string | undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
      deletedAt: row.deleted_at
        ? new Date(row.deleted_at as string)
        : undefined,
    };
  }

  protected mapToRow(entity: Partial<Supplier>): Record<string, unknown> {
    const row: Record<string, unknown> = {};

    if (entity.id !== undefined) row.id = entity.id;
    if (entity.name !== undefined) row.name = entity.name;
    if (entity.code !== undefined) row.code = entity.code;
    if (entity.phone !== undefined) row.phone = entity.phone;
    if (entity.address !== undefined) row.address = entity.address;
    if (entity.region !== undefined) row.region = entity.region;
    if (entity.bankName !== undefined) row.bank_name = entity.bankName;
    if (entity.bankAccount !== undefined) row.bank_account = entity.bankAccount;
    if (entity.bankBranch !== undefined) row.bank_branch = entity.bankBranch;
    if (entity.paymentMethod !== undefined)
      row.payment_method = entity.paymentMethod;
    if (entity.creditLimit !== undefined) row.credit_limit = entity.creditLimit;
    if (entity.currentBalance !== undefined)
      row.current_balance = entity.currentBalance;
    if (entity.openingBalance !== undefined)
      row.opening_balance = entity.openingBalance;
    if (entity.status !== undefined) row.status = entity.status;
    if (entity.collectorId !== undefined) row.collector_id = entity.collectorId;
    if (entity.ownerId !== undefined) row.owner_id = entity.ownerId;
    if (entity.syncStatus !== undefined) row.sync_status = entity.syncStatus;
    if (entity.version !== undefined) row.version = entity.version;
    if (entity.lastSyncedAt !== undefined)
      row.last_synced_at = entity.lastSyncedAt?.toISOString();
    if (entity.clientId !== undefined) row.client_id = entity.clientId;
    if (entity.createdAt !== undefined)
      row.created_at = entity.createdAt.toISOString();
    if (entity.updatedAt !== undefined)
      row.updated_at = entity.updatedAt.toISOString();
    if (entity.deletedAt !== undefined)
      row.deleted_at = entity.deletedAt?.toISOString();

    return row;
  }

  async findByRegion(region: string): Promise<Supplier[]> {
    return this.findAll({ where: { region } });
  }

  async findByCollector(collectorId: string): Promise<Supplier[]> {
    return this.findAll({ where: { collectorId } });
  }

  async calculateBalance(supplierId: string): Promise<number> {
    const db = this.db;

    // Get opening balance
    const supplier = await this.findById(supplierId);
    if (!supplier) return 0;

    let balance = supplier.openingBalance;

    // Add confirmed collections
    const collections = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(net_amount), 0) as total 
       FROM collections 
       WHERE supplier_id = ? AND status = 'confirmed' AND deleted_at IS NULL`,
      [supplierId]
    );
    balance += collections?.total ?? 0;

    // Subtract completed payments
    const payments = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM payments 
       WHERE supplier_id = ? AND status = 'completed' AND deleted_at IS NULL`,
      [supplierId]
    );
    balance -= payments?.total ?? 0;

    return balance;
  }

  async applyServerChanges(changes: Supplier[]): Promise<void> {
    for (const change of changes) {
      const existing = await this.findById(change.id);

      if (existing) {
        // Update existing record
        await this.db.runAsync(
          `UPDATE suppliers SET 
            name = ?, code = ?, phone = ?, address = ?, region = ?,
            bank_name = ?, bank_account = ?, bank_branch = ?, payment_method = ?,
            credit_limit = ?, current_balance = ?, opening_balance = ?, status = ?,
            collector_id = ?, owner_id = ?, sync_status = 'synced', version = ?,
            last_synced_at = ?, updated_at = ?, deleted_at = ?
           WHERE id = ?`,
          [
            change.name,
            change.code,
            change.phone,
            change.address,
            change.region,
            change.bankName,
            change.bankAccount,
            change.bankBranch,
            change.paymentMethod,
            change.creditLimit,
            change.currentBalance,
            change.openingBalance,
            change.status,
            change.collectorId,
            change.ownerId,
            change.version,
            new Date().toISOString(),
            change.updatedAt.toISOString(),
            change.deletedAt?.toISOString() ?? null,
            change.id,
          ]
        );
      } else {
        // Insert new record
        const row = this.mapToRow({
          ...change,
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
        const columns = Object.keys(row);
        const placeholders = columns.map(() => "?").join(", ");
        await this.db.runAsync(
          `INSERT INTO suppliers (${columns.join(
            ", "
          )}) VALUES (${placeholders})`,
          Object.values(row)
        );
      }
    }
  }

  async getLastSyncTimestamp(): Promise<Date | null> {
    const result = await this.db.getFirstAsync<{ last_synced_at: string }>(
      `SELECT MAX(last_synced_at) as last_synced_at FROM suppliers WHERE sync_status = 'synced'`
    );
    return result?.last_synced_at ? new Date(result.last_synced_at) : null;
  }
}

export const supplierRepository = new SupplierRepository();
