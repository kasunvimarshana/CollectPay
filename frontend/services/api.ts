import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          this.token = await this.getToken();
        }
        
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.clearToken();
          // Trigger logout or refresh
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get stored token
   */
  private async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Set token
   */
  async setToken(token: string): Promise<void> {
    this.token = token;
    try {
      await SecureStore.setItemAsync('auth_token', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  /**
   * Clear token
   */
  async clearToken(): Promise<void> {
    this.token = null;
    try {
      await SecureStore.deleteItemAsync('auth_token');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  // Auth APIs
  async register(data: { name: string; email: string; password: string; password_confirmation: string }) {
    const response = await this.api.post('/register', data);
    if (response.data.data?.token) {
      await this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async login(data: { email: string; password: string; device_id?: string }) {
    const response = await this.api.post('/login', data);
    if (response.data.data?.token) {
      await this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/logout');
    await this.clearToken();
    return response.data;
  }

  async me() {
    const response = await this.api.get('/me');
    return response.data;
  }

  // Suppliers
  async getSuppliers(params?: any) {
    const response = await this.api.get('/suppliers', { params });
    return response.data;
  }

  async getSupplier(id: number) {
    const response = await this.api.get(`/suppliers/${id}`);
    return response.data;
  }

  async createSupplier(data: any) {
    const response = await this.api.post('/suppliers', data);
    return response.data;
  }

  async updateSupplier(id: number, data: any) {
    const response = await this.api.put(`/suppliers/${id}`, data);
    return response.data;
  }

  async deleteSupplier(id: number) {
    const response = await this.api.delete(`/suppliers/${id}`);
    return response.data;
  }

  async getSupplierBalance(id: number, params?: any) {
    const response = await this.api.get(`/suppliers/${id}/balance`, { params });
    return response.data;
  }

  // Products
  async getProducts(params?: any) {
    const response = await this.api.get('/products', { params });
    return response.data;
  }

  async getProduct(id: number) {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(data: any) {
    const response = await this.api.post('/products', data);
    return response.data;
  }

  async updateProduct(id: number, data: any) {
    const response = await this.api.put(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: number) {
    const response = await this.api.delete(`/products/${id}`);
    return response.data;
  }

  // Rates
  async getRates(params?: any) {
    const response = await this.api.get('/rates', { params });
    return response.data;
  }

  async getRate(id: number) {
    const response = await this.api.get(`/rates/${id}`);
    return response.data;
  }

  async createRate(data: any) {
    const response = await this.api.post('/rates', data);
    return response.data;
  }

  async updateRate(id: number, data: any) {
    const response = await this.api.put(`/rates/${id}`, data);
    return response.data;
  }

  async deleteRate(id: number) {
    const response = await this.api.delete(`/rates/${id}`);
    return response.data;
  }

  // Collections
  async getCollections(params?: any) {
    const response = await this.api.get('/collections', { params });
    return response.data;
  }

  async getCollection(id: number) {
    const response = await this.api.get(`/collections/${id}`);
    return response.data;
  }

  async createCollection(data: any) {
    const response = await this.api.post('/collections', data);
    return response.data;
  }

  async updateCollection(id: number, data: any) {
    const response = await this.api.put(`/collections/${id}`, data);
    return response.data;
  }

  async deleteCollection(id: number) {
    const response = await this.api.delete(`/collections/${id}`);
    return response.data;
  }

  // Payments
  async getPayments(params?: any) {
    const response = await this.api.get('/payments', { params });
    return response.data;
  }

  async getPayment(id: number) {
    const response = await this.api.get(`/payments/${id}`);
    return response.data;
  }

  async createPayment(data: any) {
    const response = await this.api.post('/payments', data);
    return response.data;
  }

  async updatePayment(id: number, data: any) {
    const response = await this.api.put(`/payments/${id}`, data);
    return response.data;
  }

  async deletePayment(id: number) {
    const response = await this.api.delete(`/payments/${id}`);
    return response.data;
  }

  async calculateAllocation(data: any) {
    const response = await this.api.post('/payments/calculate-allocation', data);
    return response.data;
  }

  // Sync
  async syncPush(data: { device_id: string; changes: any[] }) {
    const response = await this.api.post('/sync/push', data);
    return response.data;
  }

  async syncPull(data: { device_id: string; last_sync?: string; entities?: string[] }) {
    const response = await this.api.post('/sync/pull', data);
    return response.data;
  }

  async getSyncStatus(params?: any) {
    const response = await this.api.get('/sync/status', { params });
    return response.data;
  }

  async getChanges(data: { since: string; entities?: string[] }) {
    const response = await this.api.post('/sync/changes', data);
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export default new ApiService();
