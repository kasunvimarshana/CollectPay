// Type definitions for FieldLedger application

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'collector' | 'viewer';
  permissions?: string[];
  is_active: boolean;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  metadata?: Record<string, any>;
  created_by: number;
  created_at: string;
  updated_at: string;
  balance?: number;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  category?: string;
  base_unit: string;
  alternate_units?: AlternateUnit[];
  status: 'active' | 'inactive';
  metadata?: Record<string, any>;
}

export interface AlternateUnit {
  unit: string;
  factor: number;
}

export interface Rate {
  id: number;
  product_id: number;
  supplier_id?: number;
  rate: number;
  unit: string;
  valid_from: string;
  valid_to?: string;
  is_default: boolean;
  notes?: string;
  created_by: number;
}

export interface Transaction {
  id?: number;
  uuid: string;
  supplier_id: number;
  product_id: number;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  transaction_date: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_by: number;
  device_id?: number;
  synced_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id?: number;
  uuid: string;
  supplier_id: number;
  amount: number;
  payment_type: 'advance' | 'partial' | 'full' | 'adjustment';
  payment_method: string;
  reference_number?: string;
  payment_date: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_by: number;
  device_id?: number;
  synced_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Device {
  id: number;
  device_uuid: string;
  device_name: string;
  device_type: string;
  user_id: number;
  last_sync_at?: string;
  is_active: boolean;
}

export interface SyncStatus {
  pending_transactions: number;
  pending_payments: number;
  last_sync?: string;
  is_syncing: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  device?: Device;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
