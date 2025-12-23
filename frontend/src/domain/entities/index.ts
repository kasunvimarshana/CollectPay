// Domain Entities

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'collector' | 'manager';
  permissions: string[];
  is_active: boolean;
}

export interface Supplier {
  id?: number;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  credit_limit: number;
  current_balance: number;
  metadata?: Record<string, any>;
  is_active: boolean;
  version: number;
  created_at?: string;
  updated_at?: string;
  last_sync_at?: string;
}

export interface Product {
  id?: number;
  code: string;
  name: string;
  description?: string;
  unit: string;
  category?: string;
  metadata?: Record<string, any>;
  is_active: boolean;
  version: number;
  created_at?: string;
  updated_at?: string;
  last_sync_at?: string;
}

export interface Rate {
  id?: number;
  product_id: number;
  supplier_id?: number;
  rate: number;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  notes?: string;
  version: number;
  created_at?: string;
  updated_at?: string;
  last_sync_at?: string;
}

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
  amount: number;
  notes?: string;
  collector_id?: number;
  sync_status: 'pending' | 'synced' | 'conflict';
  version: number;
  created_at?: string;
  updated_at?: string;
  last_sync_at?: string;
}

export interface Payment {
  id?: number;
  uuid: string;
  reference_number: string;
  supplier_id: number;
  payment_date: string;
  amount: number;
  payment_type: 'advance' | 'partial' | 'full' | 'adjustment';
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'mobile';
  transaction_reference?: string;
  notes?: string;
  balance_before: number;
  balance_after: number;
  processed_by?: number;
  sync_status: 'pending' | 'synced' | 'conflict';
  version: number;
  created_at?: string;
  updated_at?: string;
  last_sync_at?: string;
}

export interface SyncItem {
  entity_type: 'suppliers' | 'products' | 'rates' | 'collections' | 'payments';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

export interface SyncResult {
  success: any[];
  conflicts: any[];
  errors: any[];
}
