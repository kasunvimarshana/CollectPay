/**
 * User Entity
 * 
 * Domain layer entity representing a user in the system.
 * Follows Clean Architecture principles with immutable data.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'manager' | 'collector' | 'viewer';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'collector' | 'viewer';
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: 'admin' | 'manager' | 'collector' | 'viewer';
  isActive?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  user: User;
}
