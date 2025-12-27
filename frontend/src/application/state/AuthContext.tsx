import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../domain/entities';
import apiService from '../services/ApiService';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('auth_token');
      const storedUser = await SecureStore.getItemAsync('user_data');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        apiService.setToken(storedToken);
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        const { token: newToken, user: newUser } = response.data;
        
        await SecureStore.setItemAsync('auth_token', newToken);
        await SecureStore.setItemAsync('user_data', JSON.stringify(newUser));
        
        setToken(newToken);
        setUser(newUser);
        apiService.setToken(newToken);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await apiService.register(name, email, password);
      
      if (response.success && response.data) {
        // After registration, auto-login
        return await login(email, password);
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
      
      setToken(null);
      setUser(null);
      apiService.setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
