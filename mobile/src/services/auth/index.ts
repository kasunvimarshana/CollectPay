import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "../api";
import { User } from "../../domain/entities";

const TOKEN_KEY = "auth_token";
const USER_KEY = "current_user";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthStateListener = (state: AuthState) => void;

class AuthService {
  private listeners: AuthStateListener[] = [];
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  };

  async initialize(): Promise<void> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userJson = await AsyncStorage.getItem(USER_KEY);

      if (token && userJson) {
        this.state = {
          user: JSON.parse(userJson),
          isAuthenticated: true,
          isLoading: false,
        };
      } else {
        this.state = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
        };
      }

      this.notifyListeners();
    } catch (error) {
      console.error("Auth initialization error:", error);
      this.state = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
      this.notifyListeners();
    }
  }

  subscribe(listener: AuthStateListener): () => void {
    this.listeners.push(listener);
    // Immediately notify with current state
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState(): AuthState {
    return { ...this.state };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiService.login(email, password);

      if (response.success && response.data) {
        this.state = {
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        };
        this.notifyListeners();
        return { success: true };
      }

      return {
        success: false,
        error: response.message || "Login failed",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.logout();
    } finally {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);

      this.state = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
      this.notifyListeners();
    }
  }

  async refreshUser(): Promise<void> {
    try {
      const response = await apiService.refreshProfile();
      if (response.success && response.data) {
        this.state = {
          ...this.state,
          user: response.data,
        };
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  }

  hasPermission(permission: string): boolean {
    const user = this.state.user;
    if (!user) return false;

    // Admin has all permissions
    if (user.role === "admin") return true;

    // Check role-based permissions
    const rolePermissions: Record<string, string[]> = {
      manager: [
        "suppliers.read",
        "suppliers.create",
        "suppliers.update",
        "products.read",
        "products.create",
        "products.update",
        "rates.read",
        "rates.create",
        "rates.update",
        "collections.read",
        "collections.create",
        "collections.update",
        "payments.read",
        "payments.create",
        "payments.approve",
        "reports.read",
      ],
      collector: [
        "suppliers.read",
        "products.read",
        "rates.read",
        "collections.read",
        "collections.create",
        "payments.read",
      ],
    };

    const permissions = rolePermissions[user.role] || [];
    return permissions.includes(permission);
  }

  canAccessResource(
    resource: { ownerId?: string; collectorId?: string; region?: string },
    action: "read" | "write" | "delete"
  ): boolean {
    const user = this.state.user;
    if (!user) return false;

    // Admin can access everything
    if (user.role === "admin") return true;

    // Manager can access resources in their region
    if (user.role === "manager") {
      const userRegion = user.metadata?.region as string | undefined;
      if (userRegion && resource.region && userRegion !== resource.region) {
        return false;
      }
      return true;
    }

    // Collector can only access own resources
    if (user.role === "collector") {
      if (resource.collectorId && resource.collectorId !== user.id) {
        return action === "read";
      }
      if (resource.ownerId && resource.ownerId !== user.id) {
        return action === "read";
      }
      return true;
    }

    return false;
  }
}

export const authService = new AuthService();
