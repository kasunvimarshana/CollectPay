/**
 * User Entity
 */

import { Role } from './Role';

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  is_active: boolean;
  role?: Role;
  created_at: string;
  updated_at: string;
}
