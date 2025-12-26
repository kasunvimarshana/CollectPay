import { useState, useEffect, useCallback } from "react";
import { authService, AuthState } from "../services/auth";

export function useAuth() {
  const [state, setState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setState);
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    return authService.login(email, password);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
  }, []);

  const hasPermission = useCallback((permission: string) => {
    return authService.hasPermission(permission);
  }, []);

  const canAccess = useCallback(
    (
      resource: { ownerId?: string; collectorId?: string; region?: string },
      action: "read" | "write" | "delete"
    ) => {
      return authService.canAccessResource(resource, action);
    },
    []
  );

  return {
    ...state,
    login,
    logout,
    hasPermission,
    canAccess,
  };
}
