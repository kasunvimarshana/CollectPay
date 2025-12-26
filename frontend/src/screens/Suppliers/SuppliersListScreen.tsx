import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiService from '../../services/api';
import { Supplier } from '../../types';
import { LoadingSpinner, ErrorMessage } from '../../components';

type RootStackParamList = {
  SupplierDetail: { supplierId: number | null };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SuppliersListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchSuppliers = useCallback(async (pageNum: number = 1, search: string = '') => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }
      setError('');
      const response = await apiService.getSuppliers({
        search: search || undefined,
        page: pageNum,
        per_page: 20,
        is_active: true,
      });
      
      if (pageNum === 1) {
        setSuppliers(response.data);
      } else {
        setSuppliers(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.current_page < response.last_page);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers(1, searchQuery);
  }, [searchQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSuppliers(1, searchQuery);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchSuppliers(page + 1, searchQuery);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const renderSupplierItem = ({ item }: { item: Supplier }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SupplierDetail', { supplierId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{item.is_active ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      
      {item.contact_person && (
        <Text style={styles.detail}>Contact: {item.contact_person}</Text>
      )}
      {item.phone && (
        <Text style={styles.detail}>Phone: {item.phone}</Text>
      )}
      
      <View style={styles.balanceSection}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Collections</Text>
          <Text style={styles.balanceValue}>
            ${(item.total_collections_amount || 0).toFixed(2)}
          </Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Payments</Text>
          <Text style={styles.balanceValue}>
            ${(item.total_payments_amount || 0).toFixed(2)}
          </Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={[
            styles.balanceValue,
            (item.balance_amount || 0) > 0 ? styles.balancePositive : styles.balanceNegative
          ]}>
            ${(item.balance_amount || 0).toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && suppliers.length === 0) {
    return <LoadingSpinner message="Loading suppliers..." />;
  }

  if (error && suppliers.length === 0) {
    return <ErrorMessage message={error} onRetry={() => fetchSuppliers(1, searchQuery)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search suppliers..."
          placeholderTextColor="#95a5a6"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={suppliers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSupplierItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No suppliers found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SupplierDetail', { supplierId: null })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#dce1e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#d4edda',
  },
  badgeInactive: {
    backgroundColor: '#f8d7da',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 11,
    color: '#95a5a6',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  balancePositive: {
    color: '#27ae60',
  },
  balanceNegative: {
    color: '#e74c3c',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SuppliersListScreen;
