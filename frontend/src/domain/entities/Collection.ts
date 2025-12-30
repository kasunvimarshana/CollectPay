/**
 * Collection Entity
 * 
 * Domain model for Collection with multi-unit support
 */
export interface Collection {
  id: number;
  supplierId: number;
  productId: number;
  quantity: number;
  unit: string;
  rateApplied: number;
  totalValue: number;
  collectedAt: Date;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCollectionDTO {
  supplierId: number;
  productId: number;
  quantity: number;
  unit: string;
  collectedAt?: Date;
}

export interface UpdateCollectionDTO {
  quantity?: number;
  unit?: string;
  collectedAt?: Date;
}
