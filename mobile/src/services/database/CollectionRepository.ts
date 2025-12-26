import { Collection } from "../../domain/entities";
import { SQLiteRepository } from "./index";
import {
  ICollectionRepository,
  CollectionSummary,
  CollectionSummaryFilter,
  QueryOptions,
} from "../../domain/repositories";

export class CollectionRepository
  extends SQLiteRepository<Collection>
  implements ICollectionRepository
{
  protected tableName = "collections";

  protected mapToEntity(row: Record<string, unknown>): Collection {
    return {
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

  protected mapToRow(entity: Partial<Collection>): Record<string, unknown> {
    const row: Record<string, unknown> = {};

    if (entity.id !== undefined) row.id = entity.id;
    if (entity.supplierId !== undefined) row.supplier_id = entity.supplierId;
    if (entity.productId !== undefined) row.product_id = entity.productId;
    if (entity.collectorId !== undefined) row.collector_id = entity.collectorId;
    if (entity.collectedAt !== undefined)
      row.collected_at = entity.collectedAt.toISOString();
    if (entity.quantity !== undefined) row.quantity = entity.quantity;
    if (entity.unit !== undefined) row.unit = entity.unit;
    if (entity.quantityInBaseUnit !== undefined)
      row.quantity_in_base_unit = entity.quantityInBaseUnit;
    if (entity.rateAtCollection !== undefined)
      row.rate_at_collection = entity.rateAtCollection;
    if (entity.grossAmount !== undefined) row.gross_amount = entity.grossAmount;
    if (entity.deductions !== undefined) row.deductions = entity.deductions;
    if (entity.netAmount !== undefined) row.net_amount = entity.netAmount;
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
  ): Promise<Collection[]> {
    return this.findAll({
      ...options,
      where: { ...options?.where, supplierId },
    });
  }

  async findByCollector(
    collectorId: string,
    options?: QueryOptions
  ): Promise<Collection[]> {
    return this.findAll({
      ...options,
      where: { ...options?.where, collectorId },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Collection[]> {
    const results = await this.db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM collections 
       WHERE collected_at >= ? AND collected_at <= ? AND deleted_at IS NULL
       ORDER BY collected_at DESC`,
      [startDate.toISOString(), endDate.toISOString()]
    );
    return results.map((row) => this.mapToEntity(row));
  }

  async getSummary(
    filter: CollectionSummaryFilter
  ): Promise<CollectionSummary> {
    let query = `
      SELECT 
        product_id,
        SUM(quantity_in_base_unit) as total_quantity,
        SUM(net_amount) as total_amount,
        COUNT(*) as count
      FROM collections 
      WHERE deleted_at IS NULL AND status != 'cancelled'
    `;
    const params: unknown[] = [];

    if (filter.supplierId) {
      query += ` AND supplier_id = ?`;
      params.push(filter.supplierId);
    }
    if (filter.collectorId) {
      query += ` AND collector_id = ?`;
      params.push(filter.collectorId);
    }
    if (filter.productId) {
      query += ` AND product_id = ?`;
      params.push(filter.productId);
    }
    if (filter.startDate) {
      query += ` AND collected_at >= ?`;
      params.push(filter.startDate.toISOString());
    }
    if (filter.endDate) {
      query += ` AND collected_at <= ?`;
      params.push(filter.endDate.toISOString());
    }

    query += ` GROUP BY product_id`;

    const results = await this.db.getAllAsync<{
      product_id: string;
      total_quantity: number;
      total_amount: number;
      count: number;
    }>(query, params);

    const byProduct = results.map((r) => ({
      productId: r.product_id,
      quantity: r.total_quantity,
      amount: r.total_amount,
    }));

    return {
      totalQuantity: byProduct.reduce((sum, p) => sum + p.quantity, 0),
      totalAmount: byProduct.reduce((sum, p) => sum + p.amount, 0),
      count: results.reduce((sum, r) => sum + r.count, 0),
      byProduct,
    };
  }

  async applyServerChanges(changes: Collection[]): Promise<void> {
    for (const change of changes) {
      const existing = await this.findById(change.id);

      if (existing) {
        await this.db.runAsync(
          `UPDATE collections SET 
            supplier_id = ?, product_id = ?, collector_id = ?, collected_at = ?,
            quantity = ?, unit = ?, quantity_in_base_unit = ?, rate_at_collection = ?,
            gross_amount = ?, deductions = ?, net_amount = ?, status = ?, notes = ?,
            sync_status = 'synced', version = ?, last_synced_at = ?, updated_at = ?, deleted_at = ?
           WHERE id = ?`,
          [
            change.supplierId,
            change.productId,
            change.collectorId,
            change.collectedAt.toISOString(),
            change.quantity,
            change.unit,
            change.quantityInBaseUnit,
            change.rateAtCollection,
            change.grossAmount,
            change.deductions,
            change.netAmount,
            change.status,
            change.notes,
            change.version,
            new Date().toISOString(),
            change.updatedAt.toISOString(),
            change.deletedAt?.toISOString() ?? null,
            change.id,
          ]
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
          `INSERT INTO collections (${columns.join(
            ", "
          )}) VALUES (${placeholders})`,
          Object.values(row)
        );
      }
    }
  }

  async getLastSyncTimestamp(): Promise<Date | null> {
    const result = await this.db.getFirstAsync<{ last_synced_at: string }>(
      `SELECT MAX(last_synced_at) as last_synced_at FROM collections WHERE sync_status = 'synced'`
    );
    return result?.last_synced_at ? new Date(result.last_synced_at) : null;
  }
}

export const collectionRepository = new CollectionRepository();
