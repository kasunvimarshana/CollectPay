import * as SecureStore from "expo-secure-store";
import { api } from "./api";
import type { UserRecord } from "@/domain/User";

export async function signIn(
  email: string,
  password: string
): Promise<{ token: string; user: UserRecord }> {
  const res = await api.login(email, password);
  await SecureStore.setItemAsync("auth_token", res.token);
  return res;
}

export async function signOut() {
  await SecureStore.deleteItemAsync("auth_token");
}

export async function currentUser(): Promise<UserRecord> {
  return api.me();
}
