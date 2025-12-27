import { User, Supplier, Product, Collection, Payment } from '../entities';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findAll(page?: number, perPage?: number): Promise<User[]>;
  save(user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface SupplierRepository {
  findById(id: string): Promise<Supplier | null>;
  findAll(page?: number, perPage?: number): Promise<Supplier[]>;
  search(query: string): Promise<Supplier[]>;
  save(supplier: Partial<Supplier>): Promise<Supplier>;
  delete(id: string): Promise<void>;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(page?: number, perPage?: number): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
  save(product: Partial<Product>): Promise<Product>;
  addRate(productId: string, rate: { amount: number; currency: string; effectiveFrom: string }): Promise<Product>;
  delete(id: string): Promise<void>;
}

export interface CollectionRepository {
  findById(id: string): Promise<Collection | null>;
  findAll(page?: number, perPage?: number): Promise<Collection[]>;
  findBySupplier(supplierId: string): Promise<Collection[]>;
  findByProduct(productId: string): Promise<Collection[]>;
  findByDateRange(startDate: string, endDate: string): Promise<Collection[]>;
  save(collection: Partial<Collection>): Promise<Collection>;
  delete(id: string): Promise<void>;
}

export interface PaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findAll(page?: number, perPage?: number): Promise<Payment[]>;
  findBySupplier(supplierId: string): Promise<Payment[]>;
  findByDateRange(startDate: string, endDate: string): Promise<Payment[]>;
  save(payment: Partial<Payment>): Promise<Payment>;
  delete(id: string): Promise<void>;
  calculateBalance(supplierId: string): Promise<{ totalOwed: number; totalPaid: number; balance: number }>;
}
