import { config } from "../config";
import { getToken, getOrCreateDeviceId } from "../storage/auth";

export type SyncOp = {
  op_id: string;
  entity: string;
  type: "upsert" | "delete";
  id: string;
  base_version: number | null;
  payload: Record<string, any> | null;
  client_updated_at: string;
};

export type PullChange = {
  seq: number;
  model:
    | "suppliers"
    | "products"
    | "units"
    | "collection_entries"
    | "rates"
    | "payments"
    | string;
  model_id: string;
  operation: "upsert" | "delete";
  version: number;
  payload: any;
  changed_at: string | null;
};

export type SyncResponse = {
  device_id: string;
  applied: Array<{
    op_id: string;
    status: "applied" | "skipped" | "conflict";
    entity?: string;
    id?: string;
    version?: number;
    conflict?: any;
  }>;
  conflicts: Array<{
    op_id: string;
    status: "conflict";
    entity: string;
    id: string;
    conflict: any;
  }>;
  pull: {
    cursor: number;
    changes: PullChange[];
  };
};

export async function postSync(params: {
  cursor: number;
  ops: SyncOp[];
  conflict_strategy?: "server_wins" | "client_wins";
}): Promise<SyncResponse> {
  const token = await getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const device_id = await getOrCreateDeviceId();

  const res = await fetch(`${config.apiBaseUrl}/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      device_id,
      cursor: params.cursor,
      conflict_strategy: params.conflict_strategy ?? "server_wins",
      ops: params.ops,
    }),
  });

  const bodyText = await res.text();
  if (!res.ok) {
    let msg = `Sync failed (${res.status})`;
    try {
      const parsed = JSON.parse(bodyText);
      msg = parsed?.message ?? msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return JSON.parse(bodyText) as SyncResponse;
}
