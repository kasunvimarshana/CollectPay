/**
 * AuthService Token Lifecycle Tests
 * Tests for token refresh, expiry, and validation
 */

import AuthService from '../AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../../infrastructure/api/apiClient';
import { TOKEN_STORAGE_KEY, TOKEN_EXPIRY_STORAGE_KEY, USER_STORAGE_KEY } from '../../../core/constants/api';
import { User } from '../../../domain/entities/User';

// Mock dependencies
jest.mock('../../../infrastructure/api/apiClient');
jest.mock('@react-native-async-storage/async-storage');

describe('AuthService - Token Lifecycle', () => {
  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role_id: 1,
    is_active: true,
    role: {
      id: 1,
      name: 'Admin',
      display_name: 'Administrator',
      description: 'System administrator with full access',
      permissions: ['view_suppliers', 'create_suppliers'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Token Expiry Tracking', () => {
    it('should store token expiry time on login', async () => {
      const expiresIn = 3600; // 1 hour
      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'test-token',
          token_type: 'Bearer',
          expires_in: expiresIn,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const now = Date.now();
      jest.setSystemTime(now);

      await AuthService.login({ email: 'test@example.com', password: 'password' });

      // Verify token expiry was stored
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        TOKEN_EXPIRY_STORAGE_KEY,
        (now + expiresIn * 1000).toString()
      );
    });

    it('should detect expired token', async () => {
      const pastTime = Date.now() - 1000; // 1 second ago
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === TOKEN_EXPIRY_STORAGE_KEY) {
          return Promise.resolve(pastTime.toString());
        }
        return Promise.resolve(null);
      });

      const isExpired = await AuthService.isTokenExpired();
      expect(isExpired).toBe(true);
    });

    it('should detect token about to expire (within buffer)', async () => {
      // Token expires in 4 minutes (less than 5 minute buffer)
      const nearFutureTime = Date.now() + (4 * 60 * 1000);
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === TOKEN_EXPIRY_STORAGE_KEY) {
          return Promise.resolve(nearFutureTime.toString());
        }
        return Promise.resolve(null);
      });

      const isExpired = await AuthService.isTokenExpired();
      expect(isExpired).toBe(true);
    });

    it('should detect valid token (not expired)', async () => {
      // Token expires in 10 minutes (more than 5 minute buffer)
      const futureTime = Date.now() + (10 * 60 * 1000);
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === TOKEN_EXPIRY_STORAGE_KEY) {
          return Promise.resolve(futureTime.toString());
        }
        return Promise.resolve(null);
      });

      const isExpired = await AuthService.isTokenExpired();
      expect(isExpired).toBe(false);
    });

    it('should assume expired if no expiry stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const isExpired = await AuthService.isTokenExpired();
      expect(isExpired).toBe(true);
    });
  });

  describe('Token Refresh', () => {
    it('should successfully refresh token', async () => {
      const mockRefreshResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'new-test-token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockRefreshResponse);

      const result = await AuthService.refreshToken();

      expect(apiClient.post).toHaveBeenCalledWith('/refresh', {});
      expect(result).toEqual(mockRefreshResponse.data);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, 'new-test-token');
    });

    it('should handle refresh failure', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Token expired',
      });

      await expect(AuthService.refreshToken()).rejects.toThrow('Token expired');
    });

    it('should handle network error during refresh', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(AuthService.refreshToken()).rejects.toThrow('Network error');
    });

    it('should prevent multiple simultaneous refresh calls', async () => {
      const mockRefreshResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'new-test-token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      };

      // Simulate slow refresh
      let resolveRefresh: any;
      const refreshPromise = new Promise((resolve) => {
        resolveRefresh = resolve;
      });

      (apiClient.post as jest.Mock).mockReturnValue(refreshPromise);

      // Start multiple refresh calls
      const refresh1 = AuthService.refreshToken();
      const refresh2 = AuthService.refreshToken();
      const refresh3 = AuthService.refreshToken();

      // Resolve the refresh
      resolveRefresh(mockRefreshResponse);

      const [result1, result2, result3] = await Promise.all([refresh1, refresh2, refresh3]);

      // All should get same result
      expect(result1).toEqual(mockRefreshResponse.data);
      expect(result2).toEqual(mockRefreshResponse.data);
      expect(result3).toEqual(mockRefreshResponse.data);

      // API should only be called once
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('Token Validation and Refresh', () => {
    it('should validate token without refresh if not expired', async () => {
      const futureTime = Date.now() + (10 * 60 * 1000);
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === TOKEN_STORAGE_KEY) return Promise.resolve('valid-token');
        if (key === TOKEN_EXPIRY_STORAGE_KEY) return Promise.resolve(futureTime.toString());
        return Promise.resolve(null);
      });

      const isValid = await AuthService.validateAndRefreshToken();

      expect(isValid).toBe(true);
      expect(apiClient.post).not.toHaveBeenCalled(); // No refresh needed
    });

    it('should refresh token if expired', async () => {
      const pastTime = Date.now() - 1000;
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === TOKEN_STORAGE_KEY) return Promise.resolve('expired-token');
        if (key === TOKEN_EXPIRY_STORAGE_KEY) return Promise.resolve(pastTime.toString());
        return Promise.resolve(null);
      });

      const mockRefreshResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'new-token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockRefreshResponse);

      const isValid = await AuthService.validateAndRefreshToken();

      expect(isValid).toBe(true);
      expect(apiClient.post).toHaveBeenCalledWith('/refresh', {});
    });

    it('should return false if no token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const isValid = await AuthService.validateAndRefreshToken();

      expect(isValid).toBe(false);
    });

    it('should clear auth data if refresh fails', async () => {
      const pastTime = Date.now() - 1000;
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === TOKEN_STORAGE_KEY) return Promise.resolve('expired-token');
        if (key === TOKEN_EXPIRY_STORAGE_KEY) return Promise.resolve(pastTime.toString());
        return Promise.resolve(null);
      });

      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Refresh failed'));

      const isValid = await AuthService.validateAndRefreshToken();

      expect(isValid).toBe(false);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(TOKEN_EXPIRY_STORAGE_KEY);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(USER_STORAGE_KEY);
    });
  });

  describe('Auto-login with Token Validation', () => {
    it('should successfully auto-login with valid token', async () => {
      const futureTime = Date.now() + (10 * 60 * 1000);
      
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === TOKEN_STORAGE_KEY) return Promise.resolve('valid-token');
        if (key === TOKEN_EXPIRY_STORAGE_KEY) return Promise.resolve(futureTime.toString());
        if (key === USER_STORAGE_KEY) return Promise.resolve(JSON.stringify(mockUser));
        return Promise.resolve(null);
      });

      // Simulate auto-login flow
      const isAuth = await AuthService.isAuthenticated();
      expect(isAuth).toBe(true);

      const isValid = await AuthService.validateAndRefreshToken();
      expect(isValid).toBe(true);

      const storedUser = await AuthService.getStoredUser();
      expect(storedUser).toEqual(mockUser);
    });

    it('should fail auto-login with expired token and failed refresh', async () => {
      const pastTime = Date.now() - 1000;
      
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === TOKEN_STORAGE_KEY) return Promise.resolve('expired-token');
        if (key === TOKEN_EXPIRY_STORAGE_KEY) return Promise.resolve(pastTime.toString());
        return Promise.resolve(null);
      });

      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Token expired'));

      const isValid = await AuthService.validateAndRefreshToken();
      expect(isValid).toBe(false);
    });

    it('should auto-refresh expired token on auto-login', async () => {
      const pastTime = Date.now() - 1000;
      
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === TOKEN_STORAGE_KEY) return Promise.resolve('expired-token');
        if (key === TOKEN_EXPIRY_STORAGE_KEY) return Promise.resolve(pastTime.toString());
        if (key === USER_STORAGE_KEY) return Promise.resolve(JSON.stringify(mockUser));
        return Promise.resolve(null);
      });

      const mockRefreshResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'refreshed-token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockRefreshResponse);

      const isValid = await AuthService.validateAndRefreshToken();
      expect(isValid).toBe(true);
      expect(apiClient.post).toHaveBeenCalledWith('/refresh', {});
    });
  });

  describe('Logout with Token Cleanup', () => {
    it('should clear token expiry on logout', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ success: true });

      await AuthService.logout();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(TOKEN_EXPIRY_STORAGE_KEY);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(USER_STORAGE_KEY);
    });
  });
});
