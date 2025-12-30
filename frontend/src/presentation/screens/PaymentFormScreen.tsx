/**
 * Payment Form Screen
 * Create or edit payment information
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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '../../infrastructure/api/apiClient';
import { Supplier } from '../../domain/entities/Supplier';
import { PaymentType } from '../../domain/entities/Payment';

interface PaymentFormData {
  supplier_id: string;
  payment_date: string;
  amount: string;
  type: PaymentType;
  reference_number: string;
  payment_method: string;
  notes: string;
}

export const PaymentFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const paymentId = (route.params as any)?.paymentId;
  const isEditMode = !!paymentId;

  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierBalance, setSupplierBalance] = useState<number | null>(null);

  const [formData, setFormData] = useState<PaymentFormData>({
    supplier_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'advance',
    reference_number: '',
    payment_method: 'cash',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});

  const paymentTypes: PaymentType[] = ['advance', 'partial', 'full', 'adjustment'];
  const paymentMethods = ['cash', 'bank_transfer', 'cheque', 'mobile_money'];

  useEffect(() => {
    loadSuppliers();
    if (isEditMode) {
      loadPayment();
    }
  }, [paymentId]);

  useEffect(() => {
    if (formData.supplier_id) {
      loadSupplierBalance(formData.supplier_id);
    }
  }, [formData.supplier_id]);

  const loadSuppliers = async () => {
    try {
      const response = await apiClient.get<any>('/suppliers');
      if (response.success && response.data) {
        // Handle paginated response
        const suppliers = Array.isArray(response.data) 
          ? response.data 
          : ((response.data as any).data || response.data);
        setSuppliers(suppliers.filter((s: Supplier) => s.is_active));
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadPayment = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/payments/${paymentId}`);
      if (response.success && response.data as any) {
        const payment = response.data as any;
        setFormData({
          supplier_id: payment.supplier_id?.toString() || '',
          payment_date: payment.payment_date?.split('T')[0] || '',
          amount: payment.amount?.toString() || '',
          type: payment.type || 'advance',
          reference_number: payment.reference_number || '',
          payment_method: payment.payment_method || 'cash',
          notes: payment.notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading payment:', error);
      Alert.alert('Error', 'Failed to load payment details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierBalance = async (supplierId: string) => {
    try {
      const response = await apiClient.get<any>(`/suppliers/${supplierId}/balance`);
      if (response.success && response.data) {
        setSupplierBalance((response.data as any).balance);
      }
    } catch (error) {
      console.error('Error loading supplier balance:', error);
      setSupplierBalance(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PaymentFormData, string>> = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }

    if (!formData.payment_date) {
      newErrors.payment_date = 'Payment date is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.type) {
      newErrors.type = 'Payment type is required';
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
        supplier_id: parseInt(formData.supplier_id),
        payment_date: formData.payment_date,
        amount: parseFloat(formData.amount),
        type: formData.type,
        reference_number: formData.reference_number || null,
        payment_method: formData.payment_method || null,
        notes: formData.notes || null,
      };

      if (isEditMode) {
        await apiClient.put(`/payments/${paymentId}`, submitData);
        Alert.alert('Success', 'Payment updated successfully');
      } else {
        await apiClient.post('/payments', submitData);
        Alert.alert('Success', 'Payment created successfully');
      }

      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving payment:', error);
      const message = error.response?.data?.message || 'Failed to save payment';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof PaymentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading && isEditMode) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading payment...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditMode ? 'Edit Payment' : 'New Payment'}
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

        {/* Supplier Balance Display */}
        {supplierBalance !== null && (
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Current Balance:</Text>
            <Text style={[
              styles.balanceValue,
              { color: supplierBalance >= 0 ? '#4CAF50' : '#f44336' }
            ]}>
              ${supplierBalance.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Payment Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Payment Date *</Text>
          <TextInput
            style={[styles.input, errors.payment_date && styles.inputError]}
            placeholder="YYYY-MM-DD"
            value={formData.payment_date}
            onChangeText={(value) => updateField('payment_date', value)}
          />
          {errors.payment_date && (
            <Text style={styles.errorText}>{errors.payment_date}</Text>
          )}
        </View>

        {/* Amount */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={[styles.input, errors.amount && styles.inputError]}
            placeholder="Enter amount"
            value={formData.amount}
            onChangeText={(value) => updateField('amount', value)}
            keyboardType="decimal-pad"
          />
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
        </View>

        {/* Payment Type */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Payment Type *</Text>
          <View style={styles.typeOptions}>
            {paymentTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  formData.type === type && styles.typeButtonSelected
                ]}
                onPress={() => updateField('type', type)}
              >
                <Text style={[
                  styles.typeButtonText,
                  formData.type === type && styles.typeButtonTextSelected
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
        </View>

        {/* Payment Method */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.typeOptions}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.typeButton,
                  formData.payment_method === method && styles.typeButtonSelected
                ]}
                onPress={() => updateField('payment_method', method)}
              >
                <Text style={[
                  styles.typeButtonText,
                  formData.payment_method === method && styles.typeButtonTextSelected
                ]}>
                  {method.replace('_', ' ').split(' ').map(w => 
                    w.charAt(0).toUpperCase() + w.slice(1)
                  ).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reference Number */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Reference Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter reference number (optional)"
            value={formData.reference_number}
            onChangeText={(value) => updateField('reference_number', value)}
          />
        </View>

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
              {isEditMode ? 'Update Payment' : 'Create Payment'}
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
  balanceInfo: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  typeButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  typeButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
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
