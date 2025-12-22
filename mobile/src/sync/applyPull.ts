import { getDb } from "../db/db";

function toIntBool(v: any): number {
  if (v === true) return 1;
  if (v === false) return 0;
  if (v === 1 || v === 0) return v;
  if (typeof v === "string") {
    if (v === "1") return 1;
    if (v === "0") return 0;
    if (v.toLowerCase() === "true") return 1;
    if (v.toLowerCase() === "false") return 0;
  }
  return v ? 1 : 0;
}

function toNumber(v: any): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function pickUpdatedAt(payload: any, changedAt: string | null): string {
  return (
    payload?.updated_at ??
    payload?.updatedAt ??
    changedAt ??
    new Date().toISOString()
  );
}

export type PullChange = {
  model: string;
  model_id: string;
  operation: "upsert" | "delete";
  version: number;
  payload: any;
  changed_at: string | null;
};

export async function applyPullChanges(changes: PullChange[]): Promise<void> {
  const db = await getDb();
  for (const c of changes) {
    const model = c.model;
    const id = c.model_id;

    if (model === "suppliers") {
      if (c.operation === "delete") {
        await db.runAsync(
          "UPDATE suppliers SET deleted = 1, version = ?, updated_at = ? WHERE id = ?",
          [c.version, c.changed_at ?? new Date().toISOString(), id]
        );
        continue;
      }

      const p = c.payload ?? {};
      await db.runAsync(
        `INSERT INTO suppliers(id, name, phone, address, external_code, is_active, version, deleted, updated_at)
         VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name,
           phone=excluded.phone,
           address=excluded.address,
           external_code=excluded.external_code,
           is_active=excluded.is_active,
           version=excluded.version,
           deleted=excluded.deleted,
           updated_at=excluded.updated_at`,
        [
          id,
          p.name ?? "",
          p.phone ?? null,
          p.address ?? null,
          p.external_code ?? null,
          toIntBool(p.is_active ?? 1),
          c.version,
          p.deleted_at ? 1 : 0,
          pickUpdatedAt(p, c.changed_at),
        ]
      );
      continue;
    }

    if (model === "products") {
      if (c.operation === "delete") {
        await db.runAsync(
          "UPDATE products SET deleted = 1, version = ?, updated_at = ? WHERE id = ?",
          [c.version, c.changed_at ?? new Date().toISOString(), id]
        );
        continue;
      }
      const p = c.payload ?? {};
      await db.runAsync(
        `INSERT INTO products(id, name, unit_type, is_active, version, deleted, updated_at)
         VALUES(?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name,
           unit_type=excluded.unit_type,
           is_active=excluded.is_active,
           version=excluded.version,
           deleted=excluded.deleted,
           updated_at=excluded.updated_at`,
        [
          id,
          p.name ?? "",
          p.unit_type ?? "mass",
          toIntBool(p.is_active ?? 1),
          c.version,
          p.deleted_at ? 1 : 0,
          pickUpdatedAt(p, c.changed_at),
        ]
      );
      continue;
    }

    if (model === "units") {
      if (c.operation === "delete") {
        await db.runAsync(
          "UPDATE units SET deleted = 1, version = ?, updated_at = ? WHERE id = ?",
          [c.version, c.changed_at ?? new Date().toISOString(), id]
        );
        continue;
      }
      const p = c.payload ?? {};
      await db.runAsync(
        `INSERT INTO units(id, code, name, unit_type, to_base_multiplier, version, deleted, updated_at)
         VALUES(?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           code=excluded.code,
           name=excluded.name,
           unit_type=excluded.unit_type,
           to_base_multiplier=excluded.to_base_multiplier,
           version=excluded.version,
           deleted=excluded.deleted,
           updated_at=excluded.updated_at`,
        [
          id,
          p.code ?? "",
          p.name ?? "",
          p.unit_type ?? "mass",
          toNumber(p.to_base_multiplier),
          c.version,
          p.deleted_at ? 1 : 0,
          pickUpdatedAt(p, c.changed_at),
        ]
      );
      continue;
    }

    if (model === "collection_entries") {
      if (c.operation === "delete") {
        await db.runAsync(
          "UPDATE collection_entries SET deleted = 1, version = ?, updated_at = ? WHERE id = ?",
          [c.version, c.changed_at ?? new Date().toISOString(), id]
        );
        continue;
      }
      const p = c.payload ?? {};
      await db.runAsync(
        `INSERT INTO collection_entries(id, supplier_id, product_id, unit_id, quantity, quantity_in_base, collected_at, entered_by_user_id, notes, version, deleted, updated_at)
         VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           supplier_id=excluded.supplier_id,
           product_id=excluded.product_id,
           unit_id=excluded.unit_id,
           quantity=excluded.quantity,
           quantity_in_base=excluded.quantity_in_base,
           collected_at=excluded.collected_at,
           entered_by_user_id=excluded.entered_by_user_id,
           notes=excluded.notes,
           version=excluded.version,
           deleted=excluded.deleted,
           updated_at=excluded.updated_at`,
        [
          id,
          p.supplier_id,
          p.product_id,
          p.unit_id,
          toNumber(p.quantity),
          toNumber(p.quantity_in_base),
          p.collected_at,
          p.entered_by_user_id ?? null,
          p.notes ?? null,
          c.version,
          p.deleted_at ? 1 : 0,
          pickUpdatedAt(p, c.changed_at),
        ]
      );
      continue;
    }

    if (model === "rates") {
      if (c.operation === "delete") {
        await db.runAsync(
          "UPDATE rates SET deleted = 1, version = ?, updated_at = ? WHERE id = ?",
          [c.version, c.changed_at ?? new Date().toISOString(), id]
        );
        continue;
      }
      const p = c.payload ?? {};
      await db.runAsync(
        `INSERT INTO rates(id, product_id, rate_per_base, effective_from, effective_to, set_by_user_id, version, deleted, updated_at)
         VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           product_id=excluded.product_id,
           rate_per_base=excluded.rate_per_base,
           effective_from=excluded.effective_from,
           effective_to=excluded.effective_to,
           set_by_user_id=excluded.set_by_user_id,
           version=excluded.version,
           deleted=excluded.deleted,
           updated_at=excluded.updated_at`,
        [
          id,
          p.product_id,
          toNumber(p.rate_per_base),
          p.effective_from,
          p.effective_to ?? null,
          p.set_by_user_id ?? null,
          c.version,
          p.deleted_at ? 1 : 0,
          pickUpdatedAt(p, c.changed_at),
        ]
      );
      continue;
    }

    if (model === "payments") {
      if (c.operation === "delete") {
        await db.runAsync(
          "UPDATE payments SET deleted = 1, version = ?, updated_at = ? WHERE id = ?",
          [c.version, c.changed_at ?? new Date().toISOString(), id]
        );
        continue;
      }
      const p = c.payload ?? {};
      await db.runAsync(
        `INSERT INTO payments(id, supplier_id, type, amount, paid_at, entered_by_user_id, notes, version, deleted, updated_at)
         VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           supplier_id=excluded.supplier_id,
           type=excluded.type,
           amount=excluded.amount,
           paid_at=excluded.paid_at,
           entered_by_user_id=excluded.entered_by_user_id,
           notes=excluded.notes,
           version=excluded.version,
           deleted=excluded.deleted,
           updated_at=excluded.updated_at`,
        [
          id,
          p.supplier_id,
          p.type,
          toNumber(p.amount),
          p.paid_at,
          p.entered_by_user_id ?? null,
          p.notes ?? null,
          c.version,
          p.deleted_at ? 1 : 0,
          pickUpdatedAt(p, c.changed_at),
        ]
      );
      continue;
    }

    // Unknown model: ignore.
  }
}
