import { BaseEntity } from "../entities";

// Repository interface definitions
export interface IRepository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findAll(options?: QueryOptions): Promise<T[]>;
  save(entity: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  count(filter?: Record<string, unknown>): Promise<number>;
}

export interface QueryOptions {
  where?: Record<string, unknown>;
  orderBy?: { field: string; direction: "asc" | "desc" }[];
  limit?: number;
  offset?: number;
  include?: string[];
}

export interface ISyncableRepository<T extends BaseEntity>
  extends IRepository<T> {
  findPendingSync(): Promise<T[]>;
  findByClientId(clientId: string): Promise<T | null>;
  markAsSynced(id: string, version: number): Promise<void>;
  markAsDirty(id: string): Promise<void>;
  applyServerChanges(changes: T[]): Promise<void>;
  getLastSyncTimestamp(): Promise<Date | null>;
}

// Auth repository
export interface IAuthRepository {
  login(email: string, password: string): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<import("../entities").User | null>;
  getToken(): Promise<string | null>;
  refreshToken(): Promise<string | null>;
  isAuthenticated(): Promise<boolean>;
}

export interface AuthResult {
  user: import("../entities").User;
  token: string;
  expiresAt: Date;
}

// Specific repositories
export interface ISupplierRepository
  extends ISyncableRepository<import("../entities").Supplier> {
  findByRegion(region: string): Promise<import("../entities").Supplier[]>;
  findByCollector(
    collectorId: string
  ): Promise<import("../entities").Supplier[]>;
  calculateBalance(supplierId: string): Promise<number>;
}

export interface IProductRepository
  extends ISyncableRepository<import("../entities").Product> {
  findByCategory(category: string): Promise<import("../entities").Product[]>;
  getCurrentRate(
    productId: string
  ): Promise<import("../entities").ProductRate | null>;
  getRateAtDate(
    productId: string,
    date: Date
  ): Promise<import("../entities").ProductRate | null>;
}

export interface ICollectionRepository
  extends ISyncableRepository<import("../entities").Collection> {
  findBySupplier(
    supplierId: string,
    options?: QueryOptions
  ): Promise<import("../entities").Collection[]>;
  findByCollector(
    collectorId: string,
    options?: QueryOptions
  ): Promise<import("../entities").Collection[]>;
  findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<import("../entities").Collection[]>;
  getSummary(filter: CollectionSummaryFilter): Promise<CollectionSummary>;
}

export interface CollectionSummaryFilter {
  supplierId?: string;
  collectorId?: string;
  productId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CollectionSummary {
  totalQuantity: number;
  totalAmount: number;
  count: number;
  byProduct: { productId: string; quantity: number; amount: number }[];
}

export interface IPaymentRepository
  extends ISyncableRepository<import("../entities").Payment> {
  findBySupplier(
    supplierId: string,
    options?: QueryOptions
  ): Promise<import("../entities").Payment[]>;
  calculateSettlement(
    supplierId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SettlementCalculation>;
}

export interface SettlementCalculation {
  totalCollections: number;
  totalDeductions: number;
  previousBalance: number;
  advancesPaid: number;
  netPayable: number;
  collections: import("../entities").Collection[];
  advances: import("../entities").Payment[];
}
