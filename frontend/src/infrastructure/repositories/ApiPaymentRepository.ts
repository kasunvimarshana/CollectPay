/**
 * API Repository Implementation for Payments
 */

import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { Payment, PaymentType } from '../../domain/entities/Payment';
import { apiClient } from '../api/ApiClient';

interface PaymentDTO {
  id: string;
  supplier_id: string;
  amount: number;
  currency: string;
  type: PaymentType;
  payment_date: string;
  reference: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export class ApiPaymentRepository implements PaymentRepository {
  private mapFromDTO(dto: PaymentDTO): Payment {
    return Payment.create(
      dto.id,
      dto.supplier_id,
      dto.amount,
      dto.currency,
      dto.type,
      new Date(dto.payment_date),
      dto.reference,
      dto.notes,
      new Date(dto.created_at),
      new Date(dto.updated_at)
    );
  }

  private mapToDTO(payment: Payment): Partial<PaymentDTO> {
    const amount = payment.getAmount();
    
    return {
      supplier_id: payment.getSupplierId(),
      amount: amount.getAmount(),
      currency: amount.getCurrency(),
      type: payment.getType(),
      payment_date: payment.getPaymentDate().toISOString(),
      reference: payment.getReference(),
      notes: payment.getNotes(),
    };
  }

  async findAll(): Promise<Payment[]> {
    const response = await apiClient.get<ApiResponse<PaymentDTO[]>>('/payments');
    return response.data.map(dto => this.mapFromDTO(dto));
  }

  async findById(id: string): Promise<Payment | null> {
    try {
      const response = await apiClient.get<ApiResponse<PaymentDTO>>(`/payments/${id}`);
      return this.mapFromDTO(response.data);
    } catch (error) {
      return null;
    }
  }

  async findBySupplierId(supplierId: string): Promise<Payment[]> {
    const response = await apiClient.get<ApiResponse<PaymentDTO[]>>(
      `/payments?supplier_id=${supplierId}`
    );
    return response.data.map(dto => this.mapFromDTO(dto));
  }

  async create(payment: Payment): Promise<Payment> {
    const dto = this.mapToDTO(payment);
    const response = await apiClient.post<ApiResponse<PaymentDTO>>('/payments', dto);
    return this.mapFromDTO(response.data);
  }

  async update(payment: Payment): Promise<Payment> {
    const dto = this.mapToDTO(payment);
    const response = await apiClient.put<ApiResponse<PaymentDTO>>(
      `/payments/${payment.getId()}`,
      dto
    );
    return this.mapFromDTO(response.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/payments/${id}`);
  }
}
