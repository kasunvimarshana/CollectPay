/**
 * ProductRate Entity
 * 
 * Represents a versioned rate for a product at a specific point in time.
 * Immutable - historical rates are never modified.
 */
export interface ProductRate {
  id: number;
  productId: number;
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  version: number;
  createdBy: number;
  createdAt: string;
}

export interface RateCalculation {
  quantity: number;
  rate: number;
  rateId: number;
  amount: number;
  effectiveFrom: string;
}
