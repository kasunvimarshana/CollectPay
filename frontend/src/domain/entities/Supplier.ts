/**
 * Supplier Entity
 */

export interface Supplier {
  id: number;
  name: string;
  code: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  region?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierBalance {
  supplier: Supplier;
  total_collected: number;
  total_paid: number;
  balance: number;
  period: {
    start_date?: string;
    end_date?: string;
  };
}
