/**
 * Collection Entity
 * 
 * Represents a collection transaction.
 */
export interface Collection {
  id: string;
  supplierId: string;
  productId: string;
  userId: string;
  quantity: Quantity;
  rate: Rate;
  totalAmount: Money;
  collectedAt: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Quantity Value Object
 */
export interface Quantity {
  value: number;
  unit: string;
}

/**
 * Rate Value Object
 */
export interface Rate {
  amount: number;
  currency: string;
  unit: string;
  effectiveDate: string;
}

/**
 * Money Value Object
 */
export interface Money {
  amount: number;
  currency: string;
}
