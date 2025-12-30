/**
 * Collection Entity
 * 
 * Domain layer entity representing a collection record.
 */
export interface Collection {
  id: string;
  supplierId: string;
  productId: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  collectionDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateCollectionDTO {
  supplierId: number;
  productId: number;
  productRateId: number;
  quantity: number;
  collectionDate: Date;
  notes?: string;
}

export interface UpdateCollectionDTO {
  quantity?: number;
  notes?: string;
}
