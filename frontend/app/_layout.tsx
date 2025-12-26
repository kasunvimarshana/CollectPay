import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { useNetworkStore } from '../src/store/networkStore';
import { localDb } from '../src/database/localDb';
import { syncManager } from '../src/services/syncManager';

const queryClient = new QueryClient();

export default function RootLayout() {
  const loadAuth = useAuthStore((state) => state.loadAuth);
  const initialize = useNetworkStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function initApp() {
      // Initialize database
      await localDb.init();
      
      // Load auth state
      await loadAuth();
      
      // Initialize network monitoring
      unsubscribe = initialize();
      
      // Initialize sync manager with event-driven triggers
      await syncManager.initialize();
      
      // Start auto-sync if authenticated
      if (isAuthenticated) {
        syncManager.startAutoSync(60000); // Sync every minute
      }
    }

    initApp();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      syncManager.cleanup();
    };
  }, [isAuthenticated, loadAuth, initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
