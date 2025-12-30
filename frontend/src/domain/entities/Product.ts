/**
 * Product Entity
 * 
 * Domain model for Product with rate versioning
 */
export interface Product {
  id: number;
  name: string;
  unit: string;
  currentRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductRate {
  id: number;
  productId: number;
  rate: number;
  unit: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
}

export interface CreateProductDTO {
  name: string;
  unit: string;
  currentRate: number;
}

export interface UpdateProductDTO {
  name?: string;
  unit?: string;
  currentRate?: number;
}
