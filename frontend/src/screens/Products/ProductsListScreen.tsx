import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../services/api';
import { Product } from '../../types';
import { LoadingSpinner, ErrorMessage, Input, Button, Picker } from '../../components';

const ProductsListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async (search: string = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getProducts({
        search: search || undefined,
        per_page: 100,
      });
      setProducts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(searchQuery);
  }, [searchQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(searchQuery);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts(searchQuery);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleEdit(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.code}>{item.code}</Text>
        </View>
        <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{item.is_active ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Default Unit:</Text>
        <Text style={styles.detailValue}>{item.default_unit}</Text>
      </View>
    </TouchableOpacity>
  );

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        onClose={handleFormClose}
      />
    );
  }

  if (loading && products.length === 0) {
    return <LoadingSpinner message="Loading products..." />;
  }

  if (error && products.length === 0) {
    return <ErrorMessage message={error} onRetry={() => fetchProducts(searchQuery)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#95a5a6"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

// Product Form Component
interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || '',
    description: product?.description || '',
    code: product?.code || '',
    default_unit: product?.default_unit || 'kg',
    is_active: product?.is_active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const unitOptions = [
    { label: 'Kilogram (kg)', value: 'kg' },
    { label: 'Gram (g)', value: 'g' },
    { label: 'Liter (l)', value: 'l' },
    { label: 'Milliliter (ml)', value: 'ml' },
    { label: 'Unit', value: 'unit' },
    { label: 'Piece (pcs)', value: 'pcs' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    }

    if (!formData.code || formData.code.trim() === '') {
      newErrors.code = 'Code is required';
    }

    if (!formData.default_unit) {
      newErrors.default_unit = 'Default unit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      if (product) {
        await apiService.updateProduct(product.id, formData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await apiService.createProduct(formData);
        Alert.alert('Success', 'Product created successfully');
      }
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!product) return;

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteProduct(product.id);
              Alert.alert('Success', 'Product deleted successfully');
              onClose();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>
          {product ? 'Edit Product' : 'New Product'}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContent}>
        <Input
          label="Product Name *"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          error={errors.name}
          placeholder="Enter product name"
        />

        <Input
          label="Product Code *"
          value={formData.code}
          onChangeText={(text) => setFormData({ ...formData, code: text })}
          error={errors.code}
          placeholder="Enter product code"
        />

        <Input
          label="Description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Enter description"
          multiline
          numberOfLines={3}
        />

        <Picker
          label="Default Unit *"
          value={formData.default_unit}
          options={unitOptions}
          onValueChange={(value) => setFormData({ ...formData, default_unit: value })}
          error={errors.default_unit}
        />

        <Picker
          label="Status"
          value={formData.is_active}
          options={[
            { label: 'Active', value: true },
            { label: 'Inactive', value: false },
          ]}
          onValueChange={(value) => setFormData({ ...formData, is_active: value })}
        />

        <View style={styles.formButtons}>
          <Button
            title={product ? 'Update' : 'Create'}
            onPress={handleSave}
            loading={saving}
          />

          {product && (
            <Button
              title="Delete"
              variant="danger"
              onPress={handleDelete}
              disabled={saving}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#dce1e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
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
    marginBottom: 10,
  },
  cardTitleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  code: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'monospace',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#d4edda',
  },
  badgeInactive: {
    backgroundColor: '#f8d7da',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  detailLabel: {
    fontSize: 14,
    color: '#95a5a6',
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    fontSize: 28,
    color: '#7f8c8d',
  },
  formContent: {
    padding: 20,
  },
  formButtons: {
    marginTop: 20,
  },
});

export default ProductsListScreen;
