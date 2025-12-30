/**
 * Create Payment Use Case
 */

import { Payment, PaymentType } from '../../domain/entities/Payment';
import { PaymentRepository } from '../../domain/repositories/PaymentRepository';

export interface CreatePaymentDTO {
  supplierId: string;
  amount: number;
  currency: string;
  type: PaymentType;
  paymentDate: Date;
  reference?: string;
  notes?: string;
}

export class CreatePaymentUseCase {
  constructor(private paymentRepository: PaymentRepository) {}

  async execute(dto: CreatePaymentDTO): Promise<Payment> {
    // Validation
    if (!dto.supplierId) {
      throw new Error('Supplier ID is required');
    }
    if (dto.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }
    if (!dto.type) {
      throw new Error('Payment type is required');
    }

    const payment = Payment.create(
      'temp-' + Date.now(),
      dto.supplierId,
      dto.amount,
      dto.currency,
      dto.type,
      dto.paymentDate,
      dto.reference || '',
      dto.notes || ''
    );

    return await this.paymentRepository.create(payment);
  }
}
