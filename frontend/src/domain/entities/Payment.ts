/**
 * Payment Entity
 * 
 * Represents a payment made to a supplier.
 */
export interface Payment {
  id?: number;
  supplierId: number;
  amount: number;
  type: PaymentType;
  paymentDate: string;
  paidBy: number;
  notes?: string;
  reference?: string;
  version: number;
  syncId: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: SyncStatus;
  
  // Populated fields (not stored, for display)
  supplierName?: string;
  paidByName?: string;
}

export type PaymentType = 'advance' | 'partial' | 'final';

export interface CreatePaymentDTO {
  supplierId: number;
  amount: number;
  type: PaymentType;
  paymentDate: string;
  notes?: string;
}

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error';
