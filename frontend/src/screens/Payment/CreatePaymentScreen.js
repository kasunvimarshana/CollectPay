import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getDatabase } from '../../database/init';
import { useAuth } from '../../context/AuthContext';
import uuid from 'react-native-uuid';

const CreatePaymentScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    supplier_id: '',
    payment_type: 'partial',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  });
  const [balance, setBalance] = useState(0);
  const [errors, setErrors] = useState({});

  const paymentTypes = [
    { value: 'advance', label: 'Advance Payment' },
    { value: 'partial', label: 'Partial Payment' },
    { value: 'full', label: 'Full Payment' },
    { value: 'adjustment', label: 'Adjustment' },
  ];

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (formData.supplier_id) {
      loadSupplierBalance();
    }
  }, [formData.supplier_id]);

  const loadSuppliers = async () => {
    try {
      const db = await getDatabase();
      const results = await db.getAllAsync('SELECT * FROM suppliers ORDER BY name ASC');
      setSuppliers(results);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadSupplierBalance = async () => {
    try {
      const db = await getDatabase();
      
      // Calculate balance
      const collectionsTotal = await db.getFirstAsync(
        'SELECT SUM(total_amount) as total FROM collections WHERE supplier_id = ?',
        [formData.supplier_id]
      );
      
      const paymentsTotal = await db.getFirstAsync(
        'SELECT SUM(amount) as total FROM payments WHERE supplier_id = ?',
        [formData.supplier_id]
      );

      const currentBalance = (collectionsTotal?.total || 0) - (paymentsTotal?.total || 0);
      setBalance(currentBalance);

      // Auto-fill amount for full payment
      if (formData.payment_type === 'full' && currentBalance > 0) {
        setFormData({ ...formData, amount: currentBalance.toFixed(2) });
      }
    } catch (error) {
      console.error('Error loading supplier balance:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (parseFloat(formData.amount) > balance && formData.payment_type !== 'advance' && formData.payment_type !== 'adjustment') {
      newErrors.amount = 'Amount cannot exceed current balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const db = await getDatabase();
      const now = new Date().toISOString();
      const clientUuid = uuid.v4();

      const result = await db.runAsync(
        `INSERT INTO payments (client_uuid, supplier_id, payment_type, amount, payment_date, reference, notes, processor_id, is_synced, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientUuid,
          formData.supplier_id,
          formData.payment_type,
          parseFloat(formData.amount),
          formData.payment_date,
          formData.reference || null,
          formData.notes || null,
          user.id,
          0,
          now,
          now,
        ]
      );

      // Add to sync queue
      await db.runAsync(
        `INSERT INTO sync_queue (client_uuid, entity_type, entity_id, operation, data, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid.v4(),
          'payment',
          result.lastInsertRowId,
          'create',
          JSON.stringify({ ...formData, client_uuid: clientUuid }),
          'pending',
          now,
        ]
      );

      Alert.alert('Success', 'Payment recorded successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating payment:', error);
      Alert.alert('Error', 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Record Payment</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Supplier *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.supplier_id}
              onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Supplier" value="" />
              {suppliers.map((supplier) => (
                <Picker.Item key={supplier.id} label={supplier.name} value={supplier.id} />
              ))}
            </Picker>
          </View>
          {errors.supplier_id && <Text style={styles.errorText}>{errors.supplier_id}</Text>}
        </View>

        {formData.supplier_id && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={[styles.balanceAmount, balance < 0 && styles.negativeBalance]}>
              LKR {balance.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Payment Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.payment_type}
              onValueChange={(value) => {
                setFormData({ ...formData, payment_type: value });
                // Auto-fill for full payment
                if (value === 'full' && balance > 0) {
                  setFormData(prev => ({ ...prev, payment_type: value, amount: balance.toFixed(2) }));
                }
              }}
              style={styles.picker}
            >
              {paymentTypes.map((type) => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={[styles.input, errors.amount && styles.inputError]}
            placeholder="Enter amount"
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
            keyboardType="numeric"
          />
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Payment Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.payment_date}
            onChangeText={(text) => setFormData({ ...formData, payment_date: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Reference Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter reference number"
            value={formData.reference}
            onChangeText={(text) => setFormData({ ...formData, reference: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter notes"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Record Payment</Text>
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
    padding: 20,
    backgroundColor: '#007AFF',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  form: {
    padding: 20,
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
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#F44336',
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
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 5,
  },
  balanceCard: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  negativeBalance: {
    color: '#F44336',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreatePaymentScreen;
