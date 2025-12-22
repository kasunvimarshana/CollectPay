import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";

export type OutboxOp = {
  op_id: string;
  entity: string;
  type: "upsert" | "delete";
  id: string;
  base_version: number | null;
  payload: Record<string, any>;
  client_updated_at: string;
  created_at: string;
};

export type ConflictRow = {
  id: number;
  op_id: string;
  entity: string;
  entity_id: string;
  op_type: "upsert" | "delete" | null;
  base_version: number | null;
  client_updated_at: string | null;
  reason: string;
  server: any | null;
  client: any | null;
  created_at: string;
};

export async function enqueueOp(
  op: Omit<OutboxOp, "op_id" | "created_at">
): Promise<string> {
  const db = await getDb();
  const opId = uuidv4();
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO outbox(op_id, entity, type, id, base_version, payload_json, client_updated_at, created_at)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      opId,
      op.entity,
      op.type,
      op.id,
      op.base_version,
      JSON.stringify(op.payload ?? {}),
      op.client_updated_at,
      createdAt,
    ]
  );

  return opId;
}

export async function listOutbox(limit = 200): Promise<OutboxOp[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM outbox ORDER BY created_at ASC LIMIT ?",
    [limit]
  );
  return rows.map((r) => ({
    op_id: r.op_id,
    entity: r.entity,
    type: r.type,
    id: r.id,
    base_version: r.base_version ?? null,
    payload: JSON.parse(r.payload_json || "{}"),
    client_updated_at: r.client_updated_at,
    created_at: r.created_at,
  }));
}

export async function deleteOutboxOp(opId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM outbox WHERE op_id = ?", [opId]);
}

export async function countOutbox(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(1) as c FROM outbox"
  );
  return row?.c ?? 0;
}

export async function recordConflict(params: {
  op_id: string;
  entity: string;
  entity_id: string;
  op_type?: "upsert" | "delete";
  base_version?: number | null;
  client_updated_at?: string | null;
  reason: string;
  server?: any;
  client?: any;
}): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO conflicts(op_id, entity, entity_id, op_type, base_version, client_updated_at, reason, server_json, client_json, created_at)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.op_id,
      params.entity,
      params.entity_id,
      params.op_type ?? null,
      params.base_version ?? null,
      params.client_updated_at ?? null,
      params.reason,
      params.server ? JSON.stringify(params.server) : null,
      params.client ? JSON.stringify(params.client) : null,
      new Date().toISOString(),
    ]
  );
}

export async function listConflicts(limit = 200): Promise<ConflictRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM conflicts ORDER BY created_at DESC LIMIT ?",
    [limit]
  );

  return rows.map((r) => ({
    id: Number(r.id),
    op_id: r.op_id,
    entity: r.entity,
    entity_id: r.entity_id,
    op_type: (r.op_type as any) ?? null,
    base_version: r.base_version ?? null,
    client_updated_at: r.client_updated_at ?? null,
    reason: r.reason,
    server: r.server_json ? JSON.parse(r.server_json) : null,
    client: r.client_json ? JSON.parse(r.client_json) : null,
    created_at: r.created_at,
  }));
}

export async function deleteConflict(conflictId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM conflicts WHERE id = ?", [conflictId]);
}

export async function countConflicts(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(1) as c FROM conflicts"
  );
  return row?.c ?? 0;
}
