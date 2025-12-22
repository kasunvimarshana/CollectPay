import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api' 
  : 'https://your-production-url.com/api';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          this.token = await SecureStore.getItemAsync('auth_token');
        }
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear it
          await this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  async setToken(token: string) {
    this.token = token;
    await SecureStore.setItemAsync('auth_token', token);
  }

  async clearToken() {
    this.token = null;
    await SecureStore.deleteItemAsync('auth_token');
  }

  async getToken() {
    if (!this.token) {
      this.token = await SecureStore.getItemAsync('auth_token');
    }
    return this.token;
  }

  // Auth endpoints
  async register(data: { name: string; email: string; password: string; password_confirmation: string }) {
    const response = await this.api.post('/register', data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post('/login', { email, password });
    await this.setToken(response.data.token);
    return response.data;
  }

  async logout() {
    try {
      await this.api.post('/logout');
    } finally {
      await this.clearToken();
    }
  }

  async me() {
    const response = await this.api.get('/me');
    return response.data;
  }

  // Supplier endpoints
  async getSuppliers(params?: any) {
    const response = await this.api.get('/suppliers', { params });
    return response.data;
  }

  async getSupplier(id: number) {
    const response = await this.api.get(`/suppliers/${id}`);
    return response.data;
  }

  // Product endpoints
  async getProducts(params?: any) {
    const response = await this.api.get('/products', { params });
    return response.data;
  }

  async getProduct(id: number) {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  // Rate endpoints
  async getRates(params?: any) {
    const response = await this.api.get('/rates', { params });
    return response.data;
  }

  async getCurrentRate(productId: number, supplierId?: number, date?: string) {
    const response = await this.api.get('/rates/current', {
      params: { product_id: productId, supplier_id: supplierId, date },
    });
    return response.data;
  }

  // Collection endpoints
  async getCollections(params?: any) {
    const response = await this.api.get('/collections', { params });
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

  // Payment endpoints
  async getPayments(params?: any) {
    const response = await this.api.get('/payments', { params });
    return response.data;
  }

  async createPayment(data: any) {
    const response = await this.api.post('/payments', data);
    return response.data;
  }

  async getPaymentSummary(supplierId: number, params?: any) {
    const response = await this.api.get('/payments/summary', {
      params: { supplier_id: supplierId, ...params },
    });
    return response.data;
  }

  // Sync endpoints
  async syncCollections(collections: any[]) {
    const response = await this.api.post('/sync/collections', { collections });
    return response.data;
  }

  async syncPayments(payments: any[]) {
    const response = await this.api.post('/sync/payments', { payments });
    return response.data;
  }

  async getUpdates(lastSync: string) {
    const response = await this.api.post('/sync/updates', { last_sync: lastSync });
    return response.data;
  }
}

export default new ApiService();
