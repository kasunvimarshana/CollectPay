import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";
import { API_CONFIG, STORAGE_KEYS } from "@/config/constants";
import { ApiResponse } from "@/types";

/**
 * API Service - Handles HTTP requests with offline detection and token management
 */
class ApiService {
  private client: AxiosInstance;
  private isOnline: boolean = true;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}`,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
    this.monitorConnection();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, logout user
          await this.handleUnauthorized();
        }

        return Promise.reject(error);
      }
    );
  }

  private monitorConnection(): void {
    NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected ?? false;
    });
  }

  private async handleUnauthorized(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    // Trigger logout in app (handled by auth store)
  }

  public getConnectionStatus(): boolean {
    return this.isOnline;
  }

  // Generic request methods
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    if (!this.isOnline) {
      throw new Error("No internet connection");
    }

    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    if (!this.isOnline) {
      throw new Error("No internet connection");
    }

    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    if (!this.isOnline) {
      throw new Error("No internet connection");
    }

    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    if (!this.isOnline) {
      throw new Error("No internet connection");
    }

    const response = await this.client.delete(url, config);
    return response.data;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.post("/auth/login", { email, password });
  }

  async logout() {
    return this.post("/auth/logout");
  }

  async refreshToken() {
    return this.post("/auth/refresh");
  }

  async getMe() {
    return this.get("/auth/me");
  }

  // User endpoints
  async getUsers(page: number = 1, perPage: number = 20) {
    return this.get(`/users?page=${page}&per_page=${perPage}`);
  }

  async getUser(id: string) {
    return this.get(`/users/${id}`);
  }

  async createUser(data: any) {
    return this.post("/users", data);
  }

  async updateUser(id: string, data: any) {
    return this.put(`/users/${id}`, data);
  }

  async deleteUser(id: string) {
    return this.delete(`/users/${id}`);
  }

  // Supplier endpoints
  async getSuppliers(page: number = 1, perPage: number = 20) {
    return this.get(`/suppliers?page=${page}&per_page=${perPage}`);
  }

  async getSupplier(id: string) {
    return this.get(`/suppliers/${id}`);
  }

  async createSupplier(data: any) {
    return this.post("/suppliers", data);
  }

  async updateSupplier(id: string, data: any) {
    return this.put(`/suppliers/${id}`, data);
  }

  async deleteSupplier(id: string) {
    return this.delete(`/suppliers/${id}`);
  }

  async searchSuppliers(name: string) {
    return this.get(`/suppliers/search/${name}`);
  }

  // Collection endpoints
  async getCollections(page: number = 1, perPage: number = 20) {
    return this.get(`/collections?page=${page}&per_page=${perPage}`);
  }

  async getCollection(id: string) {
    return this.get(`/collections/${id}`);
  }

  async createCollection(data: any) {
    return this.post("/collections", data);
  }

  async updateCollection(id: string, data: any) {
    return this.put(`/collections/${id}`, data);
  }

  async deleteCollection(id: string) {
    return this.delete(`/collections/${id}`);
  }

  async getCollectionsBySupplier(supplierId: string) {
    return this.get(`/collections/supplier/${supplierId}`);
  }

  async approveCollection(id: string) {
    return this.post(`/collections/${id}/approve`);
  }

  async rejectCollection(id: string, reason: string) {
    return this.post(`/collections/${id}/reject`, { reason });
  }

  // Payment endpoints
  async getPayments(page: number = 1, perPage: number = 20) {
    return this.get(`/payments?page=${page}&per_page=${perPage}`);
  }

  async getPayment(id: string) {
    return this.get(`/payments/${id}`);
  }

  async createPayment(data: any) {
    return this.post("/payments", data);
  }

  async updatePayment(id: string, data: any) {
    return this.put(`/payments/${id}`, data);
  }

  async deletePayment(id: string) {
    return this.delete(`/payments/${id}`);
  }

  async getPaymentsBySupplier(supplierId: string) {
    return this.get(`/payments/supplier/${supplierId}`);
  }

  async confirmPayment(id: string) {
    return this.post(`/payments/${id}/confirm`);
  }

  async cancelPayment(id: string, reason: string) {
    return this.post(`/payments/${id}/cancel`, { reason });
  }

  // Sync endpoints
  async pushSyncData(data: any[]) {
    return this.post("/sync/push", { data });
  }

  async pullSyncData(lastSyncTimestamp?: string) {
    const url = lastSyncTimestamp
      ? `/sync/pull?since=${lastSyncTimestamp}`
      : "/sync/pull";
    return this.get(url);
  }

  async getSyncStatus() {
    return this.get("/sync/status");
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.get("/dashboard/stats");
  }

  async getSupplierBalance(supplierId: string) {
    return this.get(`/dashboard/supplier/${supplierId}/balance`);
  }
}

export const apiService = new ApiService();
