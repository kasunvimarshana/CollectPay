/**
 * Supplier List Screen
 * Displays all suppliers with search and filter capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../infrastructure/api/apiClient';
import { Supplier } from '../../domain/entities/Supplier';
import { useAuth } from '../contexts/AuthContext';
import { canCreate } from '../../core/utils/permissions';
import { usePagination } from '../../core/hooks/usePagination';
import { useSort } from '../../core/hooks/useSort';
import { Pagination } from '../components/Pagination';
import { SortButton } from '../components/SortButton';

export const SupplierListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);

  // Sorting hook
  const { sortedData, requestSort, getSortDirection } = useSort<Supplier>(filteredSuppliers);

  // Pagination hook
  const {
    currentData,
    currentPage,
    totalPages,
    totalItems,
    perPage,
    goToPage,
    hasNextPage,
    hasPreviousPage,
  } = usePagination(sortedData, { initialPerPage: 10 });

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [searchQuery, suppliers]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>('/suppliers');
      if (response.success && response.data) {
        // Handle paginated response
        const suppliers = Array.isArray(response.data) 
          ? response.data 
          : ((response.data as any).data || response.data);
        setSuppliers(suppliers);
        setFilteredSuppliers(suppliers);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      Alert.alert('Error', 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSuppliers();
    setRefreshing(false);
  };

  const filterSuppliers = () => {
    if (!searchQuery.trim()) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(query) ||
        supplier.code?.toLowerCase().includes(query) ||
        supplier.region?.toLowerCase().includes(query)
    );
    setFilteredSuppliers(filtered);
  };

  const handleSupplierPress = (supplier: Supplier) => {
    (navigation.navigate as any)('SupplierDetail', { supplierId: supplier.id });
  };

  const handleAddSupplier = () => {
    (navigation.navigate as any)('SupplierForm');
  };

  const renderSupplierItem = ({ item }: { item: Supplier }) => (
    <TouchableOpacity
      style={styles.supplierCard}
      onPress={() => handleSupplierPress(item)}
    >
      <View style={styles.supplierHeader}>
        <Text style={styles.supplierName}>{item.name}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.is_active ? '#4CAF50' : '#F44336' }
        ]}>
          <Text style={styles.statusText}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={styles.supplierDetails}>
        <Text style={styles.detailText}>Code: {item.code}</Text>
        {item.region && (
          <Text style={styles.detailText}>Region: {item.region}</Text>
        )}
        {item.phone && (
          <Text style={styles.detailText}>Phone: {item.phone}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading suppliers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suppliers</Text>
        {canCreate(user, 'suppliers') && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddSupplier}
          >
            <Text style={styles.addButtonText}>+ Add Supplier</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, code, or region..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sort Controls */}
      <View style={styles.sortContainer}>
        <SortButton 
          label="Name" 
          direction={getSortDirection('name')}
          onPress={() => requestSort('name')} 
        />
        <SortButton 
          label="Code" 
          direction={getSortDirection('code')}
          onPress={() => requestSort('code')} 
        />
        <SortButton 
          label="Region" 
          direction={getSortDirection('region')}
          onPress={() => requestSort('region')} 
        />
      </View>

      <FlatList
        data={currentData}
        renderItem={renderSupplierItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No suppliers found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Add your first supplier to get started'}
            </Text>
          </View>
        }
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={perPage}
        onPageChange={goToPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  supplierCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  supplierDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'flex-start',
    gap: 8,
  },
});
