import { PaymentRepositoryInterface } from '../../domain/repositories/PaymentRepositoryInterface';
import { Payment, Money } from '../../domain/entities/Payment';
import { apiClient } from '../../core/network/ApiClient';
import { API_ENDPOINTS } from '../../core/constants/api';

/**
 * Payment Repository Implementation
 * 
 * Implements payment operations using the API client.
 */
export class PaymentRepository implements PaymentRepositoryInterface {
  async getAll(
    page: number = 1,
    perPage: number = 15,
    filters?: Record<string, any>
  ): Promise<{
    data: Payment[];
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  }> {
    const params: Record<string, any> = {
      page,
      per_page: perPage,
      ...filters,
    };

    return await apiClient.get(API_ENDPOINTS.PAYMENTS, { params });
  }

  async getById(id: string): Promise<Payment> {
    return await apiClient.get<Payment>(API_ENDPOINTS.PAYMENT(id));
  }

  async create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const requestData = {
      supplier_id: data.supplierId,
      user_id: data.userId,
      amount: data.amount.amount,
      currency: data.amount.currency,
      payment_type: data.paymentType,
      payment_date: data.paymentDate,
      reference: data.reference,
      metadata: data.metadata,
    };

    return await apiClient.post<Payment>(API_ENDPOINTS.PAYMENTS, requestData);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PAYMENT(id));
  }

  async calculateTotal(supplierId: string, fromDate?: string, toDate?: string): Promise<Money> {
    const params: Record<string, any> = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;

    const response = await apiClient.get<{ total_amount: Money }>(
      API_ENDPOINTS.PAYMENT_TOTAL(supplierId),
      { params }
    );

    return response.total_amount;
  }

  async calculateBalance(supplierId: string, fromDate?: string, toDate?: string): Promise<Money> {
    const params: Record<string, any> = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;

    const response = await apiClient.get<{ balance: Money }>(
      API_ENDPOINTS.PAYMENT_BALANCE(supplierId),
      { params }
    );

    return response.balance;
  }
}
