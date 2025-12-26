import apiClient from './client';

export interface Product {
  id: number;
  name: string;
  code: string;
  description?: string;
  default_unit: string;
  supported_units?: string[];
  metadata?: any;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  rates?: ProductRate[];
}

export interface ProductRate {
  id: number;
  product_id: number;
  unit: string;
  rate: number;
  effective_date: string;
  end_date?: string;
  is_active: boolean;
  metadata?: any;
  version: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface CreateProductRequest {
  name: string;
  code: string;
  description?: string;
  default_unit: string;
  supported_units?: string[];
  metadata?: any;
  is_active?: boolean;
}

export interface UpdateProductRequest extends CreateProductRequest {
  version: number;
}

export interface CreateProductRateRequest {
  product_id: number;
  unit: string;
  rate: number;
  effective_date: string;
  end_date?: string;
  metadata?: any;
  is_active?: boolean;
}

export interface UpdateProductRateRequest extends CreateProductRateRequest {
  version: number;
}

export const productService = {
  async getAll(params?: { search?: string; is_active?: boolean; per_page?: number; page?: number }) {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  async create(data: CreateProductRequest) {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  async update(id: number, data: UpdateProductRequest) {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};

export const productRateService = {
  async getAll(params?: { product_id?: number; unit?: string; is_active?: boolean; per_page?: number; page?: number }) {
    const response = await apiClient.get('/product-rates', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await apiClient.get(`/product-rates/${id}`);
    return response.data;
  },

  async create(data: CreateProductRateRequest) {
    const response = await apiClient.post('/product-rates', data);
    return response.data;
  },

  async update(id: number, data: UpdateProductRateRequest) {
    const response = await apiClient.put(`/product-rates/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/product-rates/${id}`);
    return response.data;
  },
};
