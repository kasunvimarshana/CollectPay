export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'collector';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  registration_number?: string;
  is_active: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
  total_collections_amount?: number;
  total_payments_amount?: number;
  balance_amount?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  code: string;
  default_unit: string;
  is_active: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductRate {
  id: number;
  product_id: number;
  unit: string;
  rate: number;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Collection {
  id: number;
  supplier_id: number;
  product_id: number;
  product_rate_id?: number;
  collection_date: string;
  quantity: number;
  unit: string;
  rate_applied?: number;
  total_amount?: number;
  notes?: string;
  collected_by: number;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  product?: Product;
  product_rate?: ProductRate;
}

export interface Payment {
  id: number;
  supplier_id: number;
  payment_date: string;
  amount: number;
  payment_type: 'advance' | 'partial' | 'full';
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
