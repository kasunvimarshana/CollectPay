export type UserId = string;

export interface User {
  id: UserId;
  name: string;
  email: string;
  updatedAt: number; // epoch millis for conflict resolution
  deviceId: string; // origin device
  deleted?: boolean;
}
