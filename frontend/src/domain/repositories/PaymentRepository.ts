import { Payment, CreatePaymentDTO, PaymentBalance } from '../entities/Payment';

/**
 * Payment Repository Interface
 */
export interface PaymentRepository {
  getAll(page?: number, perPage?: number): Promise<Payment[]>;
  getById(id: number): Promise<Payment | null>;
  getBySupplier(supplierId: number): Promise<Payment[]>;
  create(data: CreatePaymentDTO): Promise<Payment>;
  delete(id: number): Promise<boolean>;
  getBalance(supplierId: number): Promise<PaymentBalance>;
}
