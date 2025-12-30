/**
 * User Entity
 * 
 * Represents a system user with authentication and authorization capabilities.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication Response
 */
export interface AuthResponse {
  user: User;
  token: string;
  tokenType: string;
}
