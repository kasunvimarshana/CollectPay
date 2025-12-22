import * as SecureStore from "expo-secure-store";
import { ApiClient } from "./api";

export interface LoginResponse {
  token: string;
  user: { id: string; name: string; email: string; roles: string[] };
}

export class AuthService {
  constructor(private api: ApiClient) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await this.api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    await SecureStore.setItemAsync("auth_token", res.token);
    await SecureStore.setItemAsync("auth_user", JSON.stringify(res.user));
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post("/auth/logout");
    } catch {}
    await SecureStore.deleteItemAsync("auth_token");
    await SecureStore.deleteItemAsync("auth_user");
  }

  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync("auth_token");
  }

  async getUser(): Promise<LoginResponse["user"] | null> {
    const raw = await SecureStore.getItemAsync("auth_user");
    return raw ? (JSON.parse(raw) as LoginResponse["user"]) : null;
  }
}
