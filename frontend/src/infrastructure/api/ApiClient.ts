import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS, ERROR_MESSAGES } from '../../shared/constants';
import { ApiResponse } from '../../shared/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          
          if (status === 401) {
            // Unauthorized - clear auth data and redirect to login
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
            // TODO: Navigate to login screen
          } else if (status === 403) {
            // Forbidden - no permission
            error.message = ERROR_MESSAGES.PERMISSION_DENIED;
          } else if (status === 404) {
            error.message = ERROR_MESSAGES.NOT_FOUND;
          } else if (status >= 500) {
            error.message = ERROR_MESSAGES.SERVER_ERROR;
          }
        } else if (error.request) {
          // Request made but no response
          error.message = ERROR_MESSAGES.NETWORK_ERROR;
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.client.post('/login', { email, password });
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

  async me() {
    const response = await this.client.get('/me');
    return response.data;
  }

  async refresh() {
    const response = await this.client.post('/refresh');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string, newPasswordConfirmation: string) {
    const response = await this.client.post('/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    });
    return response.data;
  }

  // Generic CRUD operations
  async getList<T>(endpoint: string, params?: any): Promise<ApiResponse<T[]>> {
    const response = await this.client.get(endpoint, { params });
    return response.data;
  }

  async getOne<T>(endpoint: string, id: number): Promise<ApiResponse<T>> {
    const response = await this.client.get(`${endpoint}/${id}`);
    return response.data;
  }

  async create<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(endpoint, data);
    return response.data;
  }

  async update<T>(endpoint: string, id: number, data: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(`${endpoint}/${id}`, data);
    return response.data;
  }

  async delete(endpoint: string, id: number): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`${endpoint}/${id}`);
    return response.data;
  }

  // Suppliers
  async getSuppliers(params?: any) {
    return this.getList('/suppliers', params);
  }

  async getSupplier(id: number) {
    return this.getOne('/suppliers', id);
  }

  async createSupplier(data: any) {
    return this.create('/suppliers', data);
  }

  async updateSupplier(id: number, data: any) {
    return this.update('/suppliers', id, data);
  }

  async deleteSupplier(id: number) {
    return this.delete('/suppliers', id);
  }

  async getSupplierCollections(id: number) {
    const response = await this.client.get(`/suppliers/${id}/collections`);
    return response.data;
  }

  async getSupplierPayments(id: number) {
    const response = await this.client.get(`/suppliers/${id}/payments`);
    return response.data;
  }

  async getSupplierBalance(id: number) {
    const response = await this.client.get(`/suppliers/${id}/balance`);
    return response.data;
  }

  // Products
  async getProducts(params?: any) {
    return this.getList('/products', params);
  }

  async getProduct(id: number) {
    return this.getOne('/products', id);
  }

  async createProduct(data: any) {
    return this.create('/products', data);
  }

  async updateProduct(id: number, data: any) {
    return this.update('/products', id, data);
  }

  async deleteProduct(id: number) {
    return this.delete('/products', id);
  }

  async getProductRates(id: number) {
    const response = await this.client.get(`/products/${id}/rates`);
    return response.data;
  }

  async addProductRate(id: number, data: any) {
    const response = await this.client.post(`/products/${id}/rates`, data);
    return response.data;
  }

  async getCurrentRate(id: number, date?: string, unit?: string) {
    const response = await this.client.get(`/products/${id}/current-rate`, {
      params: { date, unit },
    });
    return response.data;
  }

  // Collections
  async getCollections(params?: any) {
    return this.getList('/collections', params);
  }

  async getCollection(id: number) {
    return this.getOne('/collections', id);
  }

  async createCollection(data: any) {
    return this.create('/collections', data);
  }

  async updateCollection(id: number, data: any) {
    return this.update('/collections', id, data);
  }

  async deleteCollection(id: number) {
    return this.delete('/collections', id);
  }

  // Payments
  async getPayments(params?: any) {
    return this.getList('/payments', params);
  }

  async getPayment(id: number) {
    return this.getOne('/payments', id);
  }

  async createPayment(data: any) {
    return this.create('/payments', data);
  }

  async updatePayment(id: number, data: any) {
    return this.update('/payments', id, data);
  }

  async deletePayment(id: number) {
    return this.delete('/payments', id);
  }

  async calculatePayment(supplierId: number, params?: any) {
    const response = await this.client.post('/payments/calculate', {
      supplier_id: supplierId,
      ...params,
    });
    return response.data;
  }

  // Dashboard
  async getDashboardStats() {
    const response = await this.client.get('/dashboard/stats');
    return response.data;
  }

  async getRecentCollections() {
    const response = await this.client.get('/dashboard/recent-collections');
    return response.data;
  }

  async getRecentPayments() {
    const response = await this.client.get('/dashboard/recent-payments');
    return response.data;
  }

  // Audit Logs
  async getAuditLogs(params?: any) {
    return this.getList('/audit-logs', params);
  }

  async getAuditLog(id: number) {
    return this.getOne('/audit-logs', id);
  }
}

export default new ApiClient();
