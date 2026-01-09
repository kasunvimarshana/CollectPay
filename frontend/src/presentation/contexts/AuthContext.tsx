/**
 * Authentication Context
 * Manages authentication state across the application
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AuthService from '../../application/services/AuthService';
import apiClient from '../../infrastructure/api/apiClient';
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

  // Load stored user on mount and set up event listeners
  useEffect(() => {
    loadStoredUser();
    
    // Set up unauthorized callback for apiClient
    apiClient.setUnauthorizedCallback(handleUnauthorized);
    
    // Set up app state listener to validate token on foreground
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Handle unauthorized events from API client
   */
  const handleUnauthorized = () => {
    Logger.warn('Unauthorized event received, logging out user', undefined, 'AuthContext');
    // Clear local state
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Handle app state changes (foreground/background)
   */
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // When app comes to foreground, validate token
    if (nextAppState === 'active' && isAuthenticated) {
      Logger.info('App became active, validating token', undefined, 'AuthContext');
      try {
        const isValid = await AuthService.validateAndRefreshToken();
        if (!isValid) {
          Logger.warn('Token validation failed, logging out', undefined, 'AuthContext');
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Refresh user data
          await refreshUser();
        }
      } catch (error) {
        Logger.error('Token validation error on app foreground', error, 'AuthContext');
      }
    }
  };

  const loadStoredUser = async () => {
    try {
      setIsLoading(true);
      
      // Check if token exists
      const isAuth = await AuthService.isAuthenticated();
      
      if (isAuth) {
        // Validate token and refresh if needed
        const isValid = await AuthService.validateAndRefreshToken();
        
        if (isValid) {
          // Get stored user data
          const storedUser = await AuthService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
            
            // Try to refresh user data from server (non-blocking)
            refreshUser().catch(error => {
              // Log but don't fail - we have cached data
              Logger.warn('Failed to refresh user data from server', error, 'AuthContext');
            });
          } else {
            // Token is valid but no user data - try to fetch
            await refreshUser();
          }
        } else {
          // Token is invalid or refresh failed
          Logger.info('Token validation failed during auto-login', undefined, 'AuthContext');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // No token - not authenticated
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      Logger.error('Load stored user error', error, 'AuthContext');
      // On error, assume not authenticated
      setUser(null);
      setIsAuthenticated(false);
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
      Logger.error('Logout error', error, 'AuthContext');
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
        setIsAuthenticated(true);
      } else {
        // Failed to get user - might be 401 or network error
        // Don't clear auth state here as it might be temporary
        Logger.warn('Failed to fetch current user', undefined, 'AuthContext');
      }
    } catch (error) {
      Logger.error('Refresh user error', error, 'AuthContext');
      // Don't throw - let caller handle
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
