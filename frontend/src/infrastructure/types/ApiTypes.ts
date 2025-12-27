/**
 * API Response Types
 * 
 * Type definitions for API responses to ensure type safety.
 */

/**
 * Base API entity response
 */
export interface BaseApiResponse {
  id: number;
  created_at?: string;
  updated_at?: string;
  version?: number;
}

/**
 * Supplier API response
 */
export interface SupplierApiResponse extends BaseApiResponse {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  metadata?: any;
  is_active: boolean;
  total_collections?: number;
  total_payments?: number;
  balance?: number;
}

/**
 * Product API response
 */
export interface ProductApiResponse extends BaseApiResponse {
  name: string;
  code: string;
  description?: string;
  default_unit: string;
  supported_units: string[];
  metadata?: any;
  is_active: boolean;
}

/**
 * Collection API response
 */
export interface CollectionApiResponse extends BaseApiResponse {
  supplier_id: number;
  product_id: number;
  product_rate_id?: number;
  collection_date: string;
  quantity: number;
  unit: string;
  rate_per_unit: number;
  total_amount: number;
  notes?: string;
  metadata?: any;
}

/**
 * Payment API response
 */
export interface PaymentApiResponse extends BaseApiResponse {
  supplier_id: number;
  amount: number;
  payment_date: string;
  payment_type: 'advance' | 'partial' | 'full';
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  metadata?: any;
}

/**
 * Product Rate API response
 */
export interface ProductRateApiResponse extends BaseApiResponse {
  product_id: number;
  rate_per_unit: number;
  unit: string;
  effective_from: string;
  effective_to?: string;
  notes?: string;
  is_active: boolean;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  error: string;
  status: number;
  code?: string;
  details?: string;
  trace?: string;
}
