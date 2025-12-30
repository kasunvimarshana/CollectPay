/**
 * Payment Entity
 * 
 * Domain layer entity representing a payment record.
 */
export type PaymentType = 'advance' | 'partial' | 'total';

export interface Payment {
  id: string;
  supplierId: string;
  amount: number;
  paymentType: PaymentType;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreatePaymentDTO {
  supplierId: number;
  amount: number;
  paymentType: PaymentType;
  paymentDate: Date;
  referenceNumber?: string;
  notes?: string;
}

export interface UpdatePaymentDTO {
  amount?: number;
  notes?: string;
}
