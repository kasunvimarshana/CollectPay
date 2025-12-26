import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../services/api';
import { Supplier } from '../../types';
import { LoadingSpinner, Input, Button, Picker, PickerOption } from '../../components';

const PaymentFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    supplier_id: null as number | null,
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_type: 'partial' as 'advance' | 'partial' | 'full',
    payment_method: '',
    reference_number: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (formData.supplier_id) {
      const supplier = suppliers.find(s => s.id === formData.supplier_id);
      setSelectedSupplier(supplier || null);
    } else {
      setSelectedSupplier(null);
    }
  }, [formData.supplier_id, suppliers]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSuppliers({
        is_active: true,
        per_page: 100,
      });
      setSuppliers(response.data);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.payment_type) {
      newErrors.payment_type = 'Payment type is required';
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
      await apiService.createPayment({
        supplier_id: formData.supplier_id!,
        payment_date: formData.payment_date,
        amount: parseFloat(formData.amount),
        payment_type: formData.payment_type,
        payment_method: formData.payment_method || undefined,
        reference_number: formData.reference_number || undefined,
        notes: formData.notes || undefined,
      });

      Alert.alert('Success', 'Payment recorded successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save payment');
    } finally {
      setSaving(false);
    }
  };

  const supplierOptions: PickerOption[] = suppliers.map(s => ({
    label: `${s.name} (Balance: $${(s.balance_amount || 0).toFixed(2)})`,
    value: s.id,
  }));

  const paymentTypeOptions: PickerOption[] = [
    { label: 'Advance Payment', value: 'advance' },
    { label: 'Partial Payment', value: 'partial' },
    { label: 'Full Payment', value: 'full' },
  ];

  const paymentMethodOptions: PickerOption[] = [
    { label: 'Cash', value: 'cash' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Check', value: 'check' },
    { label: 'Mobile Payment', value: 'mobile_payment' },
    { label: 'Credit Card', value: 'credit_card' },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading form data..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.form}>
        <Picker
          label="Supplier *"
          value={formData.supplier_id}
          options={supplierOptions}
          onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
          error={errors.supplier_id}
          placeholder="Select a supplier"
        />

        {selectedSupplier && (
          <View style={styles.supplierCard}>
            <Text style={styles.supplierCardTitle}>Supplier Balance</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Total Collections:</Text>
              <Text style={styles.balanceValue}>
                ${(selectedSupplier.total_collections_amount || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Total Payments:</Text>
              <Text style={styles.balanceValue}>
                ${(selectedSupplier.total_payments_amount || 0).toFixed(2)}
              </Text>
            </View>
            <View style={[styles.balanceRow, styles.balanceTotal]}>
              <Text style={styles.balanceTotalLabel}>Current Balance:</Text>
              <Text style={[
                styles.balanceTotalValue,
                (selectedSupplier.balance_amount || 0) > 0 ? styles.balancePositive : styles.balanceNegative
              ]}>
                ${(selectedSupplier.balance_amount || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        <Input
          label="Payment Date *"
          value={formData.payment_date}
          onChangeText={(text) => setFormData({ ...formData, payment_date: text })}
          placeholder="YYYY-MM-DD"
        />

        <Input
          label="Amount *"
          value={formData.amount}
          onChangeText={(text) => setFormData({ ...formData, amount: text })}
          error={errors.amount}
          placeholder="Enter amount"
          keyboardType="decimal-pad"
        />

        <Picker
          label="Payment Type *"
          value={formData.payment_type}
          options={paymentTypeOptions}
          onValueChange={(value) => setFormData({ ...formData, payment_type: value })}
          error={errors.payment_type}
        />

        <Picker
          label="Payment Method"
          value={formData.payment_method}
          options={paymentMethodOptions}
          onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
          placeholder="Select payment method (optional)"
        />

        <Input
          label="Reference Number"
          value={formData.reference_number}
          onChangeText={(text) => setFormData({ ...formData, reference_number: text })}
          placeholder="Enter reference number (optional)"
        />

        <Input
          label="Notes"
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholder="Add notes (optional)"
          multiline
          numberOfLines={3}
        />

        {formData.amount && selectedSupplier && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Balance After Payment</Text>
            <Text style={[
              styles.previewValue,
              ((selectedSupplier.balance_amount || 0) - parseFloat(formData.amount || '0')) > 0
                ? styles.balancePositive
                : styles.balanceNegative
            ]}>
              ${((selectedSupplier.balance_amount || 0) - parseFloat(formData.amount || '0')).toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Record Payment"
          onPress={handleSave}
          loading={saving}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  supplierCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dce1e6',
  },
  supplierCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  balanceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
  },
  balanceTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#dce1e6',
  },
  balanceTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  balanceTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balancePositive: {
    color: '#27ae60',
  },
  balanceNegative: {
    color: '#e74c3c',
  },
  previewCard: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498db',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  previewValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default PaymentFormScreen;
