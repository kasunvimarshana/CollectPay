export type UUID = string;

export type Role = "admin" | "manager" | "user";

export interface Attributes {
  department?: string;
  region?: string;
  [key: string]: unknown;
}

export interface UserRecord {
  id: UUID;
  name: string;
  email: string;
  role: Role;
  attributes?: Attributes;
  version: number;
  updated_at?: string; // ISO string
  deleted_at?: string | null;
}

export type NewUser = Omit<
  UserRecord,
  "id" | "version" | "updated_at" | "deleted_at"
>;
export type UpdateUser = Partial<Omit<UserRecord, "id">> & { id: UUID };
