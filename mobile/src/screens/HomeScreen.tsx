import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import apiService from '../services/api';

export default function HomeScreen() {
  const user = useAppSelector(state => state.auth.user);
  const isOnline = useAppSelector(state => state.app.isOnline);
  const pendingSyncCount = useAppSelector(state => state.app.pendingSyncCount);
  const lastSyncTimestamp = useAppSelector(state => state.app.lastSyncTimestamp);
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Ignore error on logout
    }
    await apiService.removeAuthToken();
    dispatch(logout());
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TransacTrack</Text>
        <View style={[styles.statusBadge, isOnline ? styles.online : styles.offline]}>
          <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome, {user?.name}!</Text>
        <Text style={styles.cardText}>Role: {user?.role}</Text>
        <Text style={styles.cardText}>Email: {user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sync Status</Text>
        <Text style={styles.cardText}>
          Pending items: {pendingSyncCount}
        </Text>
        <Text style={styles.cardText}>
          Last sync: {lastSyncTimestamp ? new Date(lastSyncTimestamp).toLocaleString() : 'Never'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <Text style={styles.cardText}>• Record new collection</Text>
        <Text style={styles.cardText}>• Process payment</Text>
        <Text style={styles.cardText}>• Add supplier</Text>
        <Text style={styles.cardText}>• View reports</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  online: {
    backgroundColor: '#34C759',
  },
  offline: {
    backgroundColor: '#FF9500',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  logoutButton: {
    margin: 15,
    marginTop: 30,
    padding: 15,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
