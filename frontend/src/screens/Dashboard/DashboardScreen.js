import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { isConnected, isSyncing, syncStatus, syncData } = useNetwork();

  useEffect(() => {
    // Load dashboard data
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
      </View>

      {/* Connection Status */}
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <Text style={styles.cardTitle}>Connection Status</Text>
          <View style={[styles.statusDot, isConnected ? styles.online : styles.offline]} />
        </View>
        <Text style={styles.statusText}>
          {isConnected ? 'Online' : 'Offline'}
        </Text>
        {isConnected && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={syncData}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <Text style={styles.syncButtonText}>Sync Now</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Sync Status */}
      {syncStatus && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sync Status</Text>
          <View style={styles.syncStats}>
            <View style={styles.syncStat}>
              <Text style={styles.syncStatValue}>{syncStatus.pending}</Text>
              <Text style={styles.syncStatLabel}>Pending</Text>
            </View>
            <View style={styles.syncStat}>
              <Text style={styles.syncStatValue}>{syncStatus.conflicts}</Text>
              <Text style={styles.syncStatLabel}>Conflicts</Text>
            </View>
            <View style={styles.syncStat}>
              <Text style={styles.syncStatValue}>{syncStatus.failed}</Text>
              <Text style={styles.syncStatLabel}>Failed</Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Collections')}
          >
            <Text style={styles.actionButtonText}>New Collection</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Suppliers')}
          >
            <Text style={styles.actionButtonText}>Suppliers</Text>
          </TouchableOpacity>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Payments')}
            >
              <Text style={styles.actionButtonText}>Payments</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  syncButton: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  syncStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  syncStat: {
    alignItems: 'center',
  },
  syncStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  syncStatLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  actions: {
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;
