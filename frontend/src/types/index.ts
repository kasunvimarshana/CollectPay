export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
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
  status: 'active' | 'inactive';
  created_by: number;
  updated_by?: number;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Product {
  id: number;
  supplier_id: number;
  name: string;
  description?: string;
  sku?: string;
  units?: string[];
  default_unit?: string;
  status: 'active' | 'inactive';
  created_by: number;
  updated_by?: number;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ProductRate {
  id: number;
  product_id: number;
  rate: number;
  unit: string;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  created_by: number;
  updated_by?: number;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Payment {
  id: number;
  supplier_id: number;
  product_id?: number;
  amount: number;
  payment_type: 'advance' | 'partial' | 'full';
  payment_method?: 'cash' | 'bank_transfer' | 'check';
  reference_number?: string;
  notes?: string;
  payment_date: string;
  created_by: number;
  updated_by?: number;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
  last_page: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SyncChange {
  entity_type: 'suppliers' | 'products' | 'rates' | 'payments';
  operation: 'create' | 'update' | 'delete';
  data: any;
  client_timestamp: string;
  client_id: string;
}

export interface SyncConflict {
  entity_type: string;
  entity_id: number;
  conflict_type: 'version_mismatch' | 'concurrent_edit' | 'deleted_on_server';
  server_data: any;
  client_data: any;
}
