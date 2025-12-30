/**
 * User Entity
 */

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

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}
