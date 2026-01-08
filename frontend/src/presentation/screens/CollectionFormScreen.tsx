/**
 * Collection Form Screen
 * Create or edit collection entry with rate calculation
 */

import React, { useState, useEffect } from 'react';
import THEME from '../../core/constants/theme';
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
import { Product, Rate } from '../../domain/entities/Product';
import { DateTimePicker, SearchableSelector } from '../components';

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
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading collection...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + THEME.spacing.lg }}>
      <View style={[styles.header, { paddingTop: insets.top + THEME.spacing.base }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditMode ? 'Edit Collection' : 'New Collection'}
        </Text>
      </View>

      <View style={styles.form}>
        {/* Supplier Selection */}
        <SearchableSelector
          label="Supplier *"
          placeholder="Select supplier"
          value={formData.supplier_id}
          onSelect={(value, option) => updateField('supplier_id', value)}
          endpoint="/suppliers"
          error={errors.supplier_id}
          queryParams={{ is_active: 1 }}
        />

        {/* Product Selection */}
        <SearchableSelector
          label="Product *"
          placeholder="Select product"
          value={formData.product_id}
          onSelect={(value, option) => updateField('product_id', value)}
          endpoint="/products"
          error={errors.product_id}
          queryParams={{ is_active: 1 }}
        />

        {/* Current Rate Display */}
        {currentRate && (
          <View style={styles.rateInfo}>
            <Text style={styles.rateInfoText}>
              Current Rate: {currentRate.rate} per {currentRate.unit}
            </Text>
          </View>
        )}

        {/* Collection Date */}
        <DateTimePicker
          label="Collection Date *"
          value={formData.collection_date}
          onChange={(value) => updateField('collection_date', value)}
          mode="date"
          placeholder="Select collection date"
          error={errors.collection_date}
        />

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
            <ActivityIndicator color={THEME.colors.white} />
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
    backgroundColor: THEME.colors.background,
  },
  header: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backButton: {
    marginBottom: THEME.spacing.sm,
  },
  backButtonText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.primary,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  form: {
    padding: THEME.spacing.base,
  },
  formGroup: {
    marginBottom: THEME.spacing.lg,
  },
  label: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.sm,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
  },
  inputError: {
    borderColor: THEME.colors.error,
  },
  selectText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: THEME.colors.error,
    fontSize: THEME.typography.fontSize.base,
    marginTop: 4,
  },
  optionsList: {
    marginTop: 8,
    maxHeight: 200,
  },
  optionItem: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: 4,
  },
  optionItemSelected: {
    backgroundColor: THEME.colors.gray100,
    borderColor: THEME.colors.primary,
  },
  optionText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
  },
  rateInfo: {
    backgroundColor: THEME.colors.gray100,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.base,
  },
  rateInfoText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.success,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  amountInfo: {
    backgroundColor: THEME.colors.gray100,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
  },
  amountValue: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.primary,
  },
  submitButton: {
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
    marginTop: THEME.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
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
});
