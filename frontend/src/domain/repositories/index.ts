import { Supplier, Product, Collection, Payment, RateVersion } from '../entities';

export interface SupplierRepository {
  findById(id: string): Promise<Supplier | null>;
  findAll(): Promise<Supplier[]>;
  save(supplier: Supplier): Promise<void>;
  delete(id: string): Promise<void>;
  getUnsyncedChanges(): Promise<Supplier[]>;
  markAsSynced(id: string): Promise<void>;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  save(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
  getUnsyncedChanges(): Promise<Product[]>;
  markAsSynced(id: string): Promise<void>;
}

export interface CollectionRepository {
  findById(id: string): Promise<Collection | null>;
  findAll(): Promise<Collection[]>;
  findBySupplierId(supplierId: string): Promise<Collection[]>;
  save(collection: Collection): Promise<void>;
  saveBatch(collections: Collection[]): Promise<void>;
  delete(id: string): Promise<void>;
  getUnsyncedChanges(): Promise<Collection[]>;
  markAsSynced(id: string): Promise<void>;
}

export interface PaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findAll(): Promise<Payment[]>;
  findBySupplierId(supplierId: string): Promise<Payment[]>;
  save(payment: Payment): Promise<void>;
  saveBatch(payments: Payment[]): Promise<void>;
  delete(id: string): Promise<void>;
  getUnsyncedChanges(): Promise<Payment[]>;
  markAsSynced(id: string): Promise<void>;
}

export interface RateVersionRepository {
  findById(id: string): Promise<RateVersion | null>;
  findByProductId(productId: string): Promise<RateVersion[]>;
  findLatestForProduct(productId: string): Promise<RateVersion | null>;
  save(rateVersion: RateVersion): Promise<void>;
  delete(id: string): Promise<void>;
  getUnsyncedChanges(): Promise<RateVersion[]>;
  markAsSynced(id: string): Promise<void>;
}
