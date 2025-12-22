import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { database } from '../services/database';
import { CollectionModel } from '../models/Collection';
import { PaymentModel } from '../models/Payment';
import SyncService from '../services/sync';
import { format } from 'date-fns';

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [collections, setCollections] = useState<CollectionModel[]>([]);
  const [payments, setPayments] = useState<PaymentModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    loadLastSyncTime();
  }, []);

  const loadData = async () => {
    try {
      const collectionsData = await database
        .get<CollectionModel>('collections')
        .query()
        .fetch();
      
      const paymentsData = await database
        .get<PaymentModel>('payments')
        .query()
        .fetch();

      setCollections(collectionsData.slice(0, 5));
      setPayments(paymentsData.slice(0, 5));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLastSyncTime = async () => {
    const syncTime = await SyncService.getLastSyncTime();
    setLastSync(syncTime);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await SyncService.syncAll();
      if (result.success) {
        Alert.alert('Success', 'Data synced successfully');
        await loadData();
        await loadLastSyncTime();
      } else {
        Alert.alert('Sync Failed', result.error || 'Unknown error');
      }
    } catch (error: any) {
      Alert.alert('Sync Error', error.message);
    } finally {
      setIsSyncing(false);
    }
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
          onPress: async () => await logout(),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
          <Text style={styles.roleText}>Role: {user?.role}</Text>
          {lastSync && (
            <Text style={styles.syncText}>
              Last sync: {format(new Date(lastSync), 'MMM dd, yyyy HH:mm')}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{collections.length}</Text>
          <Text style={styles.statLabel}>Collections</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{payments.length}</Text>
          <Text style={styles.statLabel}>Payments</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CollectionForm' as never)}
        >
          <Text style={styles.actionButtonText}>+ New Collection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('PaymentForm' as never)}
        >
          <Text style={styles.actionButtonText}>+ New Payment</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
        onPress={handleSync}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.syncButtonText}>Sync Data</Text>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          ℹ️ Data is saved locally and will sync automatically when online
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  syncText: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  logoutButton: {
    padding: 10,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  syncButton: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#E8F4FD',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B3D9F2',
  },
  infoText: {
    color: '#007AFF',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HomeScreen;
