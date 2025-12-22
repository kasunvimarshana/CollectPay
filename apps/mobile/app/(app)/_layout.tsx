import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/state/authStore';
import { initDb } from '@/services/db';
import { startAppLifecycleSync } from '@/services/appLifecycle';

export default function AppLayout() {
  const isAuthenticated = useAuthStore(s => !!s.token);

  useEffect(() => {
    const boot = async () => {
      await initDb();
      if (!isAuthenticated) {
        router.replace('/(auth)/sign-in');
        return;
      }
      startAppLifecycleSync();
    };
    boot();
  }, [isAuthenticated]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="users/index" options={{ title: 'Users' }} />
      <Stack.Screen name="users/[id]" options={{ title: 'User' }} />
      <Stack.Screen name="users/new" options={{ title: 'New User' }} />
      <Stack.Screen name="debug" options={{ title: 'Debug' }} />
    </Stack>
  );
}
