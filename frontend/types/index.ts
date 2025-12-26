// User types
export interface User {
  id: number;
  uuid?: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'collector';
  permissions?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Supplier types
export interface Supplier {
  id?: number;
  uuid: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  registration_number?: string;
  metadata?: Record<string, any>;
  is_active: boolean;
  version: number;
  is_synced?: boolean;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

// Product types
export interface Product {
  id?: number;
  uuid: string;
  name: string;
  code?: string;
  description?: string;
  unit: string;
  category?: string;
  is_active: boolean;
  version: number;
  is_synced?: boolean;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

// Rate types
export interface Rate {
  id?: number;
  uuid: string;
  supplier_id: number;
  product_id: number;
  rate: number;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  notes?: string;
  version: number;
  is_synced?: boolean;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  supplier?: Supplier;
  product?: Product;
}

// Collection types
export interface Collection {
  id?: number;
  uuid: string;
  supplier_id: number;
  product_id: number;
  rate_id?: number;
  collection_date: string;
  quantity: number;
  unit: string;
  rate_applied: number;
  total_amount: number;
  notes?: string;
  is_synced: boolean;
  synced_at?: string;
  collected_by?: number;
  version: number;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  supplier?: Supplier;
  product?: Product;
  rate?: Rate;
}

// Payment types
export type PaymentType = 'advance' | 'partial' | 'full' | 'adjustment';

export interface Payment {
  id?: number;
  uuid: string;
  supplier_id: number;
  payment_date: string;
  amount: number;
  payment_type: PaymentType;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  allocation?: Record<string, any>;
  is_synced: boolean;
  synced_at?: string;
  processed_by?: number;
  version: number;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  supplier?: Supplier;
}

// Sync types
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
export type EntityType = 'suppliers' | 'products' | 'rates' | 'collections' | 'payments';
export type SyncOperation = 'create' | 'update' | 'delete';

export interface SyncQueueItem {
  id?: number;
  entity_type: EntityType;
  entity_uuid: string;
  operation: SyncOperation;
  payload: any;
  status: 'pending' | 'syncing' | 'success' | 'error';
  retry_count: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncResult {
  status: 'success' | 'conflict' | 'error';
  entity_type: EntityType;
  uuid: string;
  operation?: string;
  data?: any;
  server_data?: any;
  server_version?: number;
  resolution?: string;
  message?: string;
}

export interface SyncStats {
  pending: number;
  syncing: number;
  error: number;
  lastSync: string | null;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Pagination types
export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Balance types
export interface SupplierBalance {
  supplier: Supplier;
  total_collections: number;
  total_payments: number;
  balance: number;
  recent_collections: Collection[];
  recent_payments: Payment[];
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  device_id?: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
}

export interface SupplierForm {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  registration_number?: string;
  is_active?: boolean;
}

export interface ProductForm {
  name: string;
  code?: string;
  description?: string;
  unit: string;
  category?: string;
  is_active?: boolean;
}

export interface RateForm {
  supplier_id: number;
  product_id: number;
  rate: number;
  effective_from: string;
  effective_to?: string;
  notes?: string;
  is_active?: boolean;
}

export interface CollectionForm {
  supplier_id: number;
  product_id: number;
  collection_date: string;
  quantity: number;
  unit: string;
  rate_applied?: number;
  notes?: string;
}

export interface PaymentForm {
  supplier_id: number;
  payment_date: string;
  amount: number;
  payment_type: PaymentType;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
}
