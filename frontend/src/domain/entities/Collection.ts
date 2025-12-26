/**
 * Collection Domain Entity (TypeScript Interface)
 * 
 * Represents a collection record with multi-unit support
 * and historical rate preservation.
 */

export interface Collection {
  id: number;
  supplierId: number;
  productId: number;
  quantity: number;
  unit: string;
  appliedRate: number;
  totalAmount: number;
  collectionDate: string;
  collectedBy: number;
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
  product?: {
    id: number;
    name: string;
    code: string;
    unit: string;
  };
  collector?: {
    id: number;
    name: string;
  };
}

export interface CreateCollectionInput {
  supplierId: number;
  productId: number;
  quantity: number;
  unit: string;
  appliedRate?: number; // Optional, will use current rate if not provided
  collectionDate: string;
  notes?: string;
}

export interface UpdateCollectionInput {
  id: number;
  quantity?: number;
  appliedRate?: number;
  notes?: string;
  version: number;
}

export interface CollectionFilters {
  supplierId?: number;
  productId?: number;
  collectedBy?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}

export interface CollectionSummary {
  totalCollections: number;
  totalQuantity: number;
  totalAmount: number;
  averageQuantity: number;
  collectionsPerDay: number;
}
