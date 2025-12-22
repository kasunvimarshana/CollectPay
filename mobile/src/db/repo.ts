import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import { enqueueOp } from "./outbox";

export type Supplier = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  external_code?: string | null;
  is_active: number;
  version: number;
  deleted: number;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  unit_type: "mass" | "volume";
  is_active: number;
  version: number;
  deleted: number;
  updated_at: string;
};

export type Unit = {
  id: string;
  code: string;
  name: string;
  unit_type: "mass" | "volume";
  to_base_multiplier: number;
  version: number;
  deleted: number;
  updated_at: string;
};

export type CollectionEntry = {
  id: string;
  supplier_id: string;
  product_id: string;
  unit_id: string;
  quantity: number;
  quantity_in_base: number;
  collected_at: string;
  notes?: string | null;
  version: number;
  deleted: number;
  updated_at: string;
};

export type Payment = {
  id: string;
  supplier_id: string;
  type: string;
  amount: number;
  paid_at: string;
  notes?: string | null;
  version: number;
  deleted: number;
  updated_at: string;
};

export async function listSuppliers(): Promise<Supplier[]> {
  const db = await getDb();
  return db.getAllAsync<Supplier>(
    "SELECT * FROM suppliers WHERE deleted = 0 ORDER BY name"
  );
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  const db = await getDb();
  return (
    (await db.getFirstAsync<Supplier>(
      "SELECT * FROM suppliers WHERE id = ? LIMIT 1",
      [id]
    )) ?? null
  );
}

export async function upsertSupplierLocal(
  s: Partial<Supplier> & { id: string; name: string; version: number }
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
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
      s.id,
      s.name,
      s.phone ?? null,
      s.address ?? null,
      s.external_code ?? null,
      s.is_active ?? 1,
      s.version,
      s.deleted ?? 0,
      now,
    ]
  );
}

export async function createSupplierOffline(input: {
  name: string;
  phone?: string;
  address?: string;
}): Promise<string> {
  const id = uuidv4();
  const now = new Date().toISOString();
  await upsertSupplierLocal({
    id,
    name: input.name,
    phone: input.phone ?? null,
    address: input.address ?? null,
    external_code: null,
    is_active: 1,
    version: 0,
    deleted: 0,
    updated_at: now,
  });

  await enqueueOp({
    entity: "suppliers",
    type: "upsert",
    id,
    base_version: null,
    payload: {
      id,
      name: input.name,
      phone: input.phone ?? null,
      address: input.address ?? null,
      external_code: null,
      is_active: true,
    },
    client_updated_at: now,
  });

  return id;
}

export async function listProducts(): Promise<Product[]> {
  const db = await getDb();
  return db.getAllAsync<Product>(
    "SELECT * FROM products WHERE deleted = 0 ORDER BY name"
  );
}

export async function listUnits(): Promise<Unit[]> {
  const db = await getDb();
  return db.getAllAsync<Unit>(
    "SELECT * FROM units WHERE deleted = 0 ORDER BY unit_type, code"
  );
}

export async function listCollectionsForSupplier(
  supplierId: string
): Promise<CollectionEntry[]> {
  const db = await getDb();
  return db.getAllAsync<CollectionEntry>(
    "SELECT * FROM collection_entries WHERE supplier_id = ? AND deleted = 0 ORDER BY collected_at DESC",
    [supplierId]
  );
}

export async function addCollectionOffline(input: {
  supplier_id: string;
  product_id: string;
  unit_id: string;
  quantity: number;
  collected_at: string;
  notes?: string;
}): Promise<string> {
  const db = await getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  const unit = await db.getFirstAsync<Unit>(
    "SELECT * FROM units WHERE id = ? LIMIT 1",
    [input.unit_id]
  );
  if (!unit) throw new Error("Unit not found locally. Sync first.");

  const quantityInBase = input.quantity * unit.to_base_multiplier;

  await db.runAsync(
    `INSERT INTO collection_entries(id, supplier_id, product_id, unit_id, quantity, quantity_in_base, collected_at, entered_by_user_id, notes, version, deleted, updated_at)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.supplier_id,
      input.product_id,
      input.unit_id,
      input.quantity,
      quantityInBase,
      input.collected_at,
      null,
      input.notes ?? null,
      0,
      0,
      now,
    ]
  );

  await enqueueOp({
    entity: "collection_entries",
    type: "upsert",
    id,
    base_version: null,
    payload: {
      id,
      supplier_id: input.supplier_id,
      product_id: input.product_id,
      unit_id: input.unit_id,
      quantity: input.quantity,
      collected_at: input.collected_at,
      notes: input.notes ?? null,
    },
    client_updated_at: now,
  });

  return id;
}

export async function listPaymentsForSupplier(
  supplierId: string
): Promise<Payment[]> {
  const db = await getDb();
  return db.getAllAsync<Payment>(
    "SELECT * FROM payments WHERE supplier_id = ? AND deleted = 0 ORDER BY paid_at DESC",
    [supplierId]
  );
}

export async function addPaymentOffline(input: {
  supplier_id: string;
  type: "advance" | "partial" | "final" | "adjustment";
  amount: number;
  paid_at: string;
  notes?: string;
}): Promise<string> {
  const db = await getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO payments(id, supplier_id, type, amount, paid_at, entered_by_user_id, notes, version, deleted, updated_at)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.supplier_id,
      input.type,
      input.amount,
      input.paid_at,
      null,
      input.notes ?? null,
      0,
      0,
      now,
    ]
  );

  await enqueueOp({
    entity: "payments",
    type: "upsert",
    id,
    base_version: null,
    payload: {
      id,
      supplier_id: input.supplier_id,
      type: input.type,
      amount: input.amount,
      paid_at: input.paid_at,
      notes: input.notes ?? null,
    },
    client_updated_at: now,
  });

  return id;
}
