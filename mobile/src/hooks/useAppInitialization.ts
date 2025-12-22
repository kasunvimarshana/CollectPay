import { useEffect } from "react";
import { database } from "@/services/database";
import { syncService } from "@/services/sync";
import { useAuthStore } from "@/store";

/**
 * App Initializer
 * Handles app startup tasks: database initialization, auth restoration, sync setup
 */
export function useAppInitialization() {
  const { loadStoredAuth, isLoading } = useAuthStore();

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      // Step 1: Initialize SQLite database
      await database.initialize();
      console.log("Database initialized");

      // Step 2: Restore authentication state
      await loadStoredAuth();
      console.log("Auth state restored");

      // Step 3: Initialize sync service
      await syncService.initialize();
      console.log("Sync service initialized");
    } catch (error) {
      console.error("App initialization failed:", error);
    }
  }

  return { isInitializing: isLoading };
}
