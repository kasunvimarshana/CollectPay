/**
 * Collection Entity
 * 
 * Represents a collection event where a quantity of product is collected from a supplier.
 */
export interface Collection {
  id?: number;
  supplierId: number;
  productId: number;
  productRateId: number;
  quantity: number;
  rate: number;
  amount: number;
  collectionDate: string;
  collectedBy: number;
  notes?: string;
  version: number;
  syncId: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: SyncStatus;
  
  // Populated fields (not stored, for display)
  supplierName?: string;
  productName?: string;
  collectorName?: string;
}

export interface CreateCollectionDTO {
  supplierId: number;
  productId: number;
  quantity: number;
  collectionDate: string;
  notes?: string;
}

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error';
