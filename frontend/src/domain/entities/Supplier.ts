/**
 * Supplier Entity
 * 
 * Represents a supplier from whom collections are made.
 */
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
