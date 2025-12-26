import { Payment, Collection } from "../../domain/entities";
import { SQLiteRepository } from "./index";
import {
  IPaymentRepository,
  SettlementCalculation,
  QueryOptions,
} from "../../domain/repositories";

export class PaymentRepository
  extends SQLiteRepository<Payment>
  implements IPaymentRepository
{
  protected tableName = "payments";

  protected mapToEntity(row: Record<string, unknown>): Payment {
    return {
      id: row.id as string,
      supplierId: row.supplier_id as string,
      paymentType: row.payment_type as Payment["paymentType"],
      paymentMethod: row.payment_method as Payment["paymentMethod"],
      amount: row.amount as number,
      settlementPeriodStart: row.settlement_period_start
        ? new Date(row.settlement_period_start as string)
        : undefined,
      settlementPeriodEnd: row.settlement_period_end
        ? new Date(row.settlement_period_end as string)
        : undefined,
      totalCollectionAmount: row.total_collection_amount as number | undefined,
      totalDeductions: row.total_deductions as number | undefined,
      previousBalance: row.previous_balance as number | undefined,
      advances: row.advances as number | undefined,
      calculatedAmount: row.calculated_amount as number | undefined,
      referenceNumber: row.reference_number as string | undefined,
      paidAt: row.paid_at ? new Date(row.paid_at as string) : undefined,
      approvedBy: row.approved_by as string | undefined,
      approvedAt: row.approved_at
        ? new Date(row.approved_at as string)
        : undefined,
      status: row.status as Payment["status"],
      notes: row.notes as string | undefined,
      syncStatus: row.sync_status as Payment["syncStatus"],
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

  protected mapToRow(entity: Partial<Payment>): Record<string, unknown> {
    const row: Record<string, unknown> = {};

    if (entity.id !== undefined) row.id = entity.id;
    if (entity.supplierId !== undefined) row.supplier_id = entity.supplierId;
    if (entity.paymentType !== undefined) row.payment_type = entity.paymentType;
    if (entity.paymentMethod !== undefined)
      row.payment_method = entity.paymentMethod;
    if (entity.amount !== undefined) row.amount = entity.amount;
    if (entity.settlementPeriodStart !== undefined)
      row.settlement_period_start = entity.settlementPeriodStart?.toISOString();
    if (entity.settlementPeriodEnd !== undefined)
      row.settlement_period_end = entity.settlementPeriodEnd?.toISOString();
    if (entity.totalCollectionAmount !== undefined)
      row.total_collection_amount = entity.totalCollectionAmount;
    if (entity.totalDeductions !== undefined)
      row.total_deductions = entity.totalDeductions;
    if (entity.previousBalance !== undefined)
      row.previous_balance = entity.previousBalance;
    if (entity.advances !== undefined) row.advances = entity.advances;
    if (entity.calculatedAmount !== undefined)
      row.calculated_amount = entity.calculatedAmount;
    if (entity.referenceNumber !== undefined)
      row.reference_number = entity.referenceNumber;
    if (entity.paidAt !== undefined) row.paid_at = entity.paidAt?.toISOString();
    if (entity.approvedBy !== undefined) row.approved_by = entity.approvedBy;
    if (entity.approvedAt !== undefined)
      row.approved_at = entity.approvedAt?.toISOString();
    if (entity.status !== undefined) row.status = entity.status;
    if (entity.notes !== undefined) row.notes = entity.notes;
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

  async findBySupplier(
    supplierId: string,
    options?: QueryOptions
  ): Promise<Payment[]> {
    return this.findAll({
      ...options,
      where: { ...options?.where, supplierId },
    });
  }

  async calculateSettlement(
    supplierId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SettlementCalculation> {
    // Get confirmed collections in date range
    const collectionsResult = await this.db.getAllAsync<
      Record<string, unknown>
    >(
      `SELECT * FROM collections 
       WHERE supplier_id = ? 
         AND collected_at >= ? 
         AND collected_at <= ? 
         AND status = 'confirmed' 
         AND deleted_at IS NULL
       ORDER BY collected_at ASC`,
      [supplierId, startDate.toISOString(), endDate.toISOString()]
    );

    const collections = collectionsResult.map((row) => ({
      id: row.id as string,
      supplierId: row.supplier_id as string,
      productId: row.product_id as string,
      collectorId: row.collector_id as string,
      collectedAt: new Date(row.collected_at as string),
      quantity: row.quantity as number,
      unit: row.unit as string,
      quantityInBaseUnit: row.quantity_in_base_unit as number,
      rateAtCollection: row.rate_at_collection as number,
      grossAmount: row.gross_amount as number,
      deductions: row.deductions as number,
      netAmount: row.net_amount as number,
      status: row.status as Collection["status"],
      notes: row.notes as string | undefined,
      syncStatus: row.sync_status as Collection["syncStatus"],
      version: row.version as number,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    })) as Collection[];

    // Get advances (completed advance payments before end date)
    const advancesResult = await this.db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM payments 
       WHERE supplier_id = ? 
         AND payment_type = 'advance' 
         AND status = 'completed' 
         AND paid_at <= ?
         AND deleted_at IS NULL
       ORDER BY paid_at ASC`,
      [supplierId, endDate.toISOString()]
    );

    const advances = advancesResult.map((row) => this.mapToEntity(row));

    // Calculate totals
    const totalCollections = collections.reduce(
      (sum, c) => sum + c.netAmount,
      0
    );
    const totalDeductions = collections.reduce(
      (sum, c) => sum + c.deductions,
      0
    );
    const advancesPaid = advances.reduce((sum, a) => sum + a.amount, 0);

    // Get previous balance (opening balance + unsettled previous amount)
    const supplierResult = await this.db.getFirstAsync<{
      opening_balance: number;
    }>(`SELECT opening_balance FROM suppliers WHERE id = ?`, [supplierId]);
    const previousBalance = supplierResult?.opening_balance ?? 0;

    const netPayable = totalCollections - advancesPaid + previousBalance;

    return {
      totalCollections,
      totalDeductions,
      previousBalance,
      advancesPaid,
      netPayable,
      collections,
      advances,
    };
  }

  async applyServerChanges(changes: Payment[]): Promise<void> {
    for (const change of changes) {
      const existing = await this.findById(change.id);

      if (existing) {
        const row = this.mapToRow({
          ...change,
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
        const setClauses = Object.keys(row)
          .filter((k) => k !== "id")
          .map((k) => `${k} = ?`)
          .join(", ");
        const values = Object.entries(row)
          .filter(([k]) => k !== "id")
          .map(([, v]) => v);

        await this.db.runAsync(
          `UPDATE payments SET ${setClauses} WHERE id = ?`,
          [...values, change.id]
        );
      } else {
        const row = this.mapToRow({
          ...change,
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
        const columns = Object.keys(row);
        const placeholders = columns.map(() => "?").join(", ");
        await this.db.runAsync(
          `INSERT INTO payments (${columns.join(
            ", "
          )}) VALUES (${placeholders})`,
          Object.values(row)
        );
      }
    }
  }

  async getLastSyncTimestamp(): Promise<Date | null> {
    const result = await this.db.getFirstAsync<{ last_synced_at: string }>(
      `SELECT MAX(last_synced_at) as last_synced_at FROM payments WHERE sync_status = 'synced'`
    );
    return result?.last_synced_at ? new Date(result.last_synced_at) : null;
  }
}

export const paymentRepository = new PaymentRepository();
