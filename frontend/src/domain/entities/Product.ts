/**
 * Product Entity
 * 
 * Domain layer entity representing a product with multi-unit support.
 */
export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ProductRate {
  id: string;
  productId: string;
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
  version: number;
}

export interface CreateProductDTO {
  name: string;
  code: string;
  unit: ProductUnit;
  description?: string;
}

export interface UpdateProductDTO {
  name?: string;
  unit?: ProductUnit;
  description?: string;
  isActive?: boolean;
}

export interface CreateProductRateDTO {
  productId: number;
  rate: number;
  effectiveFrom: Date;
}
