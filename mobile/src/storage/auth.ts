import * as SecureStore from "expo-secure-store";
import { v4 as uuidv4 } from "uuid";

const TOKEN_KEY = "kv_token";
const DEVICE_ID_KEY = "kv_device_id";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string | null): Promise<void> {
  if (!token) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;

  const id = uuidv4();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  return id;
}

export async function clearAuth(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
