/**
 * User Entity
 * 
 * Domain model for User following Clean Architecture
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'collector';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: string;
  permissions?: string[];
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  permissions?: string[];
}
