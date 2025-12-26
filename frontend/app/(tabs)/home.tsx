import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useNetworkStore } from '../../src/store/networkStore';
import { syncManager } from '../../src/services/syncManager';
import { localDb } from '../../src/database/localDb';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isConnected, connectionType } = useNetworkStore();
  const router = useRouter();
  const [syncStatus, setSyncStatus] = useState('Idle');
  const [stats, setStats] = useState({
    suppliers: 0,
    pendingTransactions: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const suppliers = await localDb.getSuppliers();
    const transactions = await localDb.getUnsyncedTransactions();
    const payments = await localDb.getUnsyncedPayments();

    setStats({
      suppliers: suppliers.length,
      pendingTransactions: transactions.length,
      pendingPayments: payments.length,
    });
  };

  const handleSync = async () => {
    setSyncStatus('Syncing...');
    const result = await syncManager.forceSyncNow();
    setSyncStatus(result.success ? 'Synced' : 'Failed');
    
    if (result.success) {
      Alert.alert('Success', result.message);
      await loadStats();
    } else {
      Alert.alert('Error', result.message);
    }

    setTimeout(() => setSyncStatus('Idle'), 3000);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FieldLedger</Text>
        <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Network:</Text>
          <Text style={[styles.statusValue, isConnected ? styles.online : styles.offline]}>
            {isConnected ? `Online (${connectionType})` : 'Offline'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Sync Status:</Text>
          <Text style={styles.statusValue}>{syncStatus}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.suppliers}</Text>
          <Text style={styles.statLabel}>Suppliers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pendingTransactions}</Text>
          <Text style={styles.statLabel}>Pending Transactions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pendingPayments}</Text>
          <Text style={styles.statLabel}>Pending Payments</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push('/(tabs)/suppliers')}
        >
          <Text style={styles.menuButtonText}>Manage Suppliers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => Alert.alert('Coming Soon', 'Transactions feature')}
        >
          <Text style={styles.menuButtonText}>Record Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => Alert.alert('Coming Soon', 'Payments feature')}
        >
          <Text style={styles.menuButtonText}>Record Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.syncButton]}
          onPress={handleSync}
          disabled={!isConnected || syncStatus === 'Syncing...'}
        >
          <Text style={styles.menuButtonText}>
            {syncStatus === 'Syncing...' ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.menuButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  online: {
    color: '#27ae60',
  },
  offline: {
    color: '#e74c3c',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: 'white',
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'center',
  },
  menuContainer: {
    padding: 15,
  },
  menuButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  syncButton: {
    backgroundColor: '#27ae60',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
  },
});
