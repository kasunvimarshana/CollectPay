import type { SyncProvider, SyncOperation } from "./SyncProvider";
import type { User } from "../../../domain/models/User";

// IMPORTANT: Direct MySQL from mobile apps (Expo) is infeasible and insecure.
// This stub exists to document the constraint and avoid accidental usage.
export class MySQLSyncProvider implements SyncProvider {
  async apply(_op: SyncOperation): Promise<"applied" | "conflict" | "ignored"> {
    throw new Error(
      "Direct MySQL access from Expo/React Native is not supported nor secure. Use a secure sync endpoint."
    );
  }
  async fetchSince(_sinceTs: number): Promise<User[]> {
    throw new Error(
      "Direct MySQL access from Expo/React Native is not supported nor secure. Use a secure sync endpoint."
    );
  }
}
