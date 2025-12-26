import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { paymentService, Payment, CreatePaymentRequest, UpdatePaymentRequest } from '../api/payment';
import { supplierService, Supplier } from '../api/supplier';
import { formatDate, formatAmount } from '../utils/formatters';
import { FloatingActionButton, FormModal, Input, Button, Picker } from '../components';
import DateRangePicker, { DateRange } from '../components/DateRangePicker';
import { PAYMENT_TYPE_OPTIONS, PAYMENT_METHOD_OPTIONS } from '../utils/constants';
import { usePagination } from '../hooks/usePagination';

type PaymentType = 'advance' | 'partial' | 'full';

const PaymentsScreen = () => {
  const pagination = usePagination<Payment>({ initialPerPage: 25 });
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPaymentType, setFilterPaymentType] = useState<PaymentType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'payment_date' | 'amount' | 'payment_type'>('payment_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    supplier_id: null as number | null,
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_type: 'partial' as PaymentType,
    payment_method: 'cash',
    reference_number: '',
    notes: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPayments();
    loadSuppliers();
  }, []);

  // Debounce search, filters, and date range
  useEffect(() => {
    const timer = setTimeout(() => {
      pagination.reset();
      loadPayments(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filterPaymentType, dateRange]);
  
  // Reload when sort changes
  useEffect(() => {
    if (!isLoading) {
      pagination.reset();
      loadPayments(false);
    }
  }, [sortBy, sortOrder]);

  // Reload when page size changes
  useEffect(() => {
    if (!isLoading) {
      pagination.reset();
      loadPayments(false);
    }
  }, [pagination.perPage]);

  const loadPayments = async (loadMore: boolean = false) => {
    try {
      if (loadMore) {
        pagination.setIsLoadingMore(true);
      }
      
      const pageToLoad = loadMore ? pagination.page + 1 : 1;
      const params: any = {
        page: pageToLoad,
        per_page: pagination.perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      
      // Add date range filter
      if (dateRange.startDate && dateRange.endDate) {
        params.from_date = dateRange.startDate;
        params.to_date = dateRange.endDate;
      }
      
      // Add payment type filter
      if (filterPaymentType !== 'all') {
        params.payment_type = filterPaymentType;
      }
      
      const response = await paymentService.getAll(params);
      let data = response.data || [];
      
      // Client-side search filter (for supplier/reference/processor names)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        data = data.filter((payment: Payment) => {
          const supplierName = payment.supplier?.name?.toLowerCase() || '';
          const referenceNumber = payment.reference_number?.toLowerCase() || '';
          const processorName = payment.user?.name?.toLowerCase() || '';
          return (
            supplierName.includes(query) ||
            referenceNumber.includes(query) ||
            processorName.includes(query)
          );
        });
      }
      
      if (loadMore) {
        pagination.appendItems(data);
      } else {
        pagination.setItems(data);
      }
      
      pagination.setHasMore(data.length >= pagination.perPage);
    } catch (error) {
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      pagination.setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !pagination.isLoadingMore) {
      pagination.loadMore();
      loadPayments(true);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getAll({ per_page: 100, is_active: true });
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPayments();
  };

  const resetForm = () => {
    setFormData({
      supplier_id: null,
      payment_date: new Date().toISOString().split('T')[0],
      amount: '',
      payment_type: 'partial',
      payment_method: 'cash',
      reference_number: '',
      notes: '',
    });
    setErrors({});
    setEditingPayment(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      supplier_id: payment.supplier_id,
      payment_date: payment.payment_date,
      amount: payment.amount.toString(),
      payment_type: payment.payment_type,
      payment_method: payment.payment_method || 'cash',
      reference_number: payment.reference_number || '',
      notes: payment.notes || '',
    });
    setModalVisible(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.payment_date) {
      newErrors.payment_date = 'Payment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreatePaymentRequest = {
        supplier_id: formData.supplier_id!,
        payment_date: formData.payment_date,
        amount: parseFloat(formData.amount),
        payment_type: formData.payment_type,
        payment_method: formData.payment_method || undefined,
        reference_number: formData.reference_number.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      if (editingPayment) {
        const updatePayload: UpdatePaymentRequest = {
          ...payload,
          version: editingPayment.version,
        };
        await paymentService.update(editingPayment.id, updatePayload);
        Alert.alert('Success', 'Payment updated successfully');
      } else {
        await paymentService.create(payload);
        Alert.alert('Success', 'Payment created successfully');
      }

      setModalVisible(false);
      resetForm();
      loadPayments();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save payment'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (payment: Payment) => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentService.delete(payment.id);
              Alert.alert('Success', 'Payment deleted successfully');
              loadPayments();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to delete payment'
              );
            }
          },
        },
      ]
    );
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'advance':
        return '#007AFF';
      case 'partial':
        return '#FF9500';
      case 'full':
        return '#34C759';
      default:
        return '#666';
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const renderPayment = ({ item }: { item: Payment }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEditModal(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{formatDate(item.payment_date)}</Text>
        <View style={[styles.badge, { backgroundColor: getPaymentTypeColor(item.payment_type) }]}>
          <Text style={styles.badgeText}>{getPaymentTypeLabel(item.payment_type)}</Text>
        </View>
      </View>
      
      {item.supplier && (
        <Text style={styles.supplier}>Supplier: {item.supplier.name}</Text>
      )}
      
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Amount: </Text>
        <Text style={styles.amountValue}>Rs. {formatAmount(item.amount)}</Text>
      </View>
      
      {item.payment_method && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>Method: </Text>
          <Text style={styles.value}>{item.payment_method}</Text>
        </View>
      )}
      
      {item.reference_number && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>Reference: </Text>
          <Text style={styles.value}>{item.reference_number}</Text>
        </View>
      )}
      
      {item.user && (
        <Text style={styles.user}>Processed by: {item.user.name}</Text>
      )}
      
      {item.notes && (
        <Text style={styles.notes}>Note: {item.notes}</Text>
      )}
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.count}>{pagination.items.length} loaded</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by supplier, reference, or processor..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>
      
      {/* Date Range Filter */}
      <View style={styles.dateRangeContainer}>
        <DateRangePicker
          label="Filter by Date Range"
          value={dateRange}
          onChange={setDateRange}
        />
        {(dateRange.startDate || dateRange.endDate) && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => setDateRange({ startDate: '', endDate: '' })}
          >
            <Text style={styles.clearFilterText}>Clear Filter</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterPaymentType === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterPaymentType('all')}
        >
          <Text style={[styles.filterButtonText, filterPaymentType === 'all' && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterPaymentType === 'advance' && styles.filterButtonActive]}
          onPress={() => setFilterPaymentType('advance')}
        >
          <Text style={[styles.filterButtonText, filterPaymentType === 'advance' && styles.filterButtonTextActive]}>
            Advance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterPaymentType === 'partial' && styles.filterButtonActive]}
          onPress={() => setFilterPaymentType('partial')}
        >
          <Text style={[styles.filterButtonText, filterPaymentType === 'partial' && styles.filterButtonTextActive]}>
            Partial
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterPaymentType === 'full' && styles.filterButtonActive]}
          onPress={() => setFilterPaymentType('full')}
        >
          <Text style={[styles.filterButtonText, filterPaymentType === 'full' && styles.filterButtonTextActive]}>
            Full
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'payment_date' && styles.sortButtonActive]}
          onPress={() => {
            if (sortBy === 'payment_date') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('payment_date');
              setSortOrder('desc');
            }
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'payment_date' && styles.sortButtonTextActive]}>
            Date {sortBy === 'payment_date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'amount' && styles.sortButtonActive]}
          onPress={() => {
            if (sortBy === 'amount') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('amount');
              setSortOrder('desc');
            }
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'amount' && styles.sortButtonTextActive]}>
            Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'payment_type' && styles.sortButtonActive]}
          onPress={() => {
            if (sortBy === 'payment_type') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('payment_type');
              setSortOrder('asc');
            }
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'payment_type' && styles.sortButtonTextActive]}>
            Type {sortBy === 'payment_type' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Page Size Selector */}
      <View style={styles.pageSizeRow}>
        <Text style={styles.sortLabel}>Items per page:</Text>
        {[25, 50, 100].map((size) => (
          <TouchableOpacity
            key={size}
            style={[styles.pageSizeButton, pagination.perPage === size && styles.sortButtonActive]}
            onPress={() => pagination.setPerPage(size)}
          >
            <Text style={[styles.sortButtonText, pagination.perPage === size && styles.sortButtonTextActive]}>
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <FlatList
        data={pagination.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPayment}
        contentContainerStyle={styles.list}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No payments found</Text>
        }
        ListFooterComponent={
          pagination.isLoadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          ) : null
        }
      />
      <FloatingActionButton onPress={openCreateModal} />
      
      <FormModal
        visible={modalVisible}
        title={editingPayment ? 'Edit Payment' : 'Create Payment'}
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <Picker
          label="Supplier"
          value={formData.supplier_id}
          options={suppliers.map(s => ({ label: s.name, value: s.id }))}
          onValueChange={(value) => setFormData({ ...formData, supplier_id: value as number })}
          placeholder="Select a supplier"
          error={errors.supplier_id}
          required
        />
        <Input
          label="Payment Date"
          value={formData.payment_date}
          onChangeText={(text) => setFormData({ ...formData, payment_date: text })}
          placeholder="YYYY-MM-DD"
          error={errors.payment_date}
          required
        />
        <Input
          label="Amount"
          value={formData.amount}
          onChangeText={(text) => setFormData({ ...formData, amount: text })}
          keyboardType="decimal-pad"
          error={errors.amount}
          required
        />
        <Picker
          label="Payment Type"
          value={formData.payment_type}
          options={PAYMENT_TYPE_OPTIONS}
          onValueChange={(value) => setFormData({ ...formData, payment_type: value as PaymentType })}
          required
        />
        <Picker
          label="Payment Method"
          value={formData.payment_method}
          options={PAYMENT_METHOD_OPTIONS}
          onValueChange={(value) => setFormData({ ...formData, payment_method: value as string })}
        />
        <Input
          label="Reference Number"
          value={formData.reference_number}
          onChangeText={(text) => setFormData({ ...formData, reference_number: text })}
          placeholder="Cheque/Transaction ID"
        />
        <Input
          label="Notes"
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          numberOfLines={3}
        />
        <View style={styles.buttonRow}>
          <Button
            title="Cancel"
            onPress={() => {
              setModalVisible(false);
              resetForm();
            }}
            variant="secondary"
            style={styles.buttonHalf}
          />
          <Button
            title={editingPayment ? 'Update' : 'Create'}
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.buttonHalf}
          />
        </View>
      </FormModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  count: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dateRangeContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  clearFilterButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  clearFilterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  sortContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sortLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sortButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  supplier: {
    fontSize: 15,
    color: '#007AFF',
    marginBottom: 8,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 18,
    color: '#34C759',
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  user: {
    fontSize: 13,
    color: '#999',
    marginTop: 10,
    fontStyle: 'italic',
  },
  notes: {
    fontSize: 13,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  buttonHalf: {
    flex: 1,
  },
  pageSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  pageSizeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 40,
    alignItems: 'center',
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingMoreText: {
    color: '#007AFF',
    fontSize: 14,
  },
});

export default PaymentsScreen;
