/**
 * List Payments Use Case
 * Retrieves all payments from the repository
 */

import { Payment } from '../../domain/entities/Payment';
import { PaymentRepository } from '../../domain/repositories/PaymentRepository';

export class ListPaymentsUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(): Promise<Payment[]> {
    return await this.paymentRepository.findAll();
  }
}
