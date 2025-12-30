/**
 * Role Entity
 * Represents a user role with associated permissions
 */

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
  users_count?: number; // Optional: count of users with this role
}

export interface RoleFormData {
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
}
