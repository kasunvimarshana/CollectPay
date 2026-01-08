/**
 * Rate Form Screen
 * Create or edit rate information
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
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { Product } from '../../domain/entities/Product';
import DateTimePicker from '@react-native-community/datetimepicker';

interface RateFormData {
  product_id: number | null;
  rate: string;
  unit: string;
  effective_from: string;
  effective_to: string;
  is_active: boolean;
}

export const RateFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const rateId = (route.params as any)?.rateId;
  const isEditMode = !!rateId;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<{
    show: boolean;
    field: 'effective_from' | 'effective_to' | null;
  }>({ show: false, field: null });
  
  const [formData, setFormData] = useState<RateFormData>({
    product_id: null,
    rate: '',
    unit: 'kg',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RateFormData, string>>>({});

  useEffect(() => {
    loadProducts();
    if (isEditMode) {
      loadRate();
    }
  }, [rateId]);

  const loadProducts = async () => {
    try {
      const response = await apiClient.get<any>('/products?per_page=100');
      if (response.success && response.data) {
        const productData = response.data.data || response.data;
        setProducts(productData);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    }
  };

  const loadRate = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/rates/${rateId}`);
      if (response.success && response.data) {
        const rate = response.data;
        setFormData({
          product_id: rate.product_id,
          rate: String(rate.rate),
          unit: rate.unit || 'kg',
          effective_from: rate.effective_from?.split('T')[0] || '',
          effective_to: rate.effective_to?.split('T')[0] || '',
          is_active: rate.is_active ?? true,
        });
        
        // Set selected product
        const product = products.find(p => p.id === rate.product_id);
        if (product) {
          setSelectedProduct(product);
        } else if (rate.product) {
          setSelectedProduct(rate.product);
        }
      }
    } catch (error) {
      console.error('Error loading rate:', error);
      Alert.alert('Error', 'Failed to load rate details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RateFormData, string>> = {};

    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }

    if (!formData.rate.trim()) {
      newErrors.rate = 'Rate is required';
    } else if (isNaN(Number(formData.rate)) || Number(formData.rate) <= 0) {
      newErrors.rate = 'Rate must be a positive number';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.effective_from) {
      newErrors.effective_from = 'Effective from date is required';
    }

    if (formData.effective_to && formData.effective_from) {
      const fromDate = new Date(formData.effective_from);
      const toDate = new Date(formData.effective_to);
      if (toDate <= fromDate) {
        newErrors.effective_to = 'Effective to date must be after effective from date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        product_id: formData.product_id,
        rate: Number(formData.rate),
        unit: formData.unit,
        effective_from: formData.effective_from,
        effective_to: formData.effective_to || null,
        is_active: formData.is_active,
      };
      
      if (isEditMode) {
        await apiClient.put(`/rates/${rateId}`, submitData);
        Alert.alert('Success', 'Rate updated successfully');
      } else {
        await apiClient.post('/rates', submitData);
        Alert.alert('Success', 'Rate created successfully');
      }
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving rate:', error);
      const message = error.response?.data?.message || 'Failed to save rate';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof RateFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker({ show: false, field: null });
    
    if (event.type === 'set' && selectedDate && showDatePicker.field) {
      const dateString = selectedDate.toISOString().split('T')[0];
      updateField(showDatePicker.field, dateString);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    updateField('product_id', product.id);
    updateField('unit', product.base_unit);
    setShowProductPicker(false);
  };

  if (loading && isEditMode) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading rate...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + THEME.spacing.base }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEditMode ? 'Edit Rate' : 'Create Rate'}</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + THEME.spacing.lg }}
      >
        {/* Product Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product *</Text>
          <TouchableOpacity
            style={[styles.input, errors.product_id && styles.inputError]}
            onPress={() => setShowProductPicker(!showProductPicker)}
          >
            <Text style={selectedProduct ? styles.inputText : styles.inputPlaceholder}>
              {selectedProduct ? selectedProduct.name : 'Select Product'}
            </Text>
          </TouchableOpacity>
          {errors.product_id && <Text style={styles.errorText}>{errors.product_id}</Text>}
          
          {showProductPicker && (
            <View style={styles.pickerContainer}>
              <ScrollView style={styles.pickerScroll}>
                {products.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.pickerItem}
                    onPress={() => handleProductSelect(product)}
                  >
                    <Text style={styles.pickerItemText}>{product.name}</Text>
                    <Text style={styles.pickerItemSubtext}>{product.code}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Rate */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Rate *</Text>
          <TextInput
            style={[styles.input, errors.rate && styles.inputError]}
            value={formData.rate}
            onChangeText={(value) => updateField('rate', value)}
            placeholder="Enter rate (e.g., 250.00)"
            keyboardType="decimal-pad"
            placeholderTextColor={THEME.colors.textSecondary}
          />
          {errors.rate && <Text style={styles.errorText}>{errors.rate}</Text>}
        </View>

        {/* Unit */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Unit *</Text>
          <TextInput
            style={[styles.input, errors.unit && styles.inputError]}
            value={formData.unit}
            onChangeText={(value) => updateField('unit', value)}
            placeholder="Unit (e.g., kg, g, lbs)"
            placeholderTextColor={THEME.colors.textSecondary}
          />
          {errors.unit && <Text style={styles.errorText}>{errors.unit}</Text>}
          {selectedProduct && (
            <Text style={styles.helperText}>
              Supported units: {selectedProduct.supported_units?.join(', ') || selectedProduct.base_unit}
            </Text>
          )}
        </View>

        {/* Effective From */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Effective From *</Text>
          <TouchableOpacity
            style={[styles.input, errors.effective_from && styles.inputError]}
            onPress={() => setShowDatePicker({ show: true, field: 'effective_from' })}
          >
            <Text style={styles.inputText}>
              {formData.effective_from || 'Select date'}
            </Text>
          </TouchableOpacity>
          {errors.effective_from && <Text style={styles.errorText}>{errors.effective_from}</Text>}
        </View>

        {/* Effective To */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Effective To (Optional)</Text>
          <TouchableOpacity
            style={[styles.input, errors.effective_to && styles.inputError]}
            onPress={() => setShowDatePicker({ show: true, field: 'effective_to' })}
          >
            <Text style={formData.effective_to ? styles.inputText : styles.inputPlaceholder}>
              {formData.effective_to || 'No end date (ongoing)'}
            </Text>
          </TouchableOpacity>
          {errors.effective_to && <Text style={styles.errorText}>{errors.effective_to}</Text>}
          {formData.effective_to && (
            <TouchableOpacity onPress={() => updateField('effective_to', '')}>
              <Text style={styles.clearText}>Clear end date</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Is Active */}
        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Active</Text>
            <Switch
              value={formData.is_active}
              onValueChange={(value) => updateField('is_active', value)}
              trackColor={{ false: THEME.colors.border, true: THEME.colors.primary }}
              thumbColor={THEME.colors.white}
            />
          </View>
          <Text style={styles.helperText}>
            Inactive rates won't be used in calculations
          </Text>
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
              {isEditMode ? 'Update Rate' : 'Create Rate'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker.show && showDatePicker.field && (
        <DateTimePicker
          value={
            formData[showDatePicker.field]
              ? new Date(formData[showDatePicker.field])
              : new Date()
          }
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
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
  content: {
    flex: 1,
    padding: THEME.spacing.base,
  },
  formGroup: {
    marginBottom: THEME.spacing.lg,
  },
  label: {
    fontSize: THEME.typography.fontSize.base,
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
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    minHeight: 48,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
  },
  inputPlaceholder: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
  },
  inputError: {
    borderColor: THEME.colors.error,
  },
  errorText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.error,
    marginTop: THEME.spacing.xs,
  },
  helperText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
  },
  clearText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.primary,
    marginTop: THEME.spacing.xs,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.base,
    marginTop: THEME.spacing.sm,
    maxHeight: 200,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    padding: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  pickerItemText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  pickerItemSubtext: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
    marginTop: THEME.spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  centerContainer: {
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
