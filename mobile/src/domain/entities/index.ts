// Domain Entities - Core business objects
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  syncStatus: SyncStatus;
  version: number;
  lastSyncedAt?: Date;
  clientId?: string;
}

export type SyncStatus = "pending" | "synced" | "conflict" | "failed";

export type UserRole = "admin" | "manager" | "collector";

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: "active" | "inactive";
  metadata?: Record<string, unknown>;
}

export interface Supplier extends BaseEntity {
  name: string;
  code: string;
  phone?: string;
  address?: string;
  region?: string;
  bankName?: string;
  bankAccount?: string;
  bankBranch?: string;
  paymentMethod: "cash" | "bank_transfer" | "cheque";
  creditLimit: number;
  currentBalance: number;
  openingBalance: number;
  status: "active" | "inactive";
  collectorId?: string;
  ownerId?: string;
}

export interface Product extends BaseEntity {
  name: string;
  code: string;
  category?: string;
  description?: string;
  baseUnit: string;
  unitConversions: Record<string, number>;
  status: "active" | "inactive";
  currentRate?: ProductRate;
}

export interface ProductRate extends BaseEntity {
  productId: string;
  rate: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isCurrent: boolean;
  notes?: string;
}

export type CollectionStatus =
  | "pending"
  | "confirmed"
  | "disputed"
  | "cancelled";

export interface Collection extends BaseEntity {
  supplierId: string;
  productId: string;
  collectorId: string;
  collectedAt: Date;
  quantity: number;
  unit: string;
  quantityInBaseUnit: number;
  rateAtCollection: number;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: CollectionStatus;
  notes?: string;
  supplier?: Supplier;
  product?: Product;
}

export type PaymentType = "advance" | "settlement" | "partial" | "adjustment";
export type PaymentStatus = "pending" | "approved" | "completed" | "cancelled";
export type PaymentMethod = "cash" | "bank_transfer" | "cheque";

export interface Payment extends BaseEntity {
  supplierId: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  amount: number;
  settlementPeriodStart?: Date;
  settlementPeriodEnd?: Date;
  totalCollectionAmount?: number;
  totalDeductions?: number;
  previousBalance?: number;
  advances?: number;
  calculatedAmount?: number;
  referenceNumber?: string;
  paidAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  status: PaymentStatus;
  notes?: string;
  supplier?: Supplier;
}

// Sync-related types
export interface SyncChange<T = unknown> {
  id: string;
  entity: string;
  action: "create" | "update" | "delete";
  data: T;
  version: number;
  timestamp: Date;
  clientId: string;
}

export interface SyncConflict {
  entityType: string;
  entityId: string;
  localVersion: number;
  serverVersion: number;
  localData: unknown;
  serverData: unknown;
  resolution?: "local" | "server" | "merged";
}

export interface SyncState {
  lastSyncTimestamp?: Date;
  pendingChangesCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  conflicts: SyncConflict[];
}
