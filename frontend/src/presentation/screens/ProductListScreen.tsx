/**
 * Product List Screen
 * Displays all products with search and filter capabilities
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
import { Product } from '../../domain/entities/Product';
import { useAuth } from '../contexts/AuthContext';
import { canCreate } from '../../core/utils/permissions';
import { Pagination, SortButton, ScreenHeader } from '../components';
import THEME from '../../core/constants/theme';

export const ProductListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
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
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadProducts();
  }, [currentPage, sortBy, sortOrder, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      const response = await apiClient.get<any>(`/products?${params.toString()}`);
      if (response.success && response.data) {
        const paginatedData = response.data;
        const loadedProducts = paginatedData.data || [];
        setProducts(loadedProducts);
        setTotalPages(paginatedData.last_page || 1);
        setTotalItems(paginatedData.total || 0);
        setCurrentPage(paginatedData.current_page || 1);
        setPerPage(paginatedData.per_page || 10);
        
        // Cache products for offline use
        if (loadedProducts.length > 0 && !response.fromCache) {
          try {
            await LocalStorageService.cacheProducts(loadedProducts);
          } catch (cacheError) {
            console.error('Failed to cache products:', cacheError);
          }
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getSortDirection = (field: string): 'asc' | 'desc' | null => {
    return sortBy === field ? sortOrder : null;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleProductPress = (product: Product) => {
    (navigation.navigate as any)('ProductDetail', { productId: product.id });
  };

  const handleAddProduct = () => {
    (navigation.navigate as any)('ProductForm');
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{String(item.name)}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.is_active ? THEME.colors.success : THEME.colors.error }
        ]}>
          <Text style={styles.statusText}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={styles.productDetails}>
        <Text style={styles.detailLabel}>Code:</Text>
        <Text style={styles.detailValue}>{String(item.code)}</Text>
      </View>

      <View style={styles.productDetails}>
        <Text style={styles.detailLabel}>Base Unit:</Text>
        <Text style={styles.detailValue}>{String(item.base_unit)}</Text>
      </View>

      {item.supported_units && item.supported_units.length > 0 && (
        <View style={styles.productDetails}>
          <Text style={styles.detailLabel}>Supported Units:</Text>
          <Text style={styles.detailValue}>
            {Array.isArray(item.supported_units) 
              ? item.supported_units.join(', ')
              : String(item.supported_units)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Products"
        variant="light"
        showAddButton={canCreate(user, 'products')}
        onAddPress={handleAddProduct}
        addButtonText="+ Add Product"
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

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
      </View>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + THEME.spacing.base }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
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
  searchContainer: {
    padding: THEME.spacing.base,
    backgroundColor: THEME.colors.surface,
  },
  searchInput: {
    backgroundColor: THEME.colors.gray100,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
    fontSize: THEME.typography.fontSize.md,
  },
  listContent: {
    padding: THEME.spacing.base,
  },
  productCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.base,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  productName: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
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
  productDetails: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.sm,
  },
  detailLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    width: 120,
  },
  detailValue: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textSecondary,
  },
  emptyContainer: {
    padding: THEME.spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textTertiary,
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
