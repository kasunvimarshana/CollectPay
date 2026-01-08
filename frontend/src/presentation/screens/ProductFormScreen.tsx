/**
 * Product Form Screen
 * Create or edit product information
 */

import React, { useState, useEffect } from 'react';
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
import { ScreenHeader } from '../components';
import THEME from '../../core/constants/theme';

interface ProductFormData {
  name: string;
  code: string;
  description: string;
  base_unit: string;
  supported_units: string;
  is_active: boolean;
}

export const ProductFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const productId = (route.params as any)?.productId;
  const isEditMode = !!productId;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    code: '',
    description: '',
    base_unit: 'kg',
    supported_units: 'kg,g',
    is_active: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  useEffect(() => {
    if (isEditMode) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/products/${productId}`);
      if (response.success && response.data) {
        const product = response.data;
        setFormData({
          name: product.name || '',
          code: product.code || '',
          description: product.description || '',
          base_unit: product.base_unit || 'kg',
          supported_units: Array.isArray(product.supported_units) 
            ? product.supported_units.join(',') 
            : (product.supported_units || 'kg,g'),
          is_active: product.is_active ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }

    if (!formData.base_unit.trim()) {
      newErrors.base_unit = 'Base unit is required';
    }

    if (!formData.supported_units.trim()) {
      newErrors.supported_units = 'Supported units are required';
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
        ...formData,
        supported_units: formData.supported_units.split(',').map(u => u.trim()).filter(u => u),
      };

      if (isEditMode) {
        await apiClient.put(`/products/${productId}`, submitData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await apiClient.post('/products', submitData);
        Alert.alert('Success', 'Product created successfully');
      }

      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving product:', error);
      const message = error.response?.data?.message || 'Failed to save product';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading && isEditMode) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + THEME.spacing.lg }}>
      <ScreenHeader 
        title={isEditMode ? 'Edit Product' : 'Add Product'}
        showBackButton={true}
        variant="light"
      />

      <View style={styles.form}>
        {/* Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter product name"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Code */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Code *</Text>
          <TextInput
            style={[styles.input, errors.code && styles.inputError]}
            placeholder="Enter product code"
            value={formData.code}
            onChangeText={(value) => updateField('code', value)}
          />
          {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter description"
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Base Unit */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Base Unit *</Text>
          <TextInput
            style={[styles.input, errors.base_unit && styles.inputError]}
            placeholder="e.g., kg, liters"
            value={formData.base_unit}
            onChangeText={(value) => updateField('base_unit', value)}
          />
          {errors.base_unit && <Text style={styles.errorText}>{errors.base_unit}</Text>}
        </View>

        {/* Supported Units */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Supported Units * (comma-separated)</Text>
          <TextInput
            style={[styles.input, errors.supported_units && styles.inputError]}
            placeholder="e.g., kg,g,mt"
            value={formData.supported_units}
            onChangeText={(value) => updateField('supported_units', value)}
          />
          {errors.supported_units && (
            <Text style={styles.errorText}>{errors.supported_units}</Text>
          )}
          <Text style={styles.helpText}>
            Enter units separated by commas (e.g., kg,g,mt)
          </Text>
        </View>

        {/* Active Status */}
        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Active</Text>
            <Switch
              value={formData.is_active}
              onValueChange={(value) => updateField('is_active', value)}
            />
          </View>
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
              {isEditMode ? 'Update Product' : 'Create Product'}
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: THEME.colors.error,
    fontSize: THEME.typography.fontSize.base,
    marginTop: THEME.spacing.xs,
  },
  helpText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.sm,
    marginTop: THEME.spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
