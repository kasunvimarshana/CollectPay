/**
 * AuthService Unit Tests
 */

import AuthService, { LoginCredentials, RegisterData, AuthResponse } from '../AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../../../core/constants/api';
import { User } from '../../../domain/entities/User';

// Mock dependencies
jest.mock('../../../infrastructure/api/apiClient');
jest.mock('@react-native-async-storage/async-storage');

describe('AuthService', () => {
  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    permissions: ['view_suppliers', 'create_suppliers'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    token: 'mock-jwt-token',
    token_type: 'Bearer',
    expires_in: 3600,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAuthResponse,
      });

      const result = await AuthService.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.LOGIN, credentials);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, mockAuthResponse.token);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        USER_STORAGE_KEY,
        JSON.stringify(mockUser)
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error when login fails', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Invalid credentials',
      });

      await expect(AuthService.login(credentials)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error when API call fails', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(AuthService.login(credentials)).rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerData: RegisterData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAuthResponse,
      });

      const result = await AuthService.register(registerData);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.REGISTER, registerData);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, mockAuthResponse.token);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        USER_STORAGE_KEY,
        JSON.stringify(mockUser)
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error when registration fails', async () => {
      const registerData: RegisterData = {
        name: 'New User',
        email: 'invalid-email',
        password: 'password123',
        password_confirmation: 'password123',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Invalid email format',
      });

      await expect(AuthService.register(registerData)).rejects.toThrow('Invalid email format');
    });
  });

  describe('logout', () => {
    it('should successfully logout and clear auth data', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        success: true,
      });

      await AuthService.logout();

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.LOGOUT, {});
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(USER_STORAGE_KEY);
    });

    it('should clear auth data even when API call fails', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await AuthService.logout();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(USER_STORAGE_KEY);
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch and return current user', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const result = await AuthService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ME);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        USER_STORAGE_KEY,
        JSON.stringify(mockUser)
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when API call fails', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await AuthService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return null when response is unsuccessful', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        success: false,
      });

      const result = await AuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('mock-token');

      const result = await AuthService.isAuthenticated();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
      expect(result).toBe(true);
    });

    it('should return false when token does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await AuthService.isAuthenticated();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
      expect(result).toBe(false);
    });
  });

  describe('getStoredUser', () => {
    it('should return stored user when available', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));

      const result = await AuthService.getStoredUser();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(USER_STORAGE_KEY);
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user is stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await AuthService.getStoredUser();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(USER_STORAGE_KEY);
      expect(result).toBeNull();
    });

    it('should return null when JSON parsing fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-json');

      const result = await AuthService.getStoredUser();

      expect(result).toBeNull();
    });
  });
});
