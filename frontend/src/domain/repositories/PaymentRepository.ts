/**
 * Repository Interface for Payments
 */

import { Payment } from '../entities/Payment';

export interface PaymentRepository {
  findAll(): Promise<Payment[]>;
  findById(id: string): Promise<Payment | null>;
  findBySupplierId(supplierId: string): Promise<Payment[]>;
  create(payment: Payment): Promise<Payment>;
  update(payment: Payment): Promise<Payment>;
  delete(id: string): Promise<void>;
}
