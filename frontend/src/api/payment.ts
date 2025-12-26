import apiClient from './client';
import { Supplier } from './supplier';
import { User } from './auth';

export interface Payment {
  id: number;
  supplier_id: number;
  user_id: number;
  payment_date: string;
  amount: number;
  payment_type: 'advance' | 'partial' | 'full';
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  metadata?: any;
  version: number;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  user?: User;
}

export interface CreatePaymentRequest {
  supplier_id: number;
  payment_date: string;
  amount: number;
  payment_type: 'advance' | 'partial' | 'full';
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  metadata?: any;
}

export interface UpdatePaymentRequest extends CreatePaymentRequest {
  version: number;
}

export interface SupplierBalance {
  supplier_id: number;
  supplier_name: string;
  total_collections: number;
  total_payments: number;
  balance: number;
}

export const paymentService = {
  async getAll(params?: { 
    supplier_id?: number; 
    payment_type?: string; 
    from_date?: string; 
    to_date?: string; 
    per_page?: number; 
    page?: number;
  }) {
    const response = await apiClient.get('/payments', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data;
  },

  async create(data: CreatePaymentRequest) {
    const response = await apiClient.post('/payments', data);
    return response.data;
  },

  async update(id: number, data: UpdatePaymentRequest) {
    const response = await apiClient.put(`/payments/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/payments/${id}`);
    return response.data;
  },

  async getSupplierBalance(supplierId: number): Promise<SupplierBalance> {
    const response = await apiClient.get(`/suppliers/${supplierId}/balance`);
    return response.data;
  },
};
