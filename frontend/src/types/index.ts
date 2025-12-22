export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'collector';
  permissions?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  code: string;
  phone?: string;
  address?: string;
  area?: string;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  code: string;
  unit: 'gram' | 'kilogram' | 'liter' | 'milliliter';
  description?: string;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Rate {
  id: number;
  product_id: number;
  supplier_id?: number;
  rate: number;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  product?: Product;
  supplier?: Supplier;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id?: number;
  client_id: string;
  user_id: number;
  supplier_id: number;
  product_id: number;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  collection_date: string;
  notes?: string;
  metadata?: Record<string, any>;
  synced_at?: string;
  version: number;
  supplier?: Supplier;
  product?: Product;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id?: number;
  client_id: string;
  user_id: number;
  supplier_id: number;
  collection_id?: number;
  payment_type: 'advance' | 'partial' | 'full';
  amount: number;
  payment_date: string;
  payment_method?: 'cash' | 'bank_transfer' | 'check';
  reference_number?: string;
  notes?: string;
  metadata?: Record<string, any>;
  synced_at?: string;
  version: number;
  supplier?: Supplier;
  collection?: Collection;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SyncResult {
  client_id: string;
  status: 'created' | 'updated' | 'conflict';
  id?: number;
  message?: string;
  server_data?: Collection | Payment;
}

export interface SyncResponse {
  message: string;
  results: SyncResult[];
}
