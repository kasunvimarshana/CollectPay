import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { AppProvider, useApp } from './src/contexts/AppContext';

function AppContent() {
  const { isInitialized, user, networkStatus, syncStatus } = useApp();

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Initializing...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SyncCollect</Text>
      <Text style={styles.subtitle}>Data Collection & Payment Management</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Network: {networkStatus.isConnected ? '🟢 Online' : '🔴 Offline'}
        </Text>
        <Text style={styles.statusText}>
          Sync: {syncStatus === 'syncing' ? '🔄 Syncing...' : 
                 syncStatus === 'success' ? '✅ Synced' : 
                 syncStatus === 'error' ? '❌ Error' : '⏸️ Idle'}
        </Text>
        {user && (
          <Text style={styles.statusText}>
            User: {user.name} ({user.role})
          </Text>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Features Implemented:</Text>
        <Text style={styles.infoItem}>✅ Offline-first architecture</Text>
        <Text style={styles.infoItem}>✅ Local SQLite database</Text>
        <Text style={styles.infoItem}>✅ Automatic synchronization</Text>
        <Text style={styles.infoItem}>✅ Network status monitoring</Text>
        <Text style={styles.infoItem}>✅ Conflict detection</Text>
        <Text style={styles.infoItem}>✅ Transaction logging</Text>
        <Text style={styles.infoItem}>✅ RESTful API integration</Text>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 5,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
    paddingLeft: 10,
  },
});

