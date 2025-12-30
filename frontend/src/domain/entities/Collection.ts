/**
 * Collection Entity
 */

import { Supplier } from './Supplier';
import { Product, Rate } from './Product';
import { User } from './User';

export interface Collection {
  id: number;
  supplier_id: number;
  product_id: number;
  user_id: number;
  rate_id: number;
  collection_date: string;
  quantity: number;
  unit: string;
  rate_applied: number;
  total_amount: number;
  notes?: string;
  version: number;
  supplier?: Supplier;
  product?: Product;
  user?: User;
  rate?: Rate;
  created_at: string;
  updated_at: string;
}
