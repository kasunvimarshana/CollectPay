import apiClient from './client';
import { Supplier } from './supplier';
import { Product, ProductRate } from './product';
import { User } from './auth';

export interface Collection {
  id: number;
  supplier_id: number;
  product_id: number;
  user_id: number;
  product_rate_id?: number;
  collection_date: string;
  quantity: number;
  unit: string;
  rate_applied: number;
  total_amount: number;
  notes?: string;
  metadata?: any;
  version: number;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  product?: Product;
  user?: User;
  productRate?: ProductRate;
}

export interface CreateCollectionRequest {
  supplier_id: number;
  product_id: number;
  collection_date: string;
  quantity: number;
  unit: string;
  notes?: string;
  metadata?: any;
}

export interface UpdateCollectionRequest extends CreateCollectionRequest {
  version: number;
}

export const collectionService = {
  async getAll(params?: { 
    supplier_id?: number; 
    product_id?: number; 
    from_date?: string; 
    to_date?: string; 
    per_page?: number; 
    page?: number;
  }) {
    const response = await apiClient.get('/collections', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await apiClient.get(`/collections/${id}`);
    return response.data;
  },

  async create(data: CreateCollectionRequest) {
    const response = await apiClient.post('/collections', data);
    return response.data;
  },

  async update(id: number, data: UpdateCollectionRequest) {
    const response = await apiClient.put(`/collections/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/collections/${id}`);
    return response.data;
  },
};
