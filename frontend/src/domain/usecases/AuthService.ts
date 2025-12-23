import { SecureStorageService } from '../data/local/SecureStorageService';
import { ApiService } from '../data/remote/ApiService';
import { User } from '../domain/entities';

export class AuthService {
  private static instance: AuthService;
  private secureStorage: SecureStorageService;
  private api: ApiService;
  private currentUser: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  private constructor() {
    this.secureStorage = SecureStorageService.getInstance();
    this.api = ApiService.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async init(): Promise<void> {
    // Try to load user from storage
    const user = await this.secureStorage.getUser();
    if (user) {
      this.currentUser = user;
      this.notifyListeners(user);
    }
  }

  public async login(email: string, password: string): Promise<User> {
    try {
      const response = await this.api.login(email, password);
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      // Store token and user data
      await this.secureStorage.setToken(response.token);
      await this.secureStorage.setUser(response.user);

      this.currentUser = response.user;
      this.notifyListeners(response.user);

      return response.user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  public async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: string;
  }): Promise<User> {
    try {
      const response = await this.api.register(data);
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }

      // Store token and user data
      await this.secureStorage.setToken(response.token);
      await this.secureStorage.setUser(response.user);

      this.currentUser = response.user;
      this.notifyListeners(response.user);

      return response.user;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.api.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local data regardless of API call result
      await this.secureStorage.clear();
      this.currentUser = null;
      this.notifyListeners(null);
    }
  }

  public async refreshUser(): Promise<User | null> {
    try {
      const response = await this.api.getMe();
      
      if (response.success && response.user) {
        await this.secureStorage.setUser(response.user);
        this.currentUser = response.user;
        this.notifyListeners(response.user);
        return response.user;
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, user might be logged out
      await this.logout();
    }
    
    return null;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  public hasPermission(permission: string): boolean {
    if (!this.currentUser) {
      return false;
    }

    // Admin has all permissions
    if (this.currentUser.role === 'admin') {
      return true;
    }

    return this.currentUser.permissions?.includes(permission) || false;
  }

  public addListener(callback: (user: User | null) => void): void {
    this.listeners.add(callback);
  }

  public removeListener(callback: (user: User | null) => void): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(user: User | null): void {
    this.listeners.forEach((callback) => {
      try {
        callback(user);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }
}
