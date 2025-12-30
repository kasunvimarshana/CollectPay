/**
 * Payment Entity
 * 
 * Domain model for Payment
 */
export interface Payment {
  id: number;
  supplierId: number;
  amount: number;
  paymentType: 'advance' | 'partial' | 'final';
  notes: string | null;
  paidAt: Date;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDTO {
  supplierId: number;
  amount: number;
  paymentType: 'advance' | 'partial' | 'final';
  notes?: string;
  paidAt?: Date;
}

export interface PaymentBalance {
  supplierId: number;
  totalCollections: number;
  totalPayments: number;
  balance: number;
  status: 'due' | 'overpaid' | 'settled';
}
