/**
 * Repository Interface for Suppliers
 * Follows Dependency Inversion Principle
 */

import { Supplier } from '../entities/Supplier';

export interface SupplierRepository {
  findAll(): Promise<Supplier[]>;
  findById(id: string): Promise<Supplier | null>;
  create(supplier: Supplier): Promise<Supplier>;
  update(supplier: Supplier): Promise<Supplier>;
  delete(id: string): Promise<void>;
  getBalance(id: string): Promise<{ balance: number; currency: string }>;
}
