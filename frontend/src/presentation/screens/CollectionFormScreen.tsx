/**
 * Collection Form Screen
 * Create or edit collection entry with rate calculation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { Supplier } from '../../domain/entities/Supplier';
import { Product, Rate } from '../../domain/entities/Product';

interface CollectionFormData {
  supplier_id: string;
  product_id: string;
  collection_date: string;
  quantity: string;
  unit: string;
  notes: string;
}

export const CollectionFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const collectionId = (route.params as any)?.collectionId;
  const isEditMode = !!collectionId;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentRate, setCurrentRate] = useState<Rate | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  const [formData, setFormData] = useState<CollectionFormData>({
    supplier_id: '',
    product_id: '',
    collection_date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: 'kg',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CollectionFormData, string>>>({});

  useEffect(() => {
    loadSuppliers();
    loadProducts();
    if (isEditMode) {
      loadCollection();
    }
  }, [collectionId]);

  useEffect(() => {
    if (formData.product_id) {
      loadCurrentRate(formData.product_id);
    }
  }, [formData.product_id]);

  useEffect(() => {
    calculateAmount();
  }, [formData.quantity, currentRate]);

  const loadSuppliers = async () => {
    try {
      const response = await apiClient.get<{data: Supplier[]}>('/suppliers');
      if (response.success && response.data) {
        // Handle paginated response: response.data might be {data: [], ...pagination}
        const suppliers = Array.isArray(response.data) 
          ? response.data 
          : ((response.data as any).data || response.data);
        setSuppliers((suppliers as Supplier[]).filter((s: Supplier) => s.is_active));
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await apiClient.get<{data: Product[]}>('/products');
      if (response.success && response.data) {
        // Handle paginated response: response.data might be {data: [], ...pagination}
        const products = Array.isArray(response.data) 
          ? response.data 
          : ((response.data as any).data || response.data);
        setProducts((products as Product[]).filter((p: Product) => p.is_active));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCollection = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/collections/${collectionId}`);
      if (response.success && response.data) {
        const collection = response.data;
        setFormData({
          supplier_id: collection.supplier_id?.toString() || '',
          product_id: collection.product_id?.toString() || '',
          collection_date: collection.collection_date?.split('T')[0] || '',
          quantity: collection.quantity?.toString() || '',
          unit: collection.unit || 'kg',
          notes: collection.notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading collection:', error);
      Alert.alert('Error', 'Failed to load collection details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentRate = async (productId: string) => {
    try {
      const response = await apiClient.get<Rate>(`/products/${productId}/current-rate`);
      if (response.success && response.data) {
        setCurrentRate(response.data as Rate);
      } else {
        setCurrentRate(null);
        Alert.alert('Warning', 'No current rate found for this product');
      }
    } catch (error) {
      console.error('Error loading current rate:', error);
      setCurrentRate(null);
    }
  };

  const calculateAmount = () => {
    if (formData.quantity && currentRate) {
      const qty = parseFloat(formData.quantity);
      const rate = parseFloat(currentRate.rate.toString());
      if (!isNaN(qty) && !isNaN(rate)) {
        setCalculatedAmount(qty * rate);
      } else {
        setCalculatedAmount(0);
      }
    } else {
      setCalculatedAmount(0);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CollectionFormData, string>> = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }

    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }

    if (!formData.collection_date) {
      newErrors.collection_date = 'Collection date is required';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    if (!currentRate) {
      Alert.alert('Error', 'No current rate available for the selected product');
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        supplier_id: parseInt(formData.supplier_id),
        product_id: parseInt(formData.product_id),
        collection_date: formData.collection_date,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        notes: formData.notes || null,
      };

      if (isEditMode) {
        await apiClient.put(`/collections/${collectionId}`, submitData);
        Alert.alert('Success', 'Collection updated successfully');
      } else {
        await apiClient.post('/collections', submitData);
        Alert.alert('Success', 'Collection created successfully');
      }

      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving collection:', error);
      const message = error.response?.data?.message || 'Failed to save collection';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof CollectionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading && isEditMode) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading collection...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditMode ? 'Edit Collection' : 'New Collection'}
        </Text>
      </View>

      <View style={styles.form}>
        {/* Supplier Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Supplier *</Text>
          <View style={[styles.input, errors.supplier_id && styles.inputError]}>
            <Text style={styles.selectText}>
              {formData.supplier_id 
                ? suppliers.find(s => s.id.toString() === formData.supplier_id)?.name || 'Select supplier'
                : 'Select supplier'}
            </Text>
          </View>
          {errors.supplier_id && <Text style={styles.errorText}>{errors.supplier_id}</Text>}
          
          {/* Simple supplier list */}
          {suppliers.length > 0 && (
            <View style={styles.optionsList}>
              {suppliers.map((supplier) => (
                <TouchableOpacity
                  key={supplier.id}
                  style={[
                    styles.optionItem,
                    formData.supplier_id === supplier.id.toString() && styles.optionItemSelected
                  ]}
                  onPress={() => updateField('supplier_id', supplier.id.toString())}
                >
                  <Text style={styles.optionText}>{supplier.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Product Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product *</Text>
          <View style={[styles.input, errors.product_id && styles.inputError]}>
            <Text style={styles.selectText}>
              {formData.product_id 
                ? products.find(p => p.id.toString() === formData.product_id)?.name || 'Select product'
                : 'Select product'}
            </Text>
          </View>
          {errors.product_id && <Text style={styles.errorText}>{errors.product_id}</Text>}
          
          {/* Simple product list */}
          {products.length > 0 && (
            <View style={styles.optionsList}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.optionItem,
                    formData.product_id === product.id.toString() && styles.optionItemSelected
                  ]}
                  onPress={() => updateField('product_id', product.id.toString())}
                >
                  <Text style={styles.optionText}>{product.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Current Rate Display */}
        {currentRate && (
          <View style={styles.rateInfo}>
            <Text style={styles.rateInfoText}>
              Current Rate: {currentRate.rate} per {currentRate.unit}
            </Text>
          </View>
        )}

        {/* Collection Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Collection Date *</Text>
          <TextInput
            style={[styles.input, errors.collection_date && styles.inputError]}
            placeholder="YYYY-MM-DD"
            value={formData.collection_date}
            onChangeText={(value) => updateField('collection_date', value)}
          />
          {errors.collection_date && (
            <Text style={styles.errorText}>{errors.collection_date}</Text>
          )}
        </View>

        {/* Quantity */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantity *</Text>
          <TextInput
            style={[styles.input, errors.quantity && styles.inputError]}
            placeholder="Enter quantity"
            value={formData.quantity}
            onChangeText={(value) => updateField('quantity', value)}
            keyboardType="decimal-pad"
          />
          {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
        </View>

        {/* Unit */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Unit *</Text>
          <TextInput
            style={[styles.input, errors.unit && styles.inputError]}
            placeholder="e.g., kg, g"
            value={formData.unit}
            onChangeText={(value) => updateField('unit', value)}
          />
          {errors.unit && <Text style={styles.errorText}>{errors.unit}</Text>}
        </View>

        {/* Calculated Amount */}
        {calculatedAmount > 0 && (
          <View style={styles.amountInfo}>
            <Text style={styles.amountLabel}>Calculated Amount:</Text>
            <Text style={styles.amountValue}>${calculatedAmount.toFixed(2)}</Text>
          </View>
        )}

        {/* Notes */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter notes (optional)"
            value={formData.notes}
            onChangeText={(value) => updateField('notes', value)}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Update Collection' : 'Create Collection'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#f44336',
  },
  selectText: {
    color: '#333',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 4,
  },
  optionsList: {
    marginTop: 8,
    maxHeight: 200,
  },
  optionItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 4,
  },
  optionItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007bff',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  rateInfo: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  rateInfoText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  amountInfo: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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
});
