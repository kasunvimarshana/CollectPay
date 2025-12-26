import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await SecureStore.deleteItemAsync('auth_token');
          // Navigate to login (handled by the app)
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string, deviceInfo: any) {
    const response = await this.client.post('/login', {
      email,
      password,
      ...deviceInfo,
    });
    return response.data;
  }

  async register(data: any) {
    const response = await this.client.post('/register', data);
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/logout');
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/me');
    return response.data;
  }

  // Supplier endpoints
  async getSuppliers(params?: any) {
    const response = await this.client.get('/suppliers', { params });
    return response.data;
  }

  async getSupplier(id: number) {
    const response = await this.client.get(`/suppliers/${id}`);
    return response.data;
  }

  async createSupplier(data: any) {
    const response = await this.client.post('/suppliers', data);
    return response.data;
  }

  async updateSupplier(id: number, data: any) {
    const response = await this.client.put(`/suppliers/${id}`, data);
    return response.data;
  }

  async deleteSupplier(id: number) {
    const response = await this.client.delete(`/suppliers/${id}`);
    return response.data;
  }

  async getSupplierBalance(id: number) {
    const response = await this.client.get(`/suppliers/${id}/balance`);
    return response.data;
  }

  // Product endpoints
  async getProducts(params?: any) {
    const response = await this.client.get('/products', { params });
    return response.data;
  }

  async getProduct(id: number) {
    const response = await this.client.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(data: any) {
    const response = await this.client.post('/products', data);
    return response.data;
  }

  async updateProduct(id: number, data: any) {
    const response = await this.client.put(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: number) {
    const response = await this.client.delete(`/products/${id}`);
    return response.data;
  }

  // Transaction endpoints
  async getTransactions(params?: any) {
    const response = await this.client.get('/transactions', { params });
    return response.data;
  }

  async getTransaction(id: number) {
    const response = await this.client.get(`/transactions/${id}`);
    return response.data;
  }

  async createTransaction(data: any) {
    const response = await this.client.post('/transactions', data);
    return response.data;
  }

  async updateTransaction(id: number, data: any) {
    const response = await this.client.put(`/transactions/${id}`, data);
    return response.data;
  }

  async deleteTransaction(id: number) {
    const response = await this.client.delete(`/transactions/${id}`);
    return response.data;
  }

  // Payment endpoints
  async getPayments(params?: any) {
    const response = await this.client.get('/payments', { params });
    return response.data;
  }

  async getPayment(id: number) {
    const response = await this.client.get(`/payments/${id}`);
    return response.data;
  }

  async createPayment(data: any) {
    const response = await this.client.post('/payments', data);
    return response.data;
  }

  async updatePayment(id: number, data: any) {
    const response = await this.client.put(`/payments/${id}`, data);
    return response.data;
  }

  async deletePayment(id: number) {
    const response = await this.client.delete(`/payments/${id}`);
    return response.data;
  }

  // Rate endpoints
  async getRates(params?: any) {
    const response = await this.client.get('/rates', { params });
    return response.data;
  }

  async getRate(id: number) {
    const response = await this.client.get(`/rates/${id}`);
    return response.data;
  }

  async getEffectiveRate(productId: number, params?: any) {
    const response = await this.client.get(`/rates/product/${productId}/effective`, { params });
    return response.data;
  }

  async createRate(data: any) {
    const response = await this.client.post('/rates', data);
    return response.data;
  }

  async updateRate(id: number, data: any) {
    const response = await this.client.put(`/rates/${id}`, data);
    return response.data;
  }

  async deleteRate(id: number) {
    const response = await this.client.delete(`/rates/${id}`);
    return response.data;
  }

  // Sync endpoints
  async syncTransactions(deviceId: number, transactions: any[]) {
    const response = await this.client.post('/sync/transactions', {
      device_id: deviceId,
      transactions,
    });
    return response.data;
  }

  async syncPayments(deviceId: number, payments: any[]) {
    const response = await this.client.post('/sync/payments', {
      device_id: deviceId,
      payments,
    });
    return response.data;
  }

  async getUpdates(deviceId: number, lastSync?: string) {
    const response = await this.client.get('/sync/updates', {
      params: { device_id: deviceId, last_sync: lastSync },
    });
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
