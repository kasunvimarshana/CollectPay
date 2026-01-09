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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import LocalStorageService from '../../infrastructure/storage/LocalStorageService';
import { Supplier } from '../../domain/entities/Supplier';
import { useAuth } from '../contexts/AuthContext';
import { canCreate } from '../../core/utils/permissions';
import { Pagination, SortButton, ScreenHeader, SyncStatusIndicator } from '../components';
import THEME from '../../core/constants/theme';
import Logger from '../../core/utils/Logger';

export const SupplierListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Debounced search term
  const [showingCachedData, setShowingCachedData] = useState(false); // Track if viewing cached data
  
  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);
  
  // Server-side sorting state
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadSuppliers();
  }, [currentPage, sortBy, sortOrder, searchTerm]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for server-side operations
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const response = await apiClient.get<any>(`/suppliers?${params.toString()}`);
      if (response.success && response.data) {
        // Handle Laravel pagination response
        const paginatedData = response.data;
        const loadedSuppliers = paginatedData.data || [];
        setSuppliers(loadedSuppliers);
        setTotalPages(paginatedData.last_page || 1);
        setTotalItems(paginatedData.total || 0);
        setCurrentPage(paginatedData.current_page || 1);
        setPerPage(paginatedData.per_page || 10);
        
        // Track if this is cached data
        setShowingCachedData(!!response.fromCache);
        
        // Cache suppliers for offline use
        if (loadedSuppliers.length > 0 && !response.fromCache) {
          try {
            await LocalStorageService.cacheSuppliers(loadedSuppliers);
          } catch (cacheError) {
            Logger.error('Failed to cache suppliers', cacheError);
          }
        }
      }
    } catch (error) {
      Logger.error('Error loading suppliers', error);
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

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const getSortDirection = (field: string): 'asc' | 'desc' | null => {
    return sortBy === field ? sortOrder : null;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      accessibilityRole="button"
      accessibilityLabel={`Supplier: ${item.name}, Code: ${item.code}, Status: ${item.is_active ? 'Active' : 'Inactive'}`}
      accessibilityHint="Press to view supplier details"
    >
      <View style={styles.supplierHeader}>
        <Text style={styles.supplierName}>{String(item.name)}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.is_active ? THEME.colors.success : THEME.colors.error }
        ]}>
          <Text style={styles.statusText}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={styles.supplierDetails}>
        <Text style={styles.detailText}>Code: {String(item.code)}</Text>
        {item.region && (
          <Text style={styles.detailText}>Region: {String(item.region)}</Text>
        )}
        {item.phone && (
          <Text style={styles.detailText}>Phone: {String(item.phone)}</Text>
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
      <ScreenHeader
        title="Suppliers"
        variant="light"
        showAddButton={canCreate(user, 'suppliers')}
        onAddPress={handleAddSupplier}
        addButtonText="+ Add Supplier"
        rightComponent={<SyncStatusIndicator showDetails={false} />}
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, code, or region..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search suppliers"
          accessibilityHint="Enter text to search suppliers by name, code, or region"
        />
      </View>

      {/* Cached Data Banner */}
      {showingCachedData && (
        <View style={styles.cachedDataBanner}>
          <Text style={styles.cachedDataText}>
            📱 Viewing cached data (offline). Pull to refresh when online.
          </Text>
        </View>
      )}

      {/* Sort Controls */}
      <View style={styles.sortContainer}>
        <SortButton 
          label="Name" 
          direction={getSortDirection('name')}
          onPress={() => handleSort('name')} 
        />
        <SortButton 
          label="Code" 
          direction={getSortDirection('code')}
          onPress={() => handleSort('code')} 
        />
        <SortButton 
          label="Region" 
          direction={getSortDirection('region')}
          onPress={() => handleSort('region')} 
        />
      </View>

      <FlatList
        data={suppliers}
        renderItem={renderSupplierItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + THEME.spacing.base }]}
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

      <View style={[{ paddingBottom: insets.bottom }]}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={perPage}
          onPageChange={handlePageChange}
          hasNextPage={currentPage < totalPages}
          hasPreviousPage={currentPage > 1}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: THEME.spacing.sm,
    color: THEME.colors.textSecondary,
  },
  searchContainer: {
    padding: THEME.spacing.base,
    backgroundColor: THEME.colors.surface,
  },
  cachedDataBanner: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.base,
    marginHorizontal: THEME.spacing.base,
    marginBottom: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
  },
  cachedDataText: {
    color: '#856404',
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  searchInput: {
    backgroundColor: THEME.colors.gray100,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
  },
  listContainer: {
    padding: THEME.spacing.base,
  },
  supplierCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.base,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.base,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  supplierName: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.md,
  },
  statusText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  supplierDetails: {
    gap: THEME.spacing.xs,
  },
  detailText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xxxl,
    marginTop: THEME.spacing.xxxl * 1.5,
  },
  emptyText: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.sm,
  },
  emptySubtext: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textTertiary,
    textAlign: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    justifyContent: 'flex-start',
    gap: THEME.spacing.sm,
  },
});
