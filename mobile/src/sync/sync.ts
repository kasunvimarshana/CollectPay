import { getMeta, setMeta } from "../db/db";
import {
  countConflicts,
  deleteOutboxOp,
  listOutbox,
  recordConflict,
} from "../db/outbox";
import { getToken } from "../storage/auth";
import { applyPullChanges } from "./applyPull";
import { postSync } from "./api";

export type SyncSummary = {
  didSync: boolean;
  pushed: number;
  pulled: number;
  cursor: number;
  conflicts: number;
};

export async function syncOnce(params?: {
  pushLimit?: number;
  conflictStrategy?: "server_wins" | "client_wins";
}): Promise<SyncSummary> {
  const token = await getToken();
  if (!token) {
    return { didSync: false, pushed: 0, pulled: 0, cursor: 0, conflicts: 0 };
  }

  const pushLimit = params?.pushLimit ?? 100;
  const conflictStrategy = params?.conflictStrategy ?? "server_wins";

  const cursorStr = await getMeta("cursor");
  const cursor = cursorStr ? Number(cursorStr) : 0;

  const ops = await listOutbox(pushLimit);

  const resp = await postSync({
    cursor: Number.isFinite(cursor) ? cursor : 0,
    ops: ops.map((o) => ({
      op_id: o.op_id,
      entity: o.entity,
      type: o.type,
      id: o.id,
      base_version: o.base_version,
      payload: o.payload,
      client_updated_at: o.client_updated_at,
    })),
    conflict_strategy: conflictStrategy,
  });

  // Reconcile push results.
  const appliedByOpId = new Map<string, any>();
  for (const a of resp.applied ?? []) {
    if (a?.op_id) appliedByOpId.set(a.op_id, a);
  }

  let pushed = 0;
  for (const op of ops) {
    const result = appliedByOpId.get(op.op_id);
    if (!result) continue;

    if (result.status === "applied" || result.status === "skipped") {
      await deleteOutboxOp(op.op_id);
      if (result.status === "applied") pushed += 1;
      continue;
    }

    if (result.status === "conflict") {
      await recordConflict({
        op_id: op.op_id,
        entity: op.entity,
        entity_id: op.id,
        op_type: op.type,
        base_version: op.base_version,
        client_updated_at: op.client_updated_at,
        reason: result?.conflict?.reason ?? "conflict",
        server: result?.conflict?.server,
        client: result?.conflict?.client ?? op.payload,
      });
      // Remove from outbox so we don't loop forever; resolution can create a new op.
      await deleteOutboxOp(op.op_id);
    }
  }

  // Apply pull.
  const pullChanges = resp.pull?.changes ?? [];
  await applyPullChanges(
    pullChanges.map((c) => ({
      model: c.model,
      model_id: c.model_id,
      operation: c.operation,
      version: c.version,
      payload: c.payload,
      changed_at: c.changed_at,
    }))
  );

  const newCursor = resp.pull?.cursor ?? 0;
  await setMeta("cursor", String(newCursor));

  const conflictsCount = await countConflicts();

  return {
    didSync: true,
    pushed,
    pulled: pullChanges.length,
    cursor: newCursor,
    conflicts: conflictsCount,
  };
}
