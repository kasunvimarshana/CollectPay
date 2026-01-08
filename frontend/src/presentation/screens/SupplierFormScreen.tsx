/**
 * Supplier Form Screen
 * Create or edit supplier information
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

interface SupplierFormData {
  name: string;
  code: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  region: string;
  is_active: boolean;
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
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
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
        await apiClient.put(`/suppliers/${supplierId}`, formData);
        Alert.alert('Success', 'Supplier updated successfully');
      } else {
        await apiClient.post('/suppliers', formData);
        Alert.alert('Success', 'Supplier created successfully');
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
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading supplier...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>
          {isEditMode ? 'Edit Supplier' : 'New Supplier'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="Enter supplier name"
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
          />
          {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Contact Person</Text>
          <TextInput
            style={styles.input}
            value={formData.contact_person}
            onChangeText={(value) => updateField('contact_person', value)}
            placeholder="Enter contact person name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
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
            style={styles.input}
            value={formData.region}
            onChangeText={(value) => updateField('region', value)}
            placeholder="Enter region"
          />
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
              <ActivityIndicator color="#fff" />
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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
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
    borderColor: '#F44336',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
