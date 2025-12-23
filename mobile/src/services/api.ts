import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          SecureStore.deleteItemAsync('auth_token');
        }
        return Promise.reject(error);
      }
    );
  }

  async setAuthToken(token: string) {
    await SecureStore.setItemAsync('auth_token', token);
  }

  async removeAuthToken() {
    await SecureStore.deleteItemAsync('auth_token');
  }

  // Auth endpoints
  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    device_id?: string;
  }) {
    const response = await this.api.post('/register', data);
    return response.data;
  }

  async login(email: string, password: string, deviceId?: string) {
    const response = await this.api.post('/login', { email, password, device_id: deviceId });
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/logout');
    return response.data;
  }

  async getUser() {
    const response = await this.api.get('/user');
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

  // Product Rates
  async getProductRates(productId: number, params?: any) {
    const response = await this.api.get(`/products/${productId}/rates`, { params });
    return response.data;
  }

  async getProductRate(productId: number, rateId: number) {
    const response = await this.api.get(`/products/${productId}/rates/${rateId}`);
    return response.data;
  }

  async createProductRate(productId: number, data: any) {
    const response = await this.api.post(`/products/${productId}/rates`, data);
    return response.data;
  }

  async updateProductRate(productId: number, rateId: number, data: any) {
    const response = await this.api.put(`/products/${productId}/rates/${rateId}`, data);
    return response.data;
  }

  async deleteProductRate(productId: number, rateId: number) {
    const response = await this.api.delete(`/products/${productId}/rates/${rateId}`);
    return response.data;
  }

  async getCurrentProductRate(productId: number) {
    const response = await this.api.get(`/products/${productId}/rates/current`);
    return response.data;
  }

  async getProductRateAtDate(productId: number, date: string) {
    const response = await this.api.get(`/products/${productId}/rates/at-date`, {
      params: { date }
    });
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

  // Payment calculations and reports
  async validatePayment(data: {
    supplier_id: number;
    amount: number;
    payment_type: 'advance' | 'partial' | 'full';
  }) {
    const response = await this.api.post('/payments/validate', data);
    return response.data;
  }

  async getPaymentSummary() {
    const response = await this.api.get('/payments/summary');
    return response.data;
  }

  async getSupplierBalance(supplierId: number, upToDate?: string) {
    const params = upToDate ? { up_to_date: upToDate } : {};
    const response = await this.api.get(`/suppliers/${supplierId}/balance`, { params });
    return response.data;
  }

  async getSupplierPaymentHistory(supplierId: number) {
    const response = await this.api.get(`/suppliers/${supplierId}/payment-history`);
    return response.data;
  }

  // Sync
  async sync(data: {
    device_id: string;
    last_sync_timestamp?: string;
    collections?: any[];
    payments?: any[];
  }) {
    const response = await this.api.post('/sync', data);
    return response.data;
  }

  async resolveConflict(conflictId: number, data: {
    resolution: 'use_server' | 'use_client' | 'merge';
    resolved_data?: any;
  }) {
    const response = await this.api.post(`/sync/conflicts/${conflictId}/resolve`, data);
    return response.data;
  }
}

export default new ApiService();
