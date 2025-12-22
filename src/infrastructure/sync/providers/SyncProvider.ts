import type { User } from "../../../domain/models/User";

export type SyncOperation = {
  id: number;
  op: "create" | "update" | "delete";
  entity: "user";
  entityId: string;
  payload: string; // JSON
  timestamp: number;
  deviceId: string;
};

export interface SyncProvider {
  // Apply a local operation to the remote store (MySQL-backed service)
  apply(op: SyncOperation): Promise<"applied" | "conflict" | "ignored">;
  // Fetch remote changes since a timestamp
  fetchSince(sinceTs: number): Promise<User[]>;
}
