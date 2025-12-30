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
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../infrastructure/api/apiClient';
import { Payment } from '../../domain/entities/Payment';
import { useAuth } from '../contexts/AuthContext';
import { canCreate } from '../../core/utils/permissions';
import { Pagination } from '../components/Pagination';
import { SortButton } from '../components/SortButton';
import { SyncStatusIndicator } from '../components/SyncStatusIndicator';

export const PaymentListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
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
    switch (type) {
      case 'advance':
        return '#FF9800';
      case 'partial':
        return '#2196F3';
      case 'full':
        return '#4CAF50';
      case 'adjustment':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => handlePaymentPress(item)}
    >
      <View style={styles.paymentHeader}>
        <Text style={styles.supplierName}>{item.supplier?.name || 'Unknown Supplier'}</Text>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
          <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
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
        <Text style={styles.amountValue}>${item.amount.toFixed(2)}</Text>
      </View>

      {item.reference_number && (
        <View style={styles.paymentDetails}>
          <Text style={styles.detailLabel}>Ref:</Text>
          <Text style={styles.detailValue}>{item.reference_number}</Text>
        </View>
      )}

      {item.payment_method && (
        <View style={styles.paymentDetails}>
          <Text style={styles.detailLabel}>Method:</Text>
          <Text style={styles.detailValue}>{item.payment_method}</Text>
        </View>
      )}

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Payments</Text>
          {canCreate(user, 'payments') && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPayment}
            >
              <Text style={styles.addButtonText}>+ Add Payment</Text>
            </TouchableOpacity>
          )}
        </View>
        <SyncStatusIndicator showDetails={true} />
      </View>

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
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payments found</Text>
          </View>
        }
      />

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  paymentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  paymentDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    flex: 1,
  },
  notesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
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
