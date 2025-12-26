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
import { collectionService, Collection, CreateCollectionRequest, UpdateCollectionRequest } from '../api/collection';
import { supplierService, Supplier } from '../api/supplier';
import { productService, Product } from '../api/product';
import { formatDate, formatAmount } from '../utils/formatters';
import { FloatingActionButton, FormModal, Input, Button, Picker } from '../components';
import DateRangePicker, { DateRange } from '../components/DateRangePicker';
import { UNIT_OPTIONS } from '../utils/constants';

const CollectionsScreen = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'supplier' | 'product' | 'amount' | 'quantity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    supplier_id: null as number | null,
    product_id: null as number | null,
    collection_date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: 'kg',
    notes: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCollections();
    loadSuppliers();
    loadProducts();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Trigger filtering
      filterAndSortCollections();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, dateRange]);
  
  // Re-sort when sort changes or collections change
  useEffect(() => {
    if (!isLoading && collections.length > 0) {
      filterAndSortCollections();
    }
  }, [sortBy, sortOrder, collections]);

  const filterAndSortCollections = () => {
    let filtered = [...(collections as Collection[])];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((collection) => {
        const supplierName = collection.supplier?.name?.toLowerCase() || '';
        const productName = collection.product?.name?.toLowerCase() || '';
        const collectorName = collection.user?.name?.toLowerCase() || '';
        return (
          supplierName.includes(query) ||
          productName.includes(query) ||
          collectorName.includes(query)
        );
      });
    }
    
    // Apply date range filter
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((collection) => {
        const collectionDate = collection.collection_date;
        return collectionDate >= dateRange.startDate && collectionDate <= dateRange.endDate;
      });
    }
    
    // Apply sorting
    filtered.sort((a: Collection, b: Collection) => {
      let compareA, compareB;
      
      switch (sortBy) {
        case 'date':
          compareA = new Date(a.collection_date).getTime();
          compareB = new Date(b.collection_date).getTime();
          break;
        case 'supplier':
          compareA = a.supplier?.name?.toLowerCase() || '';
          compareB = b.supplier?.name?.toLowerCase() || '';
          break;
        case 'product':
          compareA = a.product?.name?.toLowerCase() || '';
          compareB = b.product?.name?.toLowerCase() || '';
          break;
        case 'amount':
          compareA = typeof a.total_amount === 'number' ? a.total_amount : 0;
          compareB = typeof b.total_amount === 'number' ? b.total_amount : 0;
          break;
        case 'quantity':
          compareA = typeof a.quantity === 'number' ? a.quantity : 0;
          compareB = typeof b.quantity === 'number' ? b.quantity : 0;
          break;
        default:
          compareA = 0;
          compareB = 0;
      }
      
      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });
    
    setFilteredCollections(filtered);
  };

  const loadCollections = async () => {
    try {
      const response = await collectionService.getAll({ per_page: 50 });
      const data = response.data || [];
      setCollections(data);
      setFilteredCollections(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load collections');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
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

  const loadProducts = async () => {
    try {
      const response = await productService.getAll({ per_page: 100, is_active: true });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCollections();
  };

  const resetForm = () => {
    setFormData({
      supplier_id: null,
      product_id: null,
      collection_date: new Date().toISOString().split('T')[0],
      quantity: '',
      unit: 'kg',
      notes: '',
    });
    setErrors({});
    setEditingCollection(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      supplier_id: collection.supplier_id,
      product_id: collection.product_id,
      collection_date: collection.collection_date,
      quantity: collection.quantity.toString(),
      unit: collection.unit,
      notes: collection.notes || '',
    });
    setModalVisible(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }
    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!formData.collection_date) {
      newErrors.collection_date = 'Collection date is required';
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
      const payload: CreateCollectionRequest = {
        supplier_id: formData.supplier_id!,
        product_id: formData.product_id!,
        collection_date: formData.collection_date,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        notes: formData.notes.trim() || undefined,
      };

      if (editingCollection) {
        const updatePayload: UpdateCollectionRequest = {
          ...payload,
          version: editingCollection.version,
        };
        await collectionService.update(editingCollection.id, updatePayload);
        Alert.alert('Success', 'Collection updated successfully');
      } else {
        await collectionService.create(payload);
        Alert.alert('Success', 'Collection created successfully');
      }

      setModalVisible(false);
      resetForm();
      loadCollections();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save collection'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (collection: Collection) => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await collectionService.delete(collection.id);
              Alert.alert('Success', 'Collection deleted successfully');
              loadCollections();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to delete collection'
              );
            }
          },
        },
      ]
    );
  };

  const renderCollection = ({ item }: { item: Collection }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEditModal(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{formatDate(item.collection_date)}</Text>
        <Text style={styles.amount}>Rs. {formatAmount(item.total_amount)}</Text>
      </View>
      
      {item.supplier && (
        <Text style={styles.supplier}>Supplier: {item.supplier.name}</Text>
      )}
      
      {item.product && (
        <Text style={styles.product}>Product: {item.product.name}</Text>
      )}
      
      <View style={styles.quantityRow}>
        <Text style={styles.label}>Quantity: </Text>
        <Text style={styles.value}>{item.quantity} {item.unit}</Text>
      </View>
      
      <View style={styles.quantityRow}>
        <Text style={styles.label}>Rate: </Text>
        <Text style={styles.value}>Rs. {formatAmount(item.rate_applied)} per {item.unit}</Text>
      </View>
      
      {item.user && (
        <Text style={styles.collector}>Collected by: {item.user.name}</Text>
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
        <Text style={styles.title}>Collections</Text>
        <Text style={styles.count}>{filteredCollections.length} total</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by supplier, product, or collector..."
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
      
      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
          onPress={() => {
            if (sortBy === 'date') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('date');
              setSortOrder('desc');
            }
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'date' && styles.sortButtonTextActive]}>
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'supplier' && styles.sortButtonActive]}
          onPress={() => {
            if (sortBy === 'supplier') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('supplier');
              setSortOrder('asc');
            }
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'supplier' && styles.sortButtonTextActive]}>
            Supplier {sortBy === 'supplier' && (sortOrder === 'asc' ? '↑' : '↓')}
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
      </View>
      
      <FlatList
        data={filteredCollections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCollection}
        contentContainerStyle={styles.list}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No collections found</Text>
        }
      />
      <FloatingActionButton onPress={openCreateModal} />
      
      <FormModal
        visible={modalVisible}
        title={editingCollection ? 'Edit Collection' : 'Create Collection'}
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
        <Picker
          label="Product"
          value={formData.product_id}
          options={products.map(p => ({ label: p.name, value: p.id }))}
          onValueChange={(value) => setFormData({ ...formData, product_id: value as number })}
          placeholder="Select a product"
          error={errors.product_id}
          required
        />
        <Input
          label="Collection Date"
          value={formData.collection_date}
          onChangeText={(text) => setFormData({ ...formData, collection_date: text })}
          placeholder="YYYY-MM-DD"
          error={errors.collection_date}
          required
        />
        <Input
          label="Quantity"
          value={formData.quantity}
          onChangeText={(text) => setFormData({ ...formData, quantity: text })}
          keyboardType="decimal-pad"
          error={errors.quantity}
          required
        />
        <Picker
          label="Unit"
          value={formData.unit}
          options={UNIT_OPTIONS}
          onValueChange={(value) => setFormData({ ...formData, unit: value as string })}
          required
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
            title={editingCollection ? 'Update' : 'Create'}
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
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  supplier: {
    fontSize: 15,
    color: '#007AFF',
    marginBottom: 5,
    fontWeight: '600',
  },
  product: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
  },
  quantityRow: {
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
  collector: {
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
});

export default CollectionsScreen;
