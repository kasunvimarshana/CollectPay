/**
 * Permission and RBAC/ABAC Utility Functions
 */

import { User } from '../../domain/entities/User';

// Permission constants based on backend RBAC system
// Using dot notation to match backend format
export const PERMISSIONS = {
  // User permissions
  VIEW_USERS: 'users.view',
  CREATE_USERS: 'users.create',
  UPDATE_USERS: 'users.edit',
  DELETE_USERS: 'users.delete',
  
  // Supplier permissions
  VIEW_SUPPLIERS: 'suppliers.view',
  CREATE_SUPPLIERS: 'suppliers.create',
  UPDATE_SUPPLIERS: 'suppliers.edit',
  DELETE_SUPPLIERS: 'suppliers.delete',
  
  // Product permissions
  VIEW_PRODUCTS: 'products.view',
  CREATE_PRODUCTS: 'products.create',
  UPDATE_PRODUCTS: 'products.edit',
  DELETE_PRODUCTS: 'products.delete',
  
  // Collection permissions
  VIEW_COLLECTIONS: 'collections.view',
  CREATE_COLLECTIONS: 'collections.create',
  UPDATE_COLLECTIONS: 'collections.edit',
  DELETE_COLLECTIONS: 'collections.delete',
  
  // Payment permissions
  VIEW_PAYMENTS: 'payments.view',
  CREATE_PAYMENTS: 'payments.create',
  UPDATE_PAYMENTS: 'payments.edit',
  DELETE_PAYMENTS: 'payments.delete',
  
  // Rate permissions
  VIEW_RATES: 'rates.view',
  CREATE_RATES: 'rates.create',
  UPDATE_RATES: 'rates.edit',
  DELETE_RATES: 'rates.delete',
  
  // Role permissions
  VIEW_ROLES: 'roles.view',
  CREATE_ROLES: 'roles.create',
  UPDATE_ROLES: 'roles.edit',
  DELETE_ROLES: 'roles.delete',
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
 * Uses dot notation to match backend format: resource.action
 */
export const canCreate = (user: User | null, resource: string): boolean => {
  return hasPermission(user, `${resource}.create`);
};

export const canView = (user: User | null, resource: string): boolean => {
  return hasPermission(user, `${resource}.view`);
};

export const canUpdate = (user: User | null, resource: string): boolean => {
  return hasPermission(user, `${resource}.edit`);
};

export const canDelete = (user: User | null, resource: string): boolean => {
  return hasPermission(user, `${resource}.delete`);
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
