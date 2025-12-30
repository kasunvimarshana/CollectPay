// User types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login_at?: string;
  last_login_ip?: string;
  metadata?: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
  created_at: string;
  updated_at: string;
}

// Supplier types
export interface Supplier {
  id: number;
  name: string;
  code: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  status: 'active' | 'inactive';
  metadata?: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  code: string;
  description?: string;
  base_unit: string;
  allowed_units?: string[];
  status: 'active' | 'inactive';
  metadata?: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ProductRate {
  id: number;
  product_id: number;
  rate: number;
  unit: string;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  notes?: string;
  version: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

// Collection types
export interface Collection {
  id: number;
  supplier_id: number;
  product_id: number;
  collected_by: number;
  quantity: number;
  unit: string;
  rate: number;
  rate_id?: number;
  total_amount: number;
  collection_date: string;
  collection_time?: string;
  notes?: string;
  metadata?: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  product?: Product;
  collector?: User;
  product_rate?: ProductRate;
}

// Payment types
export interface Payment {
  id: number;
  supplier_id: number;
  amount: number;
  payment_type: 'advance' | 'partial' | 'final' | 'adjustment';
  payment_date: string;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  recorded_by: number;
  metadata?: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  recorder?: User;
}

// Audit Log types
export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

// Dashboard types
export interface DashboardStats {
  total_suppliers: number;
  total_products: number;
  total_collections: number;
  total_payments: number;
  recent_collections: Collection[];
  recent_payments: Payment[];
  outstanding_balance: number;
}

// Sync types
export interface SyncState {
  isSyncing: boolean;
  lastSyncTime?: string;
  pendingOperations: number;
  error?: string;
}

export interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: string;
}
