import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { NewUser, UpdateUser, UserRecord } from "@/domain/User";

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

async function getToken() {
  return SecureStore.getItemAsync("auth_token");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as any),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const msg = await res.text();
    const error: any = new Error(msg || `HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    return request<{ token: string; user: UserRecord }>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password, device: Platform.OS }),
    });
  },
  async me() {
    return request<UserRecord>(`/auth/me`);
  },

  // Users CRUD
  listUsers() {
    return request<UserRecord[]>(`/users`);
  },
  createUser(payload: NewUser) {
    return request<UserRecord>(`/users`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateUser(id: string, payload: UpdateUser) {
    return request<UserRecord>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteUser(id: string) {
    return request<void>(`/users/${id}`, { method: "DELETE" });
  },

  // Sync endpoints
  pullChanges(since?: string) {
    const q = since ? `?since=${encodeURIComponent(since)}` : "";
    return request<{ users: UserRecord[]; token: string }>(`/sync${q}`);
  },
  pushChange(change: {
    op: "create" | "update" | "delete";
    table: string;
    id?: string;
    payload?: any;
    version?: number;
  }) {
    return request<{ ok: boolean; conflict?: UserRecord }>(`/sync`, {
      method: "POST",
      body: JSON.stringify(change),
    });
  },
};
