import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, FAB, Chip, Text } from 'react-native-paper';
import { StorageService } from '../services/StorageService';
import { syncService } from '../services/SyncService';

export default function HomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ collections: 0, payments: 0, rates: 0, pendingSync: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await StorageService.getUser();
    setUser(userData);

    const collections = await StorageService.getCollections();
    const payments = await StorageService.getPayments();
    const rates = await StorageService.getRates();
    const queue = await StorageService.getSyncQueue();

    setStats({
      collections: collections.length,
      payments: payments.length,
      rates: rates.length,
      pendingSync: queue.length,
    });
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncService.performSync();
      if (result.success) {
        Alert.alert('Success', 'Data synchronized successfully');
        if (result.conflicts.length > 0) {
          Alert.alert('Conflicts Found', `${result.conflicts.length} conflicts need resolution`);
        }
        await loadData();
      } else {
        Alert.alert('Sync Failed', 'Could not sync data. Check your connection.');
      }
    } catch (error) {
      Alert.alert('Error', 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await StorageService.clearAuth();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Title>Welcome, {user?.name || 'User'}</Title>
            <Paragraph>{user?.email}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Statistics</Title>
            <View style={styles.statsRow}>
              <Chip icon="folder">Collections: {stats.collections}</Chip>
              <Chip icon="cash">Payments: {stats.payments}</Chip>
            </View>
            <View style={styles.statsRow}>
              <Chip icon="currency-usd">Rates: {stats.rates}</Chip>
              <Chip icon="sync" textStyle={{ color: stats.pendingSync > 0 ? 'red' : 'green' }}>
                Pending: {stats.pendingSync}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <Button
              mode="contained"
              icon="folder-multiple"
              onPress={() => navigation.navigate('Collections')}
              style={styles.actionButton}
            >
              Manage Collections
            </Button>
            <Button
              mode="contained"
              icon="cash-multiple"
              onPress={() => navigation.navigate('Payments')}
              style={styles.actionButton}
            >
              Manage Payments
            </Button>
            <Button
              mode="contained"
              icon="currency-usd"
              onPress={() => navigation.navigate('Rates')}
              style={styles.actionButton}
            >
              View Rates
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="outlined"
              icon="sync"
              onPress={handleSync}
              loading={syncing}
              disabled={syncing}
              style={styles.syncButton}
            >
              Sync Now
            </Button>
            <Button
              mode="text"
              icon="logout"
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              Logout
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 10,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    marginTop: 10,
  },
  syncButton: {
    marginTop: 10,
  },
  logoutButton: {
    marginTop: 5,
  },
});
