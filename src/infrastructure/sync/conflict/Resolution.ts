import type { User } from "../../../domain/models/User";

export type Conflict = {
  local: User;
  remote: User;
};

export interface ConflictResolver {
  resolve(conflict: Conflict): User; // returns the winning record
}

// Last-write-wins by timestamp; ties break in favor of remote
export class LastWriteWins implements ConflictResolver {
  resolve({ local, remote }: Conflict): User {
    if (local.updatedAt > remote.updatedAt) return local;
    return remote;
  }
}
