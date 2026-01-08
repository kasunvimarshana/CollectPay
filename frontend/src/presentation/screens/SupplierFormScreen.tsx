/**
 * Supplier Form Screen
 * Create or edit supplier information
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
import { ScreenHeader } from '../components';

interface SupplierFormData {
  name: string;
  code: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  region: string;
  is_active: boolean;
  version?: number; // Track version for optimistic locking
  id?: number; // Track ID for updates
}

export const SupplierFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const supplierId = (route.params as any)?.supplierId;
  const isEditMode = !!supplierId;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    code: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    region: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SupplierFormData, string>>>({});

  useEffect(() => {
    if (isEditMode) {
      loadSupplier();
    }
  }, [supplierId]);

  const loadSupplier = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/suppliers/${supplierId}`);
      if (response.success && response.data) {
        const supplier = response.data;
        setFormData({
          name: supplier.name || '',
          code: supplier.code || '',
          contact_person: supplier.contact_person || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          address: supplier.address || '',
          region: supplier.region || '',
          is_active: supplier.is_active ?? true,
          version: supplier.version, // Capture version for optimistic locking
          id: supplier.id, // Capture ID
        });
      }
    } catch (error) {
      console.error('Error loading supplier:', error);
      Alert.alert('Error', 'Failed to load supplier details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SupplierFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must not exceed 255 characters';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (formData.code.length > 255) {
      newErrors.code = 'Code must not exceed 255 characters';
    }

    if (formData.contact_person && formData.contact_person.length > 255) {
      newErrors.contact_person = 'Contact person must not exceed 255 characters';
    }

    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = 'Phone must not exceed 20 characters';
    }

    if (formData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      } else if (formData.email.length > 255) {
        newErrors.email = 'Email must not exceed 255 characters';
      }
    }

    if (formData.region && formData.region.length > 255) {
      newErrors.region = 'Region must not exceed 255 characters';
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
      
      if (isEditMode) {
        const response = await apiClient.put(`/suppliers/${supplierId}`, formData);
        // Check if operation was queued for offline sync
        if (response.queued) {
          Alert.alert('Queued for Sync', 'Your changes will be synced when you\'re back online.');
        } else {
          Alert.alert('Success', 'Supplier updated successfully');
        }
      } else {
        const response = await apiClient.post('/suppliers', formData);
        // Check if operation was queued for offline sync
        if (response.queued) {
          Alert.alert('Queued for Sync', 'Supplier will be created when you\'re back online.');
        } else {
          Alert.alert('Success', 'Supplier created successfully');
        }
      }
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving supplier:', error);
      const message = error.response?.data?.message || 'Failed to save supplier';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof SupplierFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading && isEditMode) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading supplier...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isEditMode ? 'Edit Supplier' : 'New Supplier'}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + THEME.spacing.lg }]}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="Enter supplier name"
            maxLength={255}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Code *</Text>
          <TextInput
            style={[styles.input, errors.code && styles.inputError]}
            value={formData.code}
            onChangeText={(value) => updateField('code', value)}
            placeholder="Enter supplier code"
            editable={!isEditMode} // Don't allow editing code in edit mode
            maxLength={255}
          />
          {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Contact Person</Text>
          <TextInput
            style={[styles.input, errors.contact_person && styles.inputError]}
            value={formData.contact_person}
            onChangeText={(value) => updateField('contact_person', value)}
            placeholder="Enter contact person name"
            maxLength={255}
          />
          {errors.contact_person && <Text style={styles.errorText}>{errors.contact_person}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            maxLength={20}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={255}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(value) => updateField('address', value)}
            placeholder="Enter address"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Region</Text>
          <TextInput
            style={[styles.input, errors.region && styles.inputError]}
            value={formData.region}
            onChangeText={(value) => updateField('region', value)}
            placeholder="Enter region"
            maxLength={255}
          />
          {errors.region && <Text style={styles.errorText}>{errors.region}</Text>}
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Active Status</Text>
            <Switch
              value={formData.is_active}
              onValueChange={(value) => updateField('is_active', value)}
              trackColor={{ false: '#ccc', true: '#2196F3' }}
              thumbColor={formData.is_active ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={THEME.colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Update' : 'Create'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: THEME.spacing.sm,
    color: THEME.colors.textSecondary,
  },
  header: {
    padding: THEME.spacing.base,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  scrollView: {
    flex: 1,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: THEME.colors.error,
    fontSize: THEME.typography.fontSize.sm,
    marginTop: THEME.spacing.xs,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: THEME.spacing.lg,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  submitButton: {
    backgroundColor: THEME.colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  submitButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
});
