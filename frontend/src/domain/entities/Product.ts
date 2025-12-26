/**
 * Product Domain Entity (TypeScript Interface)
 * 
 * Represents a product with multi-unit support and versioned rates.
 */

export interface Product {
  id: number;
  name: string;
  code: string;
  description?: string;
  unit: string;
  currentRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ProductRate {
  id: number;
  productId: number;
  rate: number;
  unit: string;
  effectiveFrom: string;
  effectiveTo?: string;
  notes?: string;
  createdBy: number;
  createdAt: string;
}

export interface CreateProductInput {
  name: string;
  code: string;
  description?: string;
  unit: string;
  currentRate: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: number;
  version: number;
}

export interface ProductFilters {
  isActive?: boolean;
  searchQuery?: string;
  unit?: string;
  page?: number;
  perPage?: number;
}

export type ProductUnit = 'kg' | 'g' | 'l' | 'ml' | 'unit' | 'dozen';

export const PRODUCT_UNITS: Record<ProductUnit, string> = {
  kg: 'Kilogram',
  g: 'Gram',
  l: 'Liter',
  ml: 'Milliliter',
  unit: 'Unit',
  dozen: 'Dozen',
};
