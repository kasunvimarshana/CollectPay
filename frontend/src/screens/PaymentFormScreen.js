import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { paymentAPI, supplierAPI } from '../api';

const PaymentFormScreen = ({ route, navigation }) => {
  const { paymentId } = route.params || {};
  const isEdit = !!paymentId;

  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplier_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_type: 'partial',
    reference_number: '',
    notes: '',
    version: 0,
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (isEdit && paymentId) {
      loadPayment();
    }
  }, [paymentId]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierAPI.getAll({ per_page: 100, is_active: true });
      setSuppliers(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load suppliers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPayment = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getOne(paymentId);
      const payment = response.payment;
      setFormData({
        supplier_id: payment.supplier_id,
        amount: payment.amount.toString(),
        payment_date: payment.payment_date,
        payment_type: payment.payment_type,
        reference_number: payment.reference_number || '',
        notes: payment.notes || '',
        version: payment.version,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load payment details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.supplier_id || !formData.amount) {
      Alert.alert('Validation Error', 'Supplier and Amount are required');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      Alert.alert('Validation Error', 'Amount must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (isEdit) {
        await paymentAPI.update(paymentId, payload);
        Alert.alert('Success', 'Payment updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await paymentAPI.create(payload);
        Alert.alert('Success', 'Payment recorded successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save payment';
      Alert.alert('Error', message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading && (isEdit || suppliers.length === 0)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Supplier *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.supplier_id}
            onValueChange={(value) => updateField('supplier_id', value)}
            enabled={!isEdit} // Disabled in edit mode to preserve historical record integrity
          >
            <Picker.Item label="Select a supplier" value="" />
            {suppliers.map((supplier) => (
              <Picker.Item
                key={supplier.id}
                label={`${supplier.name} (${supplier.code})`}
                value={supplier.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Payment Type *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.payment_type}
            onValueChange={(value) => updateField('payment_type', value)}
          >
            <Picker.Item label="Advance Payment" value="advance" />
            <Picker.Item label="Partial Payment" value="partial" />
            <Picker.Item label="Full Payment" value="full" />
          </Picker>
        </View>

        <Text style={styles.label}>Amount *</Text>
        <TextInput
          style={styles.input}
          value={formData.amount}
          onChangeText={(value) => updateField('amount', value)}
          placeholder="Enter payment amount"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Payment Date *</Text>
        <TextInput
          style={styles.input}
          value={formData.payment_date}
          onChangeText={(value) => updateField('payment_date', value)}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Reference Number</Text>
        <TextInput
          style={styles.input}
          value={formData.reference_number}
          onChangeText={(value) => updateField('reference_number', value)}
          placeholder="Enter reference number (optional)"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={(value) => updateField('notes', value)}
          placeholder="Enter any additional notes"
          multiline
          numberOfLines={3}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Payment Types:</Text>
          <Text style={styles.infoText}>• Advance: Payment made before collection</Text>
          <Text style={styles.infoText}>• Partial: Partial payment towards balance</Text>
          <Text style={styles.infoText}>• Full: Final settlement payment</Text>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEdit ? 'Update Payment' : 'Record Payment'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#856404',
    marginBottom: 3,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentFormScreen;
