/**
 * Product Entity
 * 
 * Represents a product/item that can be collected from suppliers.
 */
export interface Product {
  id: number;
  name: string;
  code: string;
  unit: string;
  description?: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  currentRate?: ProductRate;
  syncStatus?: SyncStatus;
}

export type ProductUnit = 'kg' | 'g' | 'lbs' | 'items' | 'liters' | 'units';

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error';
