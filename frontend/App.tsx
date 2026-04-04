/**
 * Main Application Component
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/presentation/contexts/AuthContext';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import SyncService from './src/application/services/SyncService';
import PrintService from './src/application/services/PrintService';
import LocalStorageService from './src/infrastructure/storage/LocalStorageService';
import Logger from './src/core/utils/Logger';

export default function App() {
  useEffect(() => {
    // Initialize offline storage and sync services
    const initializeServices = async () => {
      try {
        await LocalStorageService.initialize();
        await SyncService.initialize();
        await PrintService.getInstance().initialize();
        Logger.info('Services initialized successfully', undefined, 'App');
      } catch (error) {
        Logger.error('Failed to initialize services', error, 'App');
      }
    };

    initializeServices();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
