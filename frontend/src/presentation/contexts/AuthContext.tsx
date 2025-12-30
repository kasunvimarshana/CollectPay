/**
 * Authentication Context
 * Manages user authentication state and operations
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../domain/entities/User';
import { getHttpClient } from '../../data/datasources/HttpClient';
import { RemoteUserDataSource } from '../../data/datasources/RemoteUserDataSource';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  apiBaseUrl: string;
}

export function AuthProvider({ children, apiBaseUrl }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const httpClient = getHttpClient(apiBaseUrl);
  const userDataSource = new RemoteUserDataSource(httpClient);

  // Load saved auth token on mount
  useEffect(() => {
    loadSavedAuth();
  }, []);

  const loadSavedAuth = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('auth_token');
      const savedUser = await SecureStore.getItemAsync('auth_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        httpClient.setAuthToken(savedToken);
      }
    } catch (error) {
      console.error('Failed to load saved auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await userDataSource.login(email, password);
      
      setUser(response.user);
      setToken(response.token);
      httpClient.setAuthToken(response.token);

      // Save to secure storage
      await SecureStore.setItemAsync('auth_token', response.token);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      if (token) {
        await userDataSource.logout();
      }

      // Clear state
      setUser(null);
      setToken(null);
      httpClient.setAuthToken(null);

      // Clear secure storage
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const updatedUser = await userDataSource.getById(user.id);
      setUser(updatedUser);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
