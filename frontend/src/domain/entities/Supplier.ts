/**
 * Supplier Entity
 * 
 * Domain model for Supplier
 */
export interface Supplier {
  id: number;
  name: string;
  contact: string;
  address: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierDTO {
  name: string;
  contact: string;
  address: string;
  metadata?: Record<string, any>;
}

export interface UpdateSupplierDTO {
  name?: string;
  contact?: string;
  address?: string;
  metadata?: Record<string, any>;
}
