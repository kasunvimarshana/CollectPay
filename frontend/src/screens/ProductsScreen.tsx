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
import { productService, Product, CreateProductRequest, UpdateProductRequest } from '../api/product';
import { FloatingActionButton, FormModal, Input, Button, Picker } from '../components';
import { UNIT_OPTIONS } from '../utils/constants';

const ProductsScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'name' | 'code'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    default_unit: 'kg',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProducts();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filterActive]);

  // Reload when sort changes
  useEffect(() => {
    if (!isLoading) {
      loadProducts();
    }
  }, [sortBy, sortOrder]);

  const loadProducts = async () => {
    try {
      const params: any = { per_page: 50 };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (filterActive !== undefined) {
        params.is_active = filterActive;
      }
      const response = await productService.getAll(params);
      let data = response.data || [];
      
      // Client-side sorting
      data = data.sort((a: Product, b: Product) => {
        let compareA, compareB;
        
        switch (sortBy) {
          case 'name':
            compareA = a.name.toLowerCase();
            compareB = b.name.toLowerCase();
            break;
          case 'code':
            compareA = a.code.toLowerCase();
            compareB = b.code.toLowerCase();
            break;
        }
        
        if (sortOrder === 'asc') {
          return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
        } else {
          return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
        }
      });
      
      setProducts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProducts();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      default_unit: 'kg',
    });
    setErrors({});
    setEditingProduct(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      description: product.description || '',
      default_unit: product.default_unit,
    });
    setModalVisible(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }
    if (!formData.default_unit) {
      newErrors.default_unit = 'Default unit is required';
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
      const payload: CreateProductRequest = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim() || undefined,
        default_unit: formData.default_unit,
        supported_units: [formData.default_unit], // Can be expanded to support multiple units
      };

      if (editingProduct) {
        const updatePayload: UpdateProductRequest = {
          ...payload,
          version: editingProduct.version,
        };
        await productService.update(editingProduct.id, updatePayload);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await productService.create(payload);
        Alert.alert('Success', 'Product created successfully');
      }

      setModalVisible(false);
      resetForm();
      loadProducts();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save product'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.delete(product.id);
              Alert.alert('Success', 'Product deleted successfully');
              loadProducts();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to delete product'
              );
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEditModal(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      <Text style={styles.code}>Code: {item.code}</Text>
      {item.description && <Text style={styles.description}>{item.description}</Text>}
      <View style={styles.unitInfo}>
        <Text style={styles.unitLabel}>Default Unit: </Text>
        <Text style={styles.unitValue}>{item.default_unit}</Text>
      </View>
      {item.supported_units && item.supported_units.length > 0 && (
        <View style={styles.unitInfo}>
          <Text style={styles.unitLabel}>Supported Units: </Text>
          <Text style={styles.unitValue}>{item.supported_units.join(', ')}</Text>
        </View>
      )}
      {item.rates && item.rates.length > 0 && (
        <View style={styles.rateInfo}>
          <Text style={styles.rateLabel}>Latest Rates:</Text>
          {item.rates.slice(0, 3).map((rate) => (
            <Text key={rate.id} style={styles.rateText}>
              {rate.unit}: {rate.rate} (from {rate.effective_date})
            </Text>
          ))}
        </View>
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
        <Text style={styles.title}>Products</Text>
        <Text style={styles.count}>{products.length} total</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or code..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>
      
      {/* Filter and Sort */}
      <View style={styles.controlsContainer}>
        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, filterActive === undefined && styles.filterButtonActive]}
            onPress={() => setFilterActive(undefined)}
          >
            <Text style={[styles.filterButtonText, filterActive === undefined && styles.filterButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterActive === true && styles.filterButtonActive]}
            onPress={() => setFilterActive(true)}
          >
            <Text style={[styles.filterButtonText, filterActive === true && styles.filterButtonTextActive]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterActive === false && styles.filterButtonActive]}
            onPress={() => setFilterActive(false)}
          >
            <Text style={[styles.filterButtonText, filterActive === false && styles.filterButtonTextActive]}>
              Inactive
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Sort Options */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort:</Text>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
            onPress={() => {
              if (sortBy === 'name') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy('name');
                setSortOrder('asc');
              }
            }}
          >
            <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'code' && styles.sortButtonActive]}
            onPress={() => {
              if (sortBy === 'code') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy('code');
                setSortOrder('asc');
              }
            }}
          >
            <Text style={[styles.sortButtonText, sortBy === 'code' && styles.sortButtonTextActive]}>
              Code {sortBy === 'code' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products found</Text>
        }
      />
      <FloatingActionButton onPress={openCreateModal} />
      
      <FormModal
        visible={modalVisible}
        title={editingProduct ? 'Edit Product' : 'Create Product'}
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <Input
          label="Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          error={errors.name}
          required
        />
        <Input
          label="Code"
          value={formData.code}
          onChangeText={(text) => setFormData({ ...formData, code: text })}
          error={errors.code}
          required
        />
        <Input
          label="Description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={3}
        />
        <Picker
          label="Default Unit"
          value={formData.default_unit}
          options={UNIT_OPTIONS}
          onValueChange={(value) => setFormData({ ...formData, default_unit: value as string })}
          error={errors.default_unit}
          required
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
            title={editingProduct ? 'Update' : 'Create'}
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
  controlsContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
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
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  code: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 5,
  },
  unitInfo: {
    flexDirection: 'row',
    marginTop: 5,
  },
  unitLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  unitValue: {
    fontSize: 14,
    color: '#333',
  },
  rateInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  rateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  rateText: {
    fontSize: 13,
    color: '#34C759',
    marginLeft: 10,
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

export default ProductsScreen;
