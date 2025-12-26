import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { useAutoSync } from './src/hooks/useAutoSync';

function AppContent() {
  // Enable auto-sync when network is restored
  const handleSyncComplete = useCallback((successful: number, failed: number, conflicts: number) => {
    if (conflicts > 0) {
      Alert.alert(
        'Sync Conflicts',
        `${conflicts} ${conflicts === 1 ? 'operation' : 'operations'} had conflicts with server data. Server data has been preserved.`,
        [{ text: 'OK' }]
      );
    } else if (failed > 0) {
      Alert.alert(
        'Sync Issues',
        `${successful} ${successful === 1 ? 'operation' : 'operations'} synced successfully, but ${failed} ${failed === 1 ? 'operation' : 'operations'} failed. They will be retried later.`,
        [{ text: 'OK' }]
      );
    } else if (successful > 0) {
      // Silent success, only show conflicts and failures
      console.log(`Auto-sync completed: ${successful} ${successful === 1 ? 'operation' : 'operations'} synced successfully`);
    }
  }, []);

  useAutoSync(handleSyncComplete);

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
