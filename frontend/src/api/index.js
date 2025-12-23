import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    const deviceId = await AsyncStorage.getItem('device_id');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (deviceId) {
      config.headers['X-Device-ID'] = deviceId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      // Navigate to login - will be handled by context
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getUser: () => api.get('/auth/user'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
};

export const supplierApi = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  getBalance: (id) => api.get(`/suppliers/${id}/balance`),
  getTransactions: (id) => api.get(`/suppliers/${id}/transactions`),
};

export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCurrentRate: (id) => api.get(`/products/${id}/current-rate`),
};

export const productRateApi = {
  getAll: () => api.get('/product-rates'),
  getById: (id) => api.get(`/product-rates/${id}`),
  create: (data) => api.post('/product-rates', data),
  delete: (id) => api.delete(`/product-rates/${id}`),
  getProductRates: (productId) => api.get(`/products/${productId}/rates`),
};

export const collectionApi = {
  getAll: (params) => api.get('/collections', { params }),
  getById: (id) => api.get(`/collections/${id}`),
  create: (data) => api.post('/collections', data),
  update: (id, data) => api.put(`/collections/${id}`, data),
  delete: (id) => api.delete(`/collections/${id}`),
  getMyCollections: (params) => api.get('/my-collections', { params }),
};

export const paymentApi = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

export const syncApi = {
  push: (items) => api.post('/sync/push', { items }),
  pull: (lastSync) => api.get('/sync/pull', { params: { last_sync: lastSync } }),
  getStatus: () => api.get('/sync/status'),
  getConflicts: () => api.get('/sync/conflicts'),
  resolveConflict: (id, resolution) => api.post(`/sync/resolve-conflict/${id}`, resolution),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
};

export default api;
