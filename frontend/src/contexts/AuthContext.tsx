import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService, User, LoginRequest, RegisterRequest } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        const userData = await authService.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      const response = await authService.login(data);
      await SecureStore.setItemAsync('authToken', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);
      await SecureStore.setItemAsync('authToken', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await SecureStore.deleteItemAsync('authToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
