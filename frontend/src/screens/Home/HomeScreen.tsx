import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

type RootStackParamList = {
  CollectionForm: undefined;
  PaymentForm: undefined;
  Suppliers: undefined;
  Products: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [stats, setStats] = useState({
    suppliers: 0,
    products: 0,
    collections: 0,
    payments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [suppliersRes, productsRes, collectionsRes, paymentsRes] = await Promise.all([
        apiService.getSuppliers({ per_page: 1 }).catch(() => ({ data: [], total: 0 })),
        apiService.getProducts({ per_page: 1 }).catch(() => ({ data: [], total: 0 })),
        apiService.getCollections({ per_page: 1 }).catch(() => ({ data: [], total: 0 })),
        apiService.getPayments({ per_page: 1 }).catch(() => ({ data: [], total: 0 })),
      ]);

      setStats({
        suppliers: suppliersRes.total || 0,
        products: productsRes.total || 0,
        collections: collectionsRes.total || 0,
        payments: paymentsRes.total || 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const quickActions = [
    {
      title: 'Record Collection',
      icon: '📦',
      color: '#27ae60',
      screen: 'CollectionForm' as const,
    },
    {
      title: 'Record Payment',
      icon: '💰',
      color: '#9b59b6',
      screen: 'PaymentForm' as const,
    },
    {
      title: 'View Suppliers',
      icon: '👥',
      color: '#3498db',
      screen: 'Suppliers' as const,
    },
    {
      title: 'View Products',
      icon: '📋',
      color: '#e67e22',
      screen: 'Products' as const,
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.name}!</Text>
        <Text style={styles.subtitle}>Role: {user?.role}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{loading ? '-' : stats.suppliers}</Text>
            <Text style={styles.statLabel}>Total Suppliers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{loading ? '-' : stats.products}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#27ae60' }]}>
              {loading ? '-' : stats.collections}
            </Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#9b59b6' }]}>
              {loading ? '-' : stats.payments}
            </Text>
            <Text style={styles.statLabel}>Payments</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { borderLeftColor: action.color }]}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#ecf0f1',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
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
    color: '#3498db',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  actionsGrid: {
    gap: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
