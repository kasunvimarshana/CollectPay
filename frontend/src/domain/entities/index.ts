// Domain Entity Interfaces for TypeScript

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'collector' | 'viewer';
  permissions: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string;
  userId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  unit: string;
  description?: string;
  userId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface RateVersion {
  id: string;
  productId: string;
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  userId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Collection {
  id: string;
  supplierId: string;
  productId: string;
  quantity: number;
  rateVersionId: string;
  appliedRate: number;
  collectionDate: string;
  notes?: string;
  userId: string;
  idempotencyKey: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  // Sync related
  syncStatus?: 'pending' | 'synced' | 'conflict' | 'error';
  syncError?: string;
}

export interface Payment {
  id: string;
  supplierId: string;
  amount: number;
  type: 'advance' | 'partial' | 'final';
  paymentDate: string;
  notes?: string;
  referenceNumber?: string;
  userId: string;
  idempotencyKey: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  // Sync related
  syncStatus?: 'pending' | 'synced' | 'conflict' | 'error';
  syncError?: string;
}

export interface SyncPayload {
  entityType: 'supplier' | 'product' | 'collection' | 'payment' | 'rate_version';
  operation: 'create' | 'update' | 'delete';
  entityId: string;
  data: any;
  clientTimestamp: string;
  idempotencyKey?: string;
}

export interface SyncResponse {
  success: boolean;
  conflicts?: Array<{
    entityType: string;
    entityId: string;
    serverVersion: number;
    clientVersion: number;
    resolution: 'server_wins' | 'manual_required';
  }>;
  errors?: Array<{
    entityType: string;
    entityId: string;
    message: string;
  }>;
  syncedCount: number;
  timestamp: string;
}
