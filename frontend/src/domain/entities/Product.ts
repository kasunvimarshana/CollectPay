/**
 * Product Entity
 * 
 * Represents a collectible product with versioned rates.
 */
export interface Product {
  id: string;
  name: string;
  unit: string;
  description?: string;
  isActive: boolean;
  metadata: Record<string, any>;
  currentRate?: ProductRate;
  createdAt: string;
  updatedAt: string;
}

/**
 * Product Rate
 * 
 * Represents a versioned rate for a product.
 */
export interface ProductRate {
  amount: number;
  currency: string;
  unit: string;
  effectiveDate: string;
}
