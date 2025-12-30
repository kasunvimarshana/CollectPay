/**
 * Payment Entity
 */

import { Supplier } from './Supplier';
import { User } from './User';

export type PaymentType = 'advance' | 'partial' | 'full' | 'adjustment';

export interface Payment {
  id: number;
  supplier_id: number;
  user_id: number;
  payment_date: string;
  amount: number;
  type: PaymentType;
  reference_number?: string;
  payment_method?: string;
  notes?: string;
  version: number;
  supplier?: Supplier;
  user?: User;
  created_at: string;
  updated_at: string;
}
