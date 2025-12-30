import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthProvider } from './src/presentation/contexts/AuthContext';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import { getLocalDatabase } from './src/data/datasources/LocalDatabase';

/**
 * LedgerFlow Platform - Main Application Component
 * 
 * Clean Architecture: Presentation Layer
 * This is the entry point for the React Native application
 */

// Default API base URL - can be configured via environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const db = getLocalDatabase();
      await db.init();
      setIsDbReady(true);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Still mark as ready to prevent blocking the app
      setIsDbReady(true);
    }
  };

  if (!isDbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <AuthProvider apiBaseUrl={API_BASE_URL}>
      <StatusBar style="auto" />
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
