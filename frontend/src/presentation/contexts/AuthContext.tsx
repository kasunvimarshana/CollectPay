/**
 * Authentication Context
 * Manages authentication state across the application
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AuthService from '../../application/services/AuthService';
import { User } from '../../domain/entities/User';
import { LoginCredentials, RegisterData } from '../../application/services/AuthService';
import Logger from '../../core/utils/Logger';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load stored user on mount
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      setIsLoading(true);
      const isAuth = await AuthService.isAuthenticated();
      
      if (isAuth) {
        const storedUser = await AuthService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
          // Optionally refresh user data from server
          refreshUser();
        }
      }
    } catch (error) {
      Logger.error('Load stored user error', error, 'AuthContext');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await AuthService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await AuthService.register(data);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call the logout service which handles both API and local cleanup
      await AuthService.logout();
    } catch (error: any) {
      // Log error but don't throw - logout should always succeed locally
      Logger.error('Logout error', error?.message || error, 'AuthContext');
    } finally {
      // Always clear the local state regardless of API success/failure
      // This ensures the user is logged out from the UI perspective
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      Logger.error('Refresh user error', error, 'AuthContext');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
