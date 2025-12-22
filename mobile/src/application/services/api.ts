type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiConfig {
  baseUrl: string;
  getToken: () => Promise<string | null> | string | null;
}

import { emit } from "./notify";

export class ApiClient {
  constructor(private config: ApiConfig) {}

  async request<T>(
    path: string,
    method: HttpMethod,
    body?: unknown
  ): Promise<T> {
    try {
      const token = await this.config.getToken();
      const res = await fetch(`${this.config.baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const text = await res.text();
        emit(`Request failed: ${method} ${path} → ${res.status}`, "error");
        throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`);
      }
      return (await res.json()) as T;
    } catch (err: any) {
      // Network or parsing error
      emit(`Network error: ${method} ${path}`, "error");
      throw err;
    }
  }

  get<T>(path: string) {
    return this.request<T>(path, "GET");
  }
  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, "POST", body);
  }
  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, "PUT", body);
  }
  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, "PATCH", body);
  }
  delete<T>(path: string) {
    return this.request<T>(path, "DELETE");
  }
}
