import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';
import {
  User,
  Supplier,
  Product,
  ProductRate,
  Collection,
  Payment,
  AuthResponse,
  PaginatedResponse,
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: string;
  }): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/register', data);
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/login', {
      email,
      password,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/logout');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/me');
    return response.data;
  }

  // Suppliers
  async getSuppliers(params?: {
    is_active?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Supplier>> {
    const response = await this.api.get<PaginatedResponse<Supplier>>('/suppliers', { params });
    return response.data;
  }

  async getSupplier(id: number): Promise<Supplier> {
    const response = await this.api.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  }

  async createSupplier(data: Partial<Supplier>): Promise<{ message: string; data: Supplier }> {
    const response = await this.api.post<{ message: string; data: Supplier }>('/suppliers', data);
    return response.data;
  }

  async updateSupplier(id: number, data: Partial<Supplier>): Promise<{ message: string; data: Supplier }> {
    const response = await this.api.put<{ message: string; data: Supplier }>(`/suppliers/${id}`, data);
    return response.data;
  }

  async deleteSupplier(id: number): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(`/suppliers/${id}`);
    return response.data;
  }

  // Products
  async getProducts(params?: {
    is_active?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Product>> {
    const response = await this.api.get<PaginatedResponse<Product>>('/products', { params });
    return response.data;
  }

  async getProduct(id: number): Promise<Product> {
    const response = await this.api.get<Product>(`/products/${id}`);
    return response.data;
  }

  async createProduct(data: Partial<Product>): Promise<{ message: string; data: Product }> {
    const response = await this.api.post<{ message: string; data: Product }>('/products', data);
    return response.data;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<{ message: string; data: Product }> {
    const response = await this.api.put<{ message: string; data: Product }>(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(`/products/${id}`);
    return response.data;
  }

  // Product Rates
  async getProductRates(params?: {
    product_id?: number;
    is_active?: boolean;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<ProductRate>> {
    const response = await this.api.get<PaginatedResponse<ProductRate>>('/product-rates', { params });
    return response.data;
  }

  async createProductRate(data: Partial<ProductRate>): Promise<{ message: string; data: ProductRate }> {
    const response = await this.api.post<{ message: string; data: ProductRate }>('/product-rates', data);
    return response.data;
  }

  // Collections
  async getCollections(params?: {
    supplier_id?: number;
    product_id?: number;
    collected_by?: number;
    date_from?: string;
    date_to?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Collection>> {
    const response = await this.api.get<PaginatedResponse<Collection>>('/collections', { params });
    return response.data;
  }

  async createCollection(data: Partial<Collection>): Promise<{ message: string; data: Collection }> {
    const response = await this.api.post<{ message: string; data: Collection }>('/collections', data);
    return response.data;
  }

  async updateCollection(id: number, data: Partial<Collection>): Promise<{ message: string; data: Collection }> {
    const response = await this.api.put<{ message: string; data: Collection }>(`/collections/${id}`, data);
    return response.data;
  }

  async deleteCollection(id: number): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(`/collections/${id}`);
    return response.data;
  }

  // Payments
  async getPayments(params?: {
    supplier_id?: number;
    payment_type?: string;
    date_from?: string;
    date_to?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Payment>> {
    const response = await this.api.get<PaginatedResponse<Payment>>('/payments', { params });
    return response.data;
  }

  async createPayment(data: Partial<Payment>): Promise<{ message: string; data: Payment }> {
    const response = await this.api.post<{ message: string; data: Payment }>('/payments', data);
    return response.data;
  }

  async updatePayment(id: number, data: Partial<Payment>): Promise<{ message: string; data: Payment }> {
    const response = await this.api.put<{ message: string; data: Payment }>(`/payments/${id}`, data);
    return response.data;
  }

  async deletePayment(id: number): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(`/payments/${id}`);
    return response.data;
  }
}

export default new ApiService();
