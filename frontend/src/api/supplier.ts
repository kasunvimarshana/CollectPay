import apiClient from './client';

export interface Supplier {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  metadata?: any;
  is_active: boolean;
  version: number;
  total_collections?: number;
  total_payments?: number;
  balance?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierRequest {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  metadata?: any;
  is_active?: boolean;
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {
  version: number;
}

export const supplierService = {
  async getAll(params?: { search?: string; is_active?: boolean; per_page?: number; page?: number; include_balance?: boolean }) {
    const response = await apiClient.get('/suppliers', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await apiClient.get(`/suppliers/${id}`);
    return response.data;
  },

  async getBalance(id: number) {
    const response = await apiClient.get(`/suppliers/${id}/balance`);
    return response.data;
  },

  async create(data: CreateSupplierRequest) {
    const response = await apiClient.post('/suppliers', data);
    return response.data;
  },

  async update(id: number, data: UpdateSupplierRequest) {
    const response = await apiClient.put(`/suppliers/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/suppliers/${id}`);
    return response.data;
  },
};
