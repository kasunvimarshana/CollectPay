/**
 * Collection List Screen
 * Displays all collections with search and filter capabilities
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
import { Collection } from '../../domain/entities/Collection';
import { useAuth } from '../contexts/AuthContext';
import { canCreate } from '../../core/utils/permissions';
import { Pagination, SortButton, ScreenHeader, SyncStatusIndicator } from '../components';
import THEME from '../../core/constants/theme';

export const CollectionListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [collections, setCollections] = useState<Collection[]>([]);
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
  const [sortBy, setSortBy] = useState<string>('collection_date');
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
    loadCollections();
  }, [currentPage, sortBy, sortOrder, searchTerm]);

  const loadCollections = async () => {
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
      const response = await apiClient.get<any>(`/collections?${params.toString()}`);
      if (response.success && response.data) {
        const paginatedData = response.data;
        setCollections(paginatedData.data || []);
        setTotalPages(paginatedData.last_page || 1);
        setTotalItems(paginatedData.total || 0);
        setCurrentPage(paginatedData.current_page || 1);
        setPerPage(paginatedData.per_page || 10);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      Alert.alert('Error', 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollections();
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

  const handleCollectionPress = (collection: Collection) => {
    (navigation.navigate as any)('CollectionDetail', { collectionId: collection.id });
  };

  const handleAddCollection = () => {
    (navigation.navigate as any)('CollectionForm');
  };

  const renderCollectionItem = ({ item }: { item: Collection }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => handleCollectionPress(item)}
    >
      <View style={styles.collectionHeader}>
        <Text style={styles.supplierName}>{String(item.supplier?.name || 'Unknown Supplier')}</Text>
        <Text style={styles.date}>
          {new Date(item.collection_date).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.collectionDetails}>
        <Text style={styles.detailLabel}>Product:</Text>
        <Text style={styles.detailValue}>{String(item.product?.name || 'Unknown')}</Text>
      </View>

      <View style={styles.collectionDetails}>
        <Text style={styles.detailLabel}>Quantity:</Text>
        <Text style={styles.detailValue}>
          {String(item.quantity)} {String(item.unit)}
        </Text>
      </View>

      <View style={styles.collectionDetails}>
        <Text style={styles.detailLabel}>Rate:</Text>
        <Text style={styles.detailValue}>
          {String(item.rate_applied)} per {String(item.unit)}
        </Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Amount:</Text>
        <Text style={styles.totalValue}>
          ${typeof item.total_amount === 'number' ? item.total_amount.toFixed(2) : '0.00'}
        </Text>
      </View>

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>{String(item.notes)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading collections...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Collections"
        variant="light"
        showAddButton={canCreate(user, 'collections')}
        onAddPress={handleAddCollection}
        addButtonText="+ Add Collection"
        rightComponent={<SyncStatusIndicator showDetails={false} />}
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search collections..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sort Controls */}
      <View style={styles.sortContainer}>
        <SortButton 
          label="Date" 
          direction={getSortDirection('collection_date')}
          onPress={() => handleSort('collection_date')} 
        />
      </View>

      <FlatList
        data={collections}
        renderItem={renderCollectionItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + THEME.spacing.base }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No collections found</Text>
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
  header: {
    padding: THEME.spacing.base,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  addButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.base,
  },
  addButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  searchContainer: {
    padding: THEME.spacing.base,
    backgroundColor: THEME.colors.surface,
  },
  searchInput: {
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
    fontSize: THEME.typography.fontSize.md,
  },
  listContent: {
    padding: THEME.spacing.base,
  },
  collectionCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.base,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  supplierName: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  date: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  collectionDetails: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.sm,
  },
  detailLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    width: 80,
  },
  detailValue: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  totalLabel: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
  },
  totalValue: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.primary,
  },
  notesContainer: {
    marginTop: 8,
    padding: THEME.spacing.sm,
    backgroundColor: THEME.colors.gray50,
    borderRadius: THEME.borderRadius.sm,
  },
  notesText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
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
    padding: THEME.spacing.xxl,
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
    gap: 8,
  },
});
