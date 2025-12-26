import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
import * as Device from "expo-device";
import { v4 as uuidv4 } from "uuid";
import {
  User,
  SyncChange,
  SyncConflict,
  SyncState,
} from "../../domain/entities";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";
const TOKEN_KEY = "auth_token";
const USER_KEY = "current_user";
const DEVICE_ID_KEY = "device_id";

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

interface SyncResponse {
  success: boolean;
  server_timestamp: string;
  changes: Record<string, unknown[]>;
  conflicts: SyncConflict[];
  processed: number;
  failed: number;
}

class ApiService {
  private token: string | null = null;
  private deviceId: string | null = null;

  async initialize(): Promise<void> {
    this.token = await SecureStore.getItemAsync(TOKEN_KEY);
    this.deviceId = await this.getOrCreateDeviceId();
  }

  private async getOrCreateDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `${Device.modelName || "unknown"}-${uuidv4()}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  async isOnline(): Promise<boolean> {
    const networkState = await Network.getNetworkStateAsync();
    return (
      networkState.isConnected === true &&
      networkState.isInternetReachable === true
    );
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Device-ID": this.deviceId || "",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Request failed",
          errors: data.errors,
        };
      }

      return data;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Auth endpoints
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>(
      "POST",
      "/auth/login",
      {
        email,
        password,
        device_id: this.deviceId,
      }
    );

    if (response.success && response.data) {
      this.token = response.data.token;
      await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request("POST", "/auth/logout");
    } finally {
      this.token = null;
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  }

  async refreshProfile(): Promise<ApiResponse<User>> {
    const response = await this.request<User>("GET", "/auth/me");
    if (response.success && response.data) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
    }
    return response;
  }

  // CRUD endpoints
  async get<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return this.request<T>("GET", endpoint + queryString);
  }

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("POST", endpoint, data);
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", endpoint, data);
  }

  async delete(endpoint: string): Promise<ApiResponse<void>> {
    return this.request<void>("DELETE", endpoint);
  }

  // Sync endpoints
  async pushChanges(
    changes: Record<string, SyncChange[]>
  ): Promise<SyncResponse> {
    const checksum = await this.generateChecksum(changes);

    const response = await this.request<SyncResponse>("POST", "/sync/push", {
      device_id: this.deviceId,
      changes,
      checksum,
    });

    if (!response.success) {
      throw new Error(response.message || "Push sync failed");
    }

    return response.data!;
  }

  async pullChanges(lastSyncTimestamp?: Date): Promise<SyncResponse> {
    const response = await this.request<SyncResponse>("POST", "/sync/pull", {
      device_id: this.deviceId,
      last_sync_timestamp: lastSyncTimestamp?.toISOString(),
      entities: [
        "suppliers",
        "products",
        "product_rates",
        "collections",
        "payments",
      ],
    });

    if (!response.success) {
      throw new Error(response.message || "Pull sync failed");
    }

    return response.data!;
  }

  async getSyncStatus(): Promise<SyncState> {
    const response = await this.request<{
      device_id: string;
      last_sync: string;
      pending_changes: Record<string, number>;
      is_online: boolean;
    }>("GET", "/sync/status");

    if (!response.success) {
      throw new Error(response.message || "Failed to get sync status");
    }

    const data = response.data!;
    const pendingCount = Object.values(data.pending_changes).reduce(
      (sum, n) => sum + n,
      0
    );

    return {
      lastSyncTimestamp: data.last_sync ? new Date(data.last_sync) : undefined,
      pendingChangesCount: pendingCount,
      isOnline: data.is_online,
      isSyncing: false,
      conflicts: [],
    };
  }

  private async generateChecksum(data: unknown): Promise<string> {
    // Simple checksum for integrity validation
    // In production, use a proper HMAC implementation
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}

export const apiService = new ApiService();
