/**
 * Product and Rate Entities
 */

export interface Product {
  id: number;
  name: string;
  code: string;
  description?: string;
  base_unit: string;
  supported_units: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Rate {
  id: number;
  product_id: number;
  rate: number;
  unit: string;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  version: number;
  product?: Product;
  created_at: string;
  updated_at: string;
}
