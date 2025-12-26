/**
 * User Entity
 * 
 * Represents a system user with authentication and authorization attributes.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresAt: string;
  user: User;
}

export type UserRole = 'admin' | 'manager' | 'collector';

export type UserPermission = 
  | 'manage_users'
  | 'manage_rates'
  | 'make_payments'
  | 'view_reports'
  | 'manage_suppliers'
  | 'manage_products';
