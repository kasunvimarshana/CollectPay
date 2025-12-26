/**
 * Payment Domain Entity (TypeScript Interface)
 * 
 * Represents a payment transaction supporting advance, partial, and final payments.
 */

export interface Payment {
  id: number;
  supplierId: number;
  amount: number;
  paymentType: PaymentType;
  paymentDate: string;
  paidBy: number;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  
  // Related data (populated from API)
  supplier?: {
    id: number;
    name: string;
    code: string;
  };
  payer?: {
    id: number;
    name: string;
  };
}

export type PaymentType = 'advance' | 'partial' | 'final';

export const PAYMENT_TYPES: Record<PaymentType, string> = {
  advance: 'Advance Payment',
  partial: 'Partial Payment',
  final: 'Final Payment',
};

export interface CreatePaymentInput {
  supplierId: number;
  amount: number;
  paymentType: PaymentType;
  paymentDate: string;
  reference?: string;
  notes?: string;
}

export interface UpdatePaymentInput {
  id: number;
  amount?: number;
  reference?: string;
  notes?: string;
  version: number;
}

export interface PaymentFilters {
  supplierId?: number;
  paymentType?: PaymentType;
  paidBy?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}

export interface PaymentCalculation {
  supplierId: number;
  totalCollections: number;
  totalPaid: number;
  balance: number;
  isFullyPaid: boolean;
  advancePayments: {
    totalAdvance: number;
    advanceUtilized: number;
    advanceRemaining: number;
  };
  recommendedPayment: number;
}

export interface PaymentBreakdown {
  collections: Array<{
    productId: number;
    productName: string;
    totalQuantity: number;
    totalAmount: number;
    collectionsCount: number;
  }>;
  payments: {
    advance: number;
    partial: number;
    final: number;
  };
  summary: {
    totalCollections: number;
    totalPaid: number;
    balance: number;
    isFullyPaid: boolean;
  };
}
