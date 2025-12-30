import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/application/store/AuthContext';
import { SyncProvider } from './src/application/store/SyncContext';
import AppNavigator from './src/presentation/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </SyncProvider>
    </AuthProvider>
  );
}

