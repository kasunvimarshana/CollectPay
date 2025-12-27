import { SupplierEntity } from '../entities/SupplierEntity';

/**
 * Supplier Repository Interface
 * 
 * Defines the contract for supplier data access.
 * Part of the domain layer - implementation is in infrastructure layer.
 */
export interface ISupplierRepository {
  /**
   * Get all suppliers with optional filters
   */
  getAll(params?: {
    search?: string;
    is_active?: boolean;
    per_page?: number;
    page?: number;
    include_balance?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<{
    data: SupplierEntity[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  }>;

  /**
   * Get supplier by ID
   */
  getById(id: number): Promise<SupplierEntity>;

  /**
   * Find supplier by code
   */
  findByCode(code: string): Promise<SupplierEntity | null>;

  /**
   * Create new supplier
   */
  create(supplier: Omit<SupplierEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplierEntity>;

  /**
   * Update existing supplier
   */
  update(id: number, supplier: Partial<SupplierEntity> & { version: number }): Promise<SupplierEntity>;

  /**
   * Delete supplier
   */
  delete(id: number): Promise<void>;

  /**
   * Get supplier balance
   */
  getBalance(id: number): Promise<{
    total_collections: number;
    total_payments: number;
    balance: number;
  }>;
}
