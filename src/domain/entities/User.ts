export type UserId = string;

export interface User {
  id: UserId;
  name: string;
  email: string;
  createdAt: number; // epoch millis
  updatedAt: number; // epoch millis
  version: number; // optimistic concurrency control
  deleted?: boolean;
}
