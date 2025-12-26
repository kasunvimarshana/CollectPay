// Home screen with dashboard
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import NetworkMonitor from '../../infrastructure/network/NetworkMonitor';
import SyncEngine from '../../infrastructure/sync/SyncEngine';
import SecureStorage from '../../infrastructure/storage/SecureStorage';

export default function HomeScreen({ navigation, onLogout }) {
  const [isOnline, setIsOnline] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    updateStatus();

    const networkListener = NetworkMonitor.on('networkStateChanged', (online) => {
      setIsOnline(online);
    });

    const syncStartListener = SyncEngine.on('syncStarted', () => {
      setSyncStatus('syncing');
    });

    const syncCompleteListener = SyncEngine.on('syncCompleted', (result) => {
      setSyncStatus('completed');
      setTimeout(() => setSyncStatus(null), 3000);
    });

    const syncFailedListener = SyncEngine.on('syncFailed', () => {
      setSyncStatus('failed');
      setTimeout(() => setSyncStatus(null), 3000);
    });

    return () => {
      NetworkMonitor.removeListener('networkStateChanged', networkListener);
      SyncEngine.removeListener('syncStarted', syncStartListener);
      SyncEngine.removeListener('syncCompleted', syncCompleteListener);
      SyncEngine.removeListener('syncFailed', syncFailedListener);
    };
  }, []);

  const loadUserData = async () => {
    const user = await SecureStorage.getUserData();
    setUserData(user);
  };

  const updateStatus = () => {
    setIsOnline(NetworkMonitor.getConnectionStatus());
    const status = SyncEngine.getStatus();
    if (status.isSyncing) {
      setSyncStatus('syncing');
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline');
      return;
    }

    await SyncEngine.triggerSync('manual');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await handleSync();
    setRefreshing(false);
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{userData?.name || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogoutPress} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Network Status:</Text>
          <View style={[styles.statusDot, isOnline ? styles.online : styles.offline]} />
          <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
        
        {syncStatus && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Sync Status:</Text>
            <Text style={[
              styles.statusText,
              syncStatus === 'syncing' && styles.syncingText,
              syncStatus === 'completed' && styles.completedText,
              syncStatus === 'failed' && styles.failedText,
            ]}>
              {syncStatus === 'syncing' && 'Syncing...'}
              {syncStatus === 'completed' && 'Synced ✓'}
              {syncStatus === 'failed' && 'Sync Failed ✗'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.syncButton, !isOnline && styles.syncButtonDisabled]}
          onPress={handleSync}
          disabled={!isOnline || syncStatus === 'syncing'}
        >
          <Text style={styles.syncButtonText}>
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Suppliers')}
        >
          <Text style={styles.menuIcon}>👥</Text>
          <Text style={styles.menuText}>Suppliers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Collections')}
        >
          <Text style={styles.menuIcon}>📦</Text>
          <Text style={styles.menuText}>Collections</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>💰</Text>
          <Text style={styles.menuText}>Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuText}>Reports</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  statusCard: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  online: {
    backgroundColor: '#34C759',
  },
  offline: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
  syncingText: {
    color: '#007AFF',
  },
  completedText: {
    color: '#34C759',
  },
  failedText: {
    color: '#FF3B30',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  syncButtonDisabled: {
    backgroundColor: '#ccc',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  menuItem: {
    width: '47%',
    margin: '1.5%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
