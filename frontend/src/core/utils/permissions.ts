/**
 * Permission and RBAC/ABAC Utility Functions
 */

import { User } from '../../domain/entities/User';

// Permission constants based on backend RBAC system
export const PERMISSIONS = {
  // User permissions
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  UPDATE_USERS: 'update_users',
  DELETE_USERS: 'delete_users',
  
  // Supplier permissions
  VIEW_SUPPLIERS: 'view_suppliers',
  CREATE_SUPPLIERS: 'create_suppliers',
  UPDATE_SUPPLIERS: 'update_suppliers',
  DELETE_SUPPLIERS: 'delete_suppliers',
  
  // Product permissions
  VIEW_PRODUCTS: 'view_products',
  CREATE_PRODUCTS: 'create_products',
  UPDATE_PRODUCTS: 'update_products',
  DELETE_PRODUCTS: 'delete_products',
  
  // Collection permissions
  VIEW_COLLECTIONS: 'view_collections',
  CREATE_COLLECTIONS: 'create_collections',
  UPDATE_COLLECTIONS: 'update_collections',
  DELETE_COLLECTIONS: 'delete_collections',
  
  // Payment permissions
  VIEW_PAYMENTS: 'view_payments',
  CREATE_PAYMENTS: 'create_payments',
  UPDATE_PAYMENTS: 'update_payments',
  DELETE_PAYMENTS: 'delete_payments',
  
  // Rate permissions
  VIEW_RATES: 'view_rates',
  CREATE_RATES: 'create_rates',
  UPDATE_RATES: 'update_rates',
  DELETE_RATES: 'delete_rates',
  
  // Role permissions
  VIEW_ROLES: 'view_roles',
  CREATE_ROLES: 'create_roles',
  UPDATE_ROLES: 'update_roles',
  DELETE_ROLES: 'delete_roles',
};

// Role constants
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  COLLECTOR: 'collector',
  VIEWER: 'viewer',
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user || !user.role) {
    return false;
  }

  // Admin has all permissions
  if (user.role.name === ROLES.ADMIN) {
    return true;
  }

  // Check if the role has the specific permission
  return user.role.permissions?.includes(permission) || false;
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  if (!user || !user.role) {
    return false;
  }

  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
  if (!user || !user.role) {
    return false;
  }

  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Check if user has a specific role
 */
export const hasRole = (user: User | null, role: string): boolean => {
  if (!user || !user.role) {
    return false;
  }

  return user.role.name === role;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user: User | null, roles: string[]): boolean => {
  if (!user || !user.role) {
    return false;
  }

  return roles.includes(user.role.name);
};

/**
 * Check if user can perform CRUD operations on a resource
 */
export const canCreate = (user: User | null, resource: string): boolean => {
  return hasPermission(user, `create_${resource}`);
};

export const canView = (user: User | null, resource: string): boolean => {
  return hasPermission(user, `view_${resource}`);
};

export const canUpdate = (user: User | null, resource: string): boolean => {
  return hasPermission(user, `update_${resource}`);
};

export const canDelete = (user: User | null, resource: string): boolean => {
  return hasPermission(user, `delete_${resource}`);
};

/**
 * Get user's role display name
 */
export const getRoleDisplayName = (user: User | null): string => {
  if (!user || !user.role) {
    return 'Guest';
  }

  return user.role.display_name || user.role.name;
};

/**
 * Check if user is admin
 */
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, ROLES.ADMIN);
};

/**
 * Check if user is manager
 */
export const isManager = (user: User | null): boolean => {
  return hasRole(user, ROLES.MANAGER);
};

/**
 * Check if user is collector
 */
export const isCollector = (user: User | null): boolean => {
  return hasRole(user, ROLES.COLLECTOR);
};

/**
 * Check if user is viewer
 */
export const isViewer = (user: User | null): boolean => {
  return hasRole(user, ROLES.VIEWER);
};
