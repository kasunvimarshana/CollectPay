/**
 * Payment List Screen
 * Displays all payments with search and filter capabilities
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { Payment } from '../../domain/entities/Payment';
import { useAuth } from '../contexts/AuthContext';
import { canCreate } from '../../core/utils/permissions';
import { Pagination, SortButton, ScreenHeader, SyncStatusIndicator } from '../components';
import THEME, { getPaymentTypeColor } from '../../core/constants/theme';

export const PaymentListScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const supplierId = (route.params as any)?.supplierId;
  const [payments, setPayments] = useState<Payment[]>([]);
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
  const [sortBy, setSortBy] = useState<string>('payment_date');
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
    loadPayments();
  }, [currentPage, sortBy, sortOrder, searchTerm]);

  const loadPayments = async () => {
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
      if (supplierId) {
        params.append('supplier_id', supplierId.toString());
      }
      const response = await apiClient.get<any>(`/payments?${params.toString()}`);
      if (response.success && response.data) {
        const paginatedData = response.data;
        setPayments(paginatedData.data || []);
        setTotalPages(paginatedData.last_page || 1);
        setTotalItems(paginatedData.total || 0);
        setCurrentPage(paginatedData.current_page || 1);
        setPerPage(paginatedData.per_page || 10);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
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

  const handlePaymentPress = (payment: Payment) => {
    (navigation.navigate as any)('PaymentDetail', { paymentId: payment.id });
  };

  const handleAddPayment = () => {
    (navigation.navigate as any)('PaymentForm');
  };

  const getTypeColor = (type: string) => {
    return getPaymentTypeColor(type);
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => handlePaymentPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`Payment from ${item.supplier?.name || 'Unknown Supplier'}, Type: ${item.type}, Amount: $${typeof item.amount === 'number' ? item.amount.toFixed(2) : '0.00'}, Date: ${new Date(item.payment_date).toLocaleDateString()}`}
      accessibilityHint="Press to view payment details"
    >
      <View style={styles.paymentHeader}>
        <Text style={styles.supplierName}>{String(item.supplier?.name || 'Unknown Supplier')}</Text>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
          <Text style={styles.typeText}>{String(item.type).toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <Text style={styles.detailLabel}>Date:</Text>
        <Text style={styles.detailValue}>
          {new Date(item.payment_date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.paymentDetails}>
        <Text style={styles.detailLabel}>Amount:</Text>
        <Text style={styles.amountValue}>{typeof item.amount === 'number' || typeof item.amount === 'string' ? (Number(item.amount) || 0).toFixed(2)
 : '0.00'}</Text>
      </View>

      {item.reference_number && (
        <View style={styles.paymentDetails}>
          <Text style={styles.detailLabel}>Ref:</Text>
          <Text style={styles.detailValue}>{String(item.reference_number)}</Text>
        </View>
      )}

      {item.payment_method && (
        <View style={styles.paymentDetails}>
          <Text style={styles.detailLabel}>Method:</Text>
          <Text style={styles.detailValue}>{String(item.payment_method)}</Text>
        </View>
      )}

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
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Payments"
        variant="light"
        showAddButton={canCreate(user, 'payments')}
        onAddPress={handleAddPayment}
        addButtonText="+ Add Payment"
        rightComponent={<SyncStatusIndicator showDetails={false} />}
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search payments..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sort Controls */}
      <View style={styles.sortContainer}>
        <SortButton 
          label="Date" 
          direction={getSortDirection('payment_date')}
          onPress={() => handleSort('payment_date')} 
        />
        <SortButton 
          label="Amount" 
          direction={getSortDirection('amount')}
          onPress={() => handleSort('amount')} 
        />
      </View>

      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + THEME.spacing.base }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payments found</Text>
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
  paymentCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.base,
  },
  paymentHeader: {
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
  typeBadge: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.md,
  },
  typeText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.xs,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  paymentDetails: {
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
  amountValue: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.success,
    flex: 1,
  },
  notesContainer: {
    marginTop: THEME.spacing.sm,
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
