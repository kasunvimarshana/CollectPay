export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'collector' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  device_id?: string;
}

export interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  metadata?: Record<string, any>;
  status: 'active' | 'inactive' | 'blocked';
  created_by: number;
  balance?: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  unit_type: 'weight' | 'volume';
  base_rate: number;
  current_rate?: number;
  metadata?: Record<string, any>;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  rates?: ProductRate[];
}

export interface ProductRate {
  id: number;
  product_id: number;
  rate: number;
  effective_from: string;
  effective_to?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: User;
}

export interface Collection {
  id?: number;
  supplier_id: number;
  product_id: number;
  user_id: number;
  quantity: number;
  unit: 'g' | 'kg' | 'ml' | 'l';
  rate: number;
  total_amount: number;
  collection_date: string;
  notes?: string;
  device_id?: string;
  sync_status: 'pending' | 'synced' | 'conflict';
  version: number;
  server_timestamp?: string;
  created_at?: string;
  updated_at?: string;
  supplier?: Supplier;
  product?: Product;
  user?: User;
}

export interface Payment {
  id?: number;
  supplier_id: number;
  user_id: number;
  amount: number;
  payment_type: 'advance' | 'partial' | 'full';
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'check';
  reference_number?: string;
  payment_date: string;
  notes?: string;
  device_id?: string;
  sync_status: 'pending' | 'synced' | 'conflict';
  version: number;
  server_timestamp?: string;
  created_at?: string;
  updated_at?: string;
  supplier?: Supplier;
  user?: User;
}

export interface SyncConflict {
  id: number;
  entity_type: 'collection' | 'payment';
  entity_id: number;
  device_id: string;
  local_data: any;
  server_data: any;
  conflict_type: 'update_conflict' | 'delete_conflict' | 'version_mismatch';
  resolution_status: 'pending' | 'resolved' | 'rejected';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AppState {
  isOnline: boolean;
  lastSyncTimestamp: string | null;
  pendingSyncCount: number;
  deviceId: string;
}
