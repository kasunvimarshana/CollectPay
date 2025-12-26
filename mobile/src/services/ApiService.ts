import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { StorageService } from './StorageService';
import { Collection, Payment, Rate } from '../types';

// Configure your API base URL here
const API_BASE_URL = 'http://localhost:8000/api/v1';

export class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await StorageService.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear auth and redirect to login
          await StorageService.clearAuth();
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(name: string, email: string, password: string, passwordConfirmation: string) {
    const response = await this.axiosInstance.post('/auth/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const deviceId = await StorageService.getDeviceId();
    const response = await this.axiosInstance.post('/auth/login', {
      email,
      password,
      device_id: deviceId,
    });
    return response.data;
  }

  async logout() {
    const response = await this.axiosInstance.post('/auth/logout');
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.axiosInstance.get('/auth/user');
    return response.data;
  }

  // Collections
  async getCollections(filters?: any) {
    const response = await this.axiosInstance.get('/collections', { params: filters });
    return response.data;
  }

  async getCollection(uuid: string) {
    const response = await this.axiosInstance.get(`/collections/${uuid}`);
    return response.data;
  }

  async createCollection(data: Partial<Collection>) {
    const response = await this.axiosInstance.post('/collections', data);
    return response.data;
  }

  async updateCollection(uuid: string, data: Partial<Collection>) {
    const response = await this.axiosInstance.put(`/collections/${uuid}`, data);
    return response.data;
  }

  async deleteCollection(uuid: string) {
    const response = await this.axiosInstance.delete(`/collections/${uuid}`);
    return response.data;
  }

  // Payments
  async getPayments(filters?: any) {
    const response = await this.axiosInstance.get('/payments', { params: filters });
    return response.data;
  }

  async getPayment(uuid: string) {
    const response = await this.axiosInstance.get(`/payments/${uuid}`);
    return response.data;
  }

  async createPayment(data: Partial<Payment>) {
    const response = await this.axiosInstance.post('/payments', data);
    return response.data;
  }

  async updatePayment(uuid: string, data: Partial<Payment>) {
    const response = await this.axiosInstance.put(`/payments/${uuid}`, data);
    return response.data;
  }

  async batchCreatePayments(payments: Partial<Payment>[]) {
    const response = await this.axiosInstance.post('/payments/batch', { payments });
    return response.data;
  }

  // Rates
  async getRates(filters?: any) {
    const response = await this.axiosInstance.get('/rates', { params: filters });
    return response.data;
  }

  async getActiveRates() {
    const response = await this.axiosInstance.get('/rates/active/list');
    return response.data;
  }

  async getRate(uuid: string) {
    const response = await this.axiosInstance.get(`/rates/${uuid}`);
    return response.data;
  }

  async createRate(data: Partial<Rate>) {
    const response = await this.axiosInstance.post('/rates', data);
    return response.data;
  }

  async updateRate(uuid: string, data: Partial<Rate>) {
    const response = await this.axiosInstance.put(`/rates/${uuid}`, data);
    return response.data;
  }

  // Sync
  async syncPull(lastSyncedAt?: string, entityTypes?: string[]) {
    const deviceId = await StorageService.getDeviceId();
    const response = await this.axiosInstance.post('/sync/pull', {
      last_synced_at: lastSyncedAt,
      device_id: deviceId,
      entity_types: entityTypes,
    });
    return response.data;
  }

  async syncPush(data: any) {
    const deviceId = await StorageService.getDeviceId();
    const response = await this.axiosInstance.post('/sync/push', {
      device_id: deviceId,
      data,
    });
    return response.data;
  }

  async resolveConflicts(conflicts: any[]) {
    const response = await this.axiosInstance.post('/sync/resolve-conflicts', {
      conflicts,
    });
    return response.data;
  }

  async getSyncStatus() {
    const deviceId = await StorageService.getDeviceId();
    const response = await this.axiosInstance.get('/sync/status', {
      params: { device_id: deviceId },
    });
    return response.data;
  }

  // Check if online
  async isOnline(): Promise<boolean> {
    try {
      await this.axiosInstance.get('/auth/user', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
