/**
 * Payment Entity
 * 
 * Represents a payment transaction.
 */
export interface Payment {
  id: string;
  supplierId: string;
  userId: string;
  amount: Money;
  paymentType: 'advance' | 'partial' | 'full';
  paymentDate: string;
  reference?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Money Value Object
 */
export interface Money {
  amount: number;
  currency: string;
}
