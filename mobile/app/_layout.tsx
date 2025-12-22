import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAppInitialization, useNetworkStatus } from '@/hooks';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const { isInitializing } = useAppInitialization();
  
  // Monitor network status for auto-sync
  useNetworkStatus();

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
