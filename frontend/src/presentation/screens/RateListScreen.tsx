/**
 * Rate List Screen
 * Displays all rates with search and filter capabilities
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
import { Rate } from '../../domain/entities/Product';
import { useAuth } from '../contexts/AuthContext';
import { canCreate } from '../../core/utils/permissions';
import { Pagination, SortButton, ScreenHeader, SyncStatusIndicator } from '../components';
import THEME from '../../core/constants/theme';
import Logger from '../../core/utils/Logger';

export const RateListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Debounced search term
  
  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);
  
  // Server-side sorting state
  const [sortBy, setSortBy] = useState<string>('effective_from');
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
    loadRates();
  }, [currentPage, sortBy, sortOrder, searchTerm]);

  const loadRates = async () => {
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
      
      const response = await apiClient.get<any>(`/rates?${params.toString()}`);
      if (response.success && response.data) {
        // Handle Laravel pagination response
        const paginatedData = response.data;
        const loadedRates = paginatedData.data || [];
        setRates(loadedRates);
        setTotalPages(paginatedData.last_page || 1);
        setTotalItems(paginatedData.total || 0);
        setCurrentPage(paginatedData.current_page || 1);
        setPerPage(paginatedData.per_page || 10);
      }
    } catch (error) {
      Logger.error('Error loading rates', error);
      Alert.alert('Error', 'Failed to load rates');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRates();
    setRefreshing(false);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleCreate = () => {
    (navigation.navigate as any)('RateForm');
  };

  const handleViewDetails = (rateId: number) => {
    (navigation.navigate as any)('RateDetail', { rateId });
  };

  const renderRateItem = ({ item }: { item: Rate }) => {
    const isActive = !item.effective_to || new Date(item.effective_to) > new Date();
    
    return (
      <TouchableOpacity
        style={styles.rateCard}
        onPress={() => handleViewDetails(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Rate for ${item.product?.name || 'Product'}: ${item.rate} per ${item.unit}, ${isActive ? 'Active' : 'Inactive'}`}
        accessibilityHint="Press to view rate details"
      >
        <View style={styles.cardHeader}>
          <View style={styles.rateInfo}>
            <Text style={styles.rateName}>
              {item.product?.name || `Product ID: ${item.product_id}`}
            </Text>
            <Text style={styles.rateAmount}>{String(item.rate)} per {String(item.unit)}</Text>
          </View>
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Version:</Text>
            <Text style={styles.detailValue}>{String(item.version)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Effective From:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.effective_from).toLocaleDateString()}
            </Text>
          </View>
          
          {item.effective_to && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Effective To:</Text>
              <Text style={styles.detailValue}>
                {new Date(item.effective_to).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No rates found</Text>
      {canCreate(user, 'rates') && (
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create First Rate</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Rates"
        subtitle={`${totalItems} total`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<SyncStatusIndicator />}
      />

      {/* Search and Sort Controls */}
      <View style={styles.controlsContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search rates..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={THEME.colors.textSecondary}
        />
        
        <View style={styles.sortContainer}>
          <SortButton
            label="Rate"
            direction={sortBy === 'rate' ? sortOrder : null}
            onPress={() => handleSort('rate')}
          />
          <SortButton
            label="Date"
            direction={sortBy === 'effective_from' ? sortOrder : null}
            onPress={() => handleSort('effective_from')}
          />
          <SortButton
            label="Version"
            direction={sortBy === 'version' ? sortOrder : null}
            onPress={() => handleSort('version')}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading rates...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={rates}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRateItem}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 80 }
            ]}
            ListEmptyComponent={renderEmptyList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              perPage={perPage}
              hasNextPage={currentPage < totalPages}
              hasPreviousPage={currentPage > 1}
            />
          )}
        </>
      )}

      {/* Floating Action Button */}
      {canCreate(user, 'rates') && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + THEME.spacing.lg }]}
          onPress={handleCreate}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  controlsContainer: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  searchInput: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  listContent: {
    padding: THEME.spacing.base,
  },
  rateCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.base,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.base,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.md,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  rateInfo: {
    flex: 1,
  },
  rateName: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  rateAmount: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.primary,
  },
  activeBadge: {
    backgroundColor: THEME.colors.success,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.md,
  },
  activeBadgeText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  cardBody: {
    marginTop: THEME.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  detailLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  detailValue: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    marginTop: THEME.spacing.xxxl,
  },
  emptyText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.lg,
  },
  createButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
  },
  createButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  fab: {
    position: 'absolute',
    right: THEME.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...THEME.shadows.lg,
  },
  fabText: {
    fontSize: THEME.typography.fontSize.huge,
    color: THEME.colors.white,
    fontWeight: THEME.typography.fontWeight.bold,
  },
});
