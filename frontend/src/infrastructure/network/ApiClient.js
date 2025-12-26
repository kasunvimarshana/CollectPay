// API client with retry and offline support
import axios from 'axios';
import SecureStorage from '../storage/SecureStorage';
import NetworkMonitor from './NetworkMonitor';

const API_URL = 'http://localhost:8000/api'; // TODO: Load from config

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStorage.getAuthToken();
        if (token) {
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
      async (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - token expired or invalid
          await SecureStorage.clearAuth();
          // Emit event for navigation to login
          // TODO: Implement proper event handling
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email, password, deviceId) {
    const response = await this.client.post('/login', {
      email,
      password,
      device_id: deviceId,
    });
    return response.data;
  }

  async register(userData) {
    const response = await this.client.post('/register', userData);
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

  // Sync endpoints
  async syncData(syncData, deviceId) {
    const response = await this.client.post('/sync', {
      device_id: deviceId,
      sync_data: syncData,
    });
    return response.data;
  }

  async pullChanges(since) {
    const response = await this.client.get('/sync/pull', {
      params: { since },
    });
    return response.data;
  }

  async fullSync() {
    const response = await this.client.get('/sync/full');
    return response.data;
  }

  async checkSyncStatus() {
    const response = await this.client.get('/sync/status');
    return response.data;
  }

  // CRUD endpoints
  async getSuppliers(params = {}) {
    const response = await this.client.get('/suppliers', { params });
    return response.data;
  }

  async getSupplier(id) {
    const response = await this.client.get(`/suppliers/${id}`);
    return response.data;
  }

  async createSupplier(data) {
    const response = await this.client.post('/suppliers', data);
    return response.data;
  }

  async updateSupplier(id, data) {
    const response = await this.client.put(`/suppliers/${id}`, data);
    return response.data;
  }

  async deleteSupplier(id) {
    const response = await this.client.delete(`/suppliers/${id}`);
    return response.data;
  }

  async getSupplierBalance(id, params = {}) {
    const response = await this.client.get(`/suppliers/${id}/balance`, { params });
    return response.data;
  }

  // Products
  async getProducts(params = {}) {
    const response = await this.client.get('/products', { params });
    return response.data;
  }

  async createProduct(data) {
    const response = await this.client.post('/products', data);
    return response.data;
  }

  // Rates
  async getRates(params = {}) {
    const response = await this.client.get('/rates', { params });
    return response.data;
  }

  async getApplicableRate(productId, date, supplierId = null) {
    const response = await this.client.get('/rates/applicable', {
      params: { product_id: productId, date, supplier_id: supplierId },
    });
    return response.data;
  }

  async createRate(data) {
    const response = await this.client.post('/rates', data);
    return response.data;
  }

  // Collections
  async getCollections(params = {}) {
    const response = await this.client.get('/collections', { params });
    return response.data;
  }

  async createCollection(data) {
    const response = await this.client.post('/collections', data);
    return response.data;
  }

  // Payments
  async getPayments(params = {}) {
    const response = await this.client.get('/payments', { params });
    return response.data;
  }

  async createPayment(data) {
    const response = await this.client.post('/payments', data);
    return response.data;
  }

  async validatePaymentAmount(supplierId, amount) {
    const response = await this.client.post('/payments/validate-amount', {
      supplier_id: supplierId,
      amount,
    });
    return response.data;
  }

  // Check if online
  isOnline() {
    return NetworkMonitor.getConnectionStatus();
  }
}

export default new ApiClient();
