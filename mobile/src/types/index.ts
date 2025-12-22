// Core domain types matching backend entities

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserRole = "admin" | "manager" | "collector" | "viewer";

export interface Supplier {
  id: string;
  name: string;
  contactNumber: string;
  address?: string;
  location?: Location;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Collection {
  id: string;
  supplierId: string;
  collectedBy: string;
  productType: string;
  quantity: Quantity;
  ratePerUnit: Money;
  totalAmount: Money;
  notes?: string;
  status: CollectionStatus;
  collectionDate: string;
  createdAt: string;
  updatedAt: string;
  syncId?: string;

  // Populated fields
  supplier?: Supplier;
  collector?: User;
}

export interface Quantity {
  value: number;
  unit: QuantityUnit;
}

export type QuantityUnit = "g" | "kg" | "l" | "ml" | "unit";

export type CollectionStatus = "pending" | "approved" | "rejected";

export interface Money {
  amount: number; // in cents
  currency: string;
  formatted: string;
}

export interface Payment {
  id: string;
  supplierId: string;
  paidBy: string;
  amount: Money;
  type: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber?: string;
  notes?: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
  syncId?: string;

  // Populated fields
  supplier?: Supplier;
  payer?: User;
}

export type PaymentType = "advance" | "partial" | "full";

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "cheque"
  | "digital_wallet";

export type PaymentStatus = "pending" | "confirmed" | "cancelled";

// Sync related types
export interface SyncQueueItem {
  id: string;
  entityType: "collection" | "payment" | "supplier";
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: any;
  status: "pending" | "processing" | "synced" | "failed";
  retryCount: number;
  errorMessage?: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
  };
}

// Auth types
export interface AuthToken {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
