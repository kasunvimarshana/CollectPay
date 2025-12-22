import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useSyncStore } from "@/store";

/**
 * Network Status Hook
 * Monitors network connectivity and triggers sync when connection is restored
 */
export function useNetworkStatus() {
  const { sync } = useSyncStore();

  useEffect(() => {
    // Listen to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log("Network status changed:", state.isConnected);

      // Trigger sync when connection is restored
      if (state.isConnected) {
        sync();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [sync]);
}
