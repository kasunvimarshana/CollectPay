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
import { productService, productRateService, Product, ProductRate, CreateProductRateRequest, UpdateProductRateRequest } from '../api/product';
import { FloatingActionButton, FormModal, Input, Button, Picker, DatePicker } from '../components';
import { UNIT_OPTIONS } from '../utils/constants';
import { formatDate, formatDateForInput } from '../utils/formatters';

const ProductRatesScreen = () => {
  const [rates, setRates] = useState<ProductRate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRate, setEditingRate] = useState<ProductRate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProduct, setFilterProduct] = useState<number | undefined>(undefined);
  const [filterUnit, setFilterUnit] = useState<string | undefined>(undefined);
  
  // Form state
  const [formData, setFormData] = useState({
    product_id: 0,
    unit: '',
    rate: '',
    effective_date: '',
    end_date: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRates();
    }, 500);
    return () => clearTimeout(timer);
  }, [filterProduct, filterUnit]);

  const loadData = async () => {
    await Promise.all([loadRates(), loadProducts()]);
  };

  const loadRates = async () => {
    try {
      const params: any = { per_page: 100 };
      if (filterProduct) {
        params.product_id = filterProduct;
      }
      if (filterUnit) {
        params.unit = filterUnit;
      }
      const response = await productRateService.getAll(params);
      setRates(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load product rates');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getAll({ per_page: 100 });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to load products', error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const resetForm = () => {
    setFormData({
      product_id: 0,
      unit: '',
      rate: '',
      effective_date: formatDateForInput(new Date()),
      end_date: '',
    });
    setErrors({});
    setEditingRate(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (rate: ProductRate) => {
    setEditingRate(rate);
    setFormData({
      product_id: rate.product_id,
      unit: rate.unit,
      rate: rate.rate.toString(),
      effective_date: rate.effective_date,
      end_date: rate.end_date || '',
    });
    setModalVisible(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }
    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }
    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      newErrors.rate = 'Valid rate is required';
    }
    if (!formData.effective_date) {
      newErrors.effective_date = 'Effective date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload: CreateProductRateRequest = {
        product_id: formData.product_id,
        unit: formData.unit,
        rate: parseFloat(formData.rate),
        effective_date: formData.effective_date,
        end_date: formData.end_date || undefined,
        is_active: true,
      };

      if (editingRate) {
        await productRateService.update(editingRate.id, {
          ...payload,
          version: editingRate.version,
        });
        Alert.alert('Success', 'Product rate updated successfully');
      } else {
        await productRateService.create(payload);
        Alert.alert('Success', 'Product rate created successfully');
      }

      setModalVisible(false);
      resetForm();
      loadRates();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save product rate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (rate: ProductRate) => {
    Alert.alert(
      'Delete Product Rate',
      `Are you sure you want to delete this rate (${rate.unit} @ Rs. ${rate.rate})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productRateService.delete(rate.id);
              Alert.alert('Success', 'Product rate deleted successfully');
              loadRates();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product rate');
            }
          },
        },
      ]
    );
  };

  const renderRate = ({ item }: { item: ProductRate }) => {
    const product = products.find(p => p.id === item.product_id);
    const isExpired = item.end_date && new Date(item.end_date) < new Date();

    return (
      <TouchableOpacity style={styles.card} onPress={() => openEditModal(item)}>
        <View style={styles.cardHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product?.name || 'Unknown Product'}</Text>
            <Text style={styles.productCode}>Code: {product?.code || 'N/A'}</Text>
          </View>
          <View style={[styles.badge, item.is_active && !isExpired ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={styles.badgeText}>
              {isExpired ? 'Expired' : item.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.rateInfo}>
          <View style={styles.rateRow}>
            <Text style={styles.rateLabel}>Unit:</Text>
            <Text style={styles.rateValue}>{item.unit.toUpperCase()}</Text>
          </View>
          <View style={styles.rateRow}>
            <Text style={styles.rateLabel}>Rate:</Text>
            <Text style={styles.rateAmount}>Rs. {item.rate.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>📅 Effective: {formatDate(item.effective_date)}</Text>
          {item.end_date && (
            <Text style={styles.dateText}>🔚 End: {formatDate(item.end_date)}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const productPickerItems = products.map(p => ({ label: `${p.name} (${p.code})`, value: p.id }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Product Rates</Text>
        <Text style={styles.count}>{rates.length} total</Text>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Product:</Text>
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => {
              // For simplicity, cycling through products
              const currentIndex = products.findIndex(p => p.id === filterProduct);
              const nextIndex = (currentIndex + 1) % (products.length + 1);
              setFilterProduct(nextIndex === products.length ? undefined : products[nextIndex].id);
            }}
          >
            <Text style={styles.filterDropdownText}>
              {filterProduct ? products.find(p => p.id === filterProduct)?.name : 'All Products'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Unit:</Text>
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => {
              const units = ['', ...UNIT_OPTIONS.map(u => u.value)];
              const currentIndex = units.indexOf(filterUnit || '');
              const nextIndex = (currentIndex + 1) % units.length;
              setFilterUnit(units[nextIndex] || undefined);
            }}
          >
            <Text style={styles.filterDropdownText}>
              {filterUnit ? filterUnit.toUpperCase() : 'All Units'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={rates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRate}
        contentContainerStyle={styles.list}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No product rates found</Text>
        }
      />
      <FloatingActionButton onPress={openCreateModal} />
      
      <FormModal
        visible={modalVisible}
        title={editingRate ? 'Edit Product Rate' : 'Create Product Rate'}
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <Picker
          label="Product"
          required
          value={formData.product_id}
          options={productPickerItems}
          onValueChange={(value) => setFormData({ ...formData, product_id: value as number })}
          error={errors.product_id}
          placeholder="Select a product"
        />
        <Picker
          label="Unit"
          required
          value={formData.unit}
          options={UNIT_OPTIONS}
          onValueChange={(value) => setFormData({ ...formData, unit: value as string })}
          error={errors.unit}
          placeholder="Select a unit"
        />
        <Input
          label="Rate"
          value={formData.rate}
          onChangeText={(text) => setFormData({ ...formData, rate: text })}
          keyboardType="decimal-pad"
          error={errors.rate}
          required
          placeholder="0.00"
        />
        <DatePicker
          label="Effective Date"
          value={formData.effective_date}
          onChange={(date) => setFormData({ ...formData, effective_date: date })}
          error={errors.effective_date}
          required
        />
        <DatePicker
          label="End Date (Optional)"
          value={formData.end_date}
          onChange={(date) => setFormData({ ...formData, end_date: date })}
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
            title={editingRate ? 'Update' : 'Create'}
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
  filterContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 80,
  },
  filterDropdown: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
  },
  filterDropdownText: {
    fontSize: 14,
    color: '#333',
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#34C759',
  },
  badgeInactive: {
    backgroundColor: '#FF9500',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rateInfo: {
    marginBottom: 10,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rateLabel: {
    fontSize: 14,
    color: '#666',
  },
  rateValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  rateAmount: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  dateInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
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

export default ProductRatesScreen;
