export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id?: number;
  uuid: string;
  name: string;
  description?: string;
  created_by: number;
  updated_by?: number;
  status: 'active' | 'inactive' | 'archived';
  metadata?: any;
  version: number;
  synced_at?: string;
  device_id?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface Payment {
  id?: number;
  uuid: string;
  payment_reference: string;
  collection_id: number;
  rate_id?: number;
  payer_id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'other';
  notes?: string;
  payment_date: string;
  processed_at?: string;
  is_automated: boolean;
  metadata?: any;
  version: number;
  created_by: number;
  updated_by?: number;
  synced_at?: string;
  device_id?: string;
  idempotency_key: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface Rate {
  id?: number;
  uuid: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  rate_type: string;
  collection_id?: number;
  version: number;
  effective_from: string;
  effective_until?: string;
  is_active: boolean;
  metadata?: any;
  created_by: number;
  updated_by?: number;
  synced_at?: string;
  device_id?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface SyncQueueItem {
  uuid: string;
  entity_type: 'collection' | 'payment' | 'rate';
  entity_uuid: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  retry_count: number;
  device_id: string;
  created_at: string;
}

export interface SyncConflict {
  entity_type: 'collection' | 'payment' | 'rate';
  uuid: string;
  server_version: number;
  client_version: number;
  server_data: any;
  client_data: any;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
