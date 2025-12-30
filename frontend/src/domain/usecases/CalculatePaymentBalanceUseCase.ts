import { PaymentBalance } from '../entities/Payment';
import { CollectionRepository } from '../repositories/CollectionRepository';
import { PaymentRepository } from '../repositories/PaymentRepository';

/**
 * Calculate Payment Balance Use Case
 * 
 * Calculates supplier payment balance (collections - payments).
 */
export class CalculatePaymentBalanceUseCase {
  constructor(
    private collectionRepository: CollectionRepository,
    private paymentRepository: PaymentRepository
  ) {}

  async execute(supplierId: number): Promise<PaymentBalance> {
    // Get all collections for supplier
    const collections = await this.collectionRepository.getBySupplier(supplierId);
    
    // Get all payments for supplier
    const payments = await this.paymentRepository.getBySupplier(supplierId);

    // Calculate totals
    const totalCollections = collections.reduce(
      (sum, c) => sum + c.totalValue,
      0
    );

    const totalPayments = payments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    const balance = totalCollections - totalPayments;

    return {
      supplierId,
      totalCollections: Math.round(totalCollections * 100) / 100,
      totalPayments: Math.round(totalPayments * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      status: balance > 0 ? 'due' : balance < 0 ? 'overpaid' : 'settled',
    };
  }
}
