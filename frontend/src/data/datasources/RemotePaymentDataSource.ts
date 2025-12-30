/**
 * Remote Payment Data Source
 * Handles API communication for payment operations
 */

import { Payment } from '../../domain/entities/Payment';
import { HttpClient } from './HttpClient';

export class RemotePaymentDataSource {
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a new payment
   */
  async create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    return await this.httpClient.post<Payment>('/payments', data);
  }

  /**
   * Get payment by ID
   */
  async getById(id: string): Promise<Payment> {
    return await this.httpClient.get<Payment>(`/payments/${id}`);
  }

  /**
   * Get all payments
   */
  async getAll(page: number = 1, limit: number = 20): Promise<Payment[]> {
    return await this.httpClient.get<Payment[]>(`/payments?page=${page}&limit=${limit}`);
  }

  /**
   * Get payments by supplier
   */
  async getBySupplier(supplierId: string, page: number = 1, limit: number = 20): Promise<Payment[]> {
    return await this.httpClient.get<Payment[]>(`/payments/supplier/${supplierId}?page=${page}&limit=${limit}`);
  }

  /**
   * Update payment
   */
  async update(id: string, data: Partial<Payment>): Promise<Payment> {
    return await this.httpClient.put<Payment>(`/payments/${id}`, data);
  }

  /**
   * Delete payment
   */
  async delete(id: string): Promise<boolean> {
    await this.httpClient.delete(`/payments/${id}`);
    return true;
  }

  /**
   * Get total paid
   */
  async getTotalPaid(supplierId: string): Promise<number> {
    const response = await this.httpClient.get<{ total: number }>(`/payments/total-paid/${supplierId}`);
    return response.total;
  }
}
