/**
 * Payment Form Screen
 * Create or edit payment information
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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { PaymentType } from '../../domain/entities/Payment';
import { DateTimePicker, SearchableSelector, ScreenHeader } from '../components';

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
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
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
    if (isEditMode) {
      loadPayment();
    }
  }, [paymentId]);

  useEffect(() => {
    if (formData.supplier_id) {
      loadSupplierBalance(formData.supplier_id);
    }
  }, [formData.supplier_id]);

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

    // Validate max lengths per API specs
    if (formData.reference_number && formData.reference_number.length > 255) {
      newErrors.reference_number = 'Reference number must not exceed 255 characters';
    }

    if (formData.payment_method && formData.payment_method.length > 255) {
      newErrors.payment_method = 'Payment method must not exceed 255 characters';
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
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading payment...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isEditMode ? 'Edit Payment' : 'New Payment'}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: insets.bottom + THEME.spacing.lg }}>
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

          {/* Supplier Balance Display */}
          {supplierBalance !== null && (
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Current Balance:</Text>
              <Text style={[
                styles.balanceValue,
                { color: supplierBalance >= 0 ? THEME.colors.success : THEME.colors.error }
              ]}>
                ${supplierBalance.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Payment Date */}
          <DateTimePicker
          label="Payment Date *"
          value={formData.payment_date}
          onChange={(value) => updateField('payment_date', value)}
          mode="date"
          placeholder="Select payment date"
          error={errors.payment_date}
        />

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
            style={[styles.input, errors.reference_number && styles.inputError]}
            placeholder="Enter reference number (optional)"
            value={formData.reference_number}
            onChangeText={(value) => updateField('reference_number', value)}
            maxLength={255}
          />
          {errors.reference_number && <Text style={styles.errorText}>{errors.reference_number}</Text>}
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
            <ActivityIndicator color={THEME.colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Update Payment' : 'Create Payment'}
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
  scrollView: {
    flex: 1,
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
    marginTop: THEME.spacing.xs,
  },
  optionsList: {
    marginTop: THEME.spacing.sm,
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
  balanceInfo: {
    backgroundColor: THEME.colors.gray50,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  balanceLabel: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
  },
  balanceValue: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.base,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  typeButtonSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  typeButtonText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
  },
  typeButtonTextSelected: {
    color: THEME.colors.white,
    fontWeight: THEME.typography.fontWeight.semibold,
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
});
