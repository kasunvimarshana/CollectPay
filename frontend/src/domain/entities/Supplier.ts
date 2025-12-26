/**
 * Supplier Entity
 * 
 * Represents a supplier/vendor from whom products are collected.
 */
export interface Supplier {
  id: number;
  name: string;
  code: string;
  phone?: string;
  address?: string;
  region?: string;
  notes?: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  syncStatus?: SyncStatus;
}

export interface SupplierBalance {
  supplierId: number;
  totalCollected: number;
  totalPaid: number;
  balance: number;
  calculatedAt: string;
}

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error';
