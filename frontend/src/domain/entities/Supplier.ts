/**
 * Supplier Domain Entity (TypeScript Interface)
 * 
 * Represents a supplier with detailed profile information.
 */

export interface Supplier {
  id: number;
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateSupplierInput {
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {
  id: number;
  version: number;
}

export interface SupplierFilters {
  isActive?: boolean;
  searchQuery?: string;
  page?: number;
  perPage?: number;
}
