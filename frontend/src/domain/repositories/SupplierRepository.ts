import { Supplier } from '../entities/Supplier';

/**
 * Supplier Repository Interface
 * 
 * Defines the contract for supplier data access
 * Following Repository Pattern and Dependency Inversion Principle
 */
export interface SupplierRepository {
  /**
   * Get all suppliers with optional filters
   */
  getAll(filters?: SupplierFilters, page?: number, perPage?: number): Promise<SupplierListResult>;

  /**
   * Get a single supplier by ID
   */
  getById(id: string): Promise<Supplier | null>;

  /**
   * Create a new supplier
   */
  create(data: CreateSupplierData): Promise<Supplier>;

  /**
   * Update an existing supplier
   */
  update(id: string, data: UpdateSupplierData): Promise<Supplier>;

  /**
   * Delete a supplier
   */
  delete(id: string): Promise<void>;
}

export interface SupplierFilters {
  active?: boolean;
  search?: string;
}

export interface SupplierListResult {
  data: Supplier[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export interface CreateSupplierData {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}
