import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Supplier,
  Product,
  ProductRate,
  Payment,
  ApiResponse,
  PaginatedResponse,
  AuthResponse,
  SyncChange,
} from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'auth_token';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
          // Token expired, clear auth data
          await this.clearAuth();
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    
    if (response.data.success && response.data.data) {
      await this.setToken(response.data.data.token);
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
  }

  async register(name: string, email: string, password: string, role?: string): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>('/auth/register', {
      name,
      email,
      password,
      password_confirmation: password,
      role,
    });
    
    if (response.data.success && response.data.data) {
      await this.setToken(response.data.data.token);
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      await this.clearAuth();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<ApiResponse<User>>('/auth/user');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to get user');
  }

  async refreshToken(): Promise<string> {
    const response = await this.api.post<ApiResponse<{ token: string }>>('/auth/refresh');
    if (response.data.success && response.data.data) {
      await this.setToken(response.data.data.token);
      return response.data.data.token;
    }
    throw new Error('Failed to refresh token');
  }

  // Suppliers
  async getSuppliers(params?: {
    status?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Supplier>> {
    const response = await this.api.get<ApiResponse<PaginatedResponse<Supplier>>>('/suppliers', { params });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to fetch suppliers');
  }

  async getSupplier(id: number): Promise<Supplier> {
    const response = await this.api.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to fetch supplier');
  }

  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    const response = await this.api.post<ApiResponse<Supplier>>('/suppliers', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create supplier');
  }

  async updateSupplier(id: number, data: Partial<Supplier>): Promise<Supplier> {
    const response = await this.api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update supplier');
  }

  async deleteSupplier(id: number): Promise<void> {
    const response = await this.api.delete<ApiResponse>(`/suppliers/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete supplier');
    }
  }

  // Products
  async getProducts(params?: {
    supplier_id?: number;
    status?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Product>> {
    const response = await this.api.get<ApiResponse<PaginatedResponse<Product>>>('/products', { params });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to fetch products');
  }

  async getProduct(id: number): Promise<Product> {
    const response = await this.api.get<ApiResponse<Product>>(`/products/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to fetch product');
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await this.api.post<ApiResponse<Product>>('/products', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create product');
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const response = await this.api.put<ApiResponse<Product>>(`/products/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update product');
  }

  async deleteProduct(id: number): Promise<void> {
    const response = await this.api.delete<ApiResponse>(`/products/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete product');
    }
  }

  // Product Rates
  async getProductRates(productId: number): Promise<ProductRate[]> {
    const response = await this.api.get<ApiResponse<ProductRate[]>>(`/products/${productId}/rates`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to fetch product rates');
  }

  async getCurrentRate(productId: number, unit?: string): Promise<ProductRate> {
    const response = await this.api.get<ApiResponse<ProductRate>>(
      `/products/${productId}/current-rate`,
      { params: { unit } }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to fetch current rate');
  }

  async createProductRate(productId: number, data: Partial<ProductRate>): Promise<ProductRate> {
    const response = await this.api.post<ApiResponse<ProductRate>>(
      `/products/${productId}/rates`,
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create product rate');
  }

  // Payments
  async getPayments(params?: {
    supplier_id?: number;
    product_id?: number;
    payment_type?: string;
    from_date?: string;
    to_date?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Payment>> {
    const response = await this.api.get<ApiResponse<PaginatedResponse<Payment>>>('/payments', { params });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to fetch payments');
  }

  async getPayment(id: number): Promise<Payment> {
    const response = await this.api.get<ApiResponse<Payment>>(`/payments/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to fetch payment');
  }

  async createPayment(data: Partial<Payment>): Promise<Payment> {
    const response = await this.api.post<ApiResponse<Payment>>('/payments', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create payment');
  }

  // Synchronization
  async pushChanges(changes: SyncChange[]): Promise<any> {
    const response = await this.api.post<ApiResponse>('/sync/push', { changes });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to push changes');
  }

  async pullChanges(since?: string): Promise<any> {
    const response = await this.api.get<ApiResponse>('/sync/pull', {
      params: { since },
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to pull changes');
  }
}

export default new ApiService();
