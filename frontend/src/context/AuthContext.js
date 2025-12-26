// Authentication Context for managing user state
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import SecureStorage from "../infrastructure/storage/SecureStorage";
import ApiClient from "../infrastructure/network/ApiClient";
import SyncEngine from "../infrastructure/sync/SyncEngine";
import * as Crypto from "expo-crypto";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const storedToken = await SecureStorage.getAuthToken();
      const storedUser = await SecureStorage.getUserData();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to load auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDeviceId = async () => {
    let deviceId = await SecureStorage.getDeviceId();
    if (!deviceId) {
      deviceId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${Date.now()}-${Math.random()}`
      );
      await SecureStorage.setDeviceId(deviceId);
    }
    return deviceId;
  };

  const login = useCallback(async (email, password) => {
    try {
      const deviceId = await generateDeviceId();
      const response = await ApiClient.login(email, password, deviceId);

      const { token: authToken, user: userData, permissions } = response;

      await SecureStorage.setAuthToken(authToken);
      await SecureStorage.setUserData({ ...userData, permissions });

      setToken(authToken);
      setUser({ ...userData, permissions });
      setIsAuthenticated(true);

      // Trigger initial sync after login
      SyncEngine.triggerSync("login");

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await ApiClient.logout();
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn("Logout API call failed:", error);
    }

    await SecureStorage.clearAuth();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await ApiClient.refreshToken();
      const { token: newToken } = response;

      await SecureStorage.setAuthToken(newToken);
      setToken(newToken);

      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }, []);

  // RBAC check
  const hasRole = useCallback(
    (role) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      return user.role === role;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      return roles.includes(user.role);
    },
    [user]
  );

  // ABAC check
  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      return user.permissions?.includes(permission) ?? false;
    },
    [user]
  );

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    hasRole,
    hasAnyRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
