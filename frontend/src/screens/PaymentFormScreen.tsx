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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../services/database';
import { PaymentModel } from '../models/Collection';
import ApiService from '../services/api';
import { Picker } from '@react-native-picker/picker';

const PaymentFormScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: '',
    paymentType: 'advance',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    referenceNumber: '',
    notes: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const suppliersData = await ApiService.getSuppliers({ is_active: true });
      setSuppliers(suppliersData.data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      Alert.alert('Info', 'Unable to load suppliers. Please sync when online.');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.supplierId || !formData.amount || !formData.paymentType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return;
    }

    setIsLoading(true);
    try {
      // Save to local database
      await database.write(async () => {
        await database.get<PaymentModel>('payments').create((payment) => {
          payment.clientId = `${Date.now()}-${Math.random()}`;
          payment.userId = user!.id;
          payment.supplierId = formData.supplierId;
          payment.paymentType = formData.paymentType;
          payment.amount = parseFloat(formData.amount);
          payment.paymentDate = new Date(formData.paymentDate);
          payment.paymentMethod = formData.paymentMethod;
          payment.referenceNumber = formData.referenceNumber;
          payment.notes = formData.notes;
          payment.version = 1;
        });
      });

      Alert.alert('Success', 'Payment saved successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error saving payment:', error);
      Alert.alert('Error', error.message || 'Failed to save payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Supplier *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.supplierId}
            onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select Supplier" value="" />
            {suppliers.map((supplier) => (
              <Picker.Item
                key={supplier.id}
                label={`${supplier.name} (${supplier.code})`}
                value={supplier.id.toString()}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Payment Type *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.paymentType}
            onValueChange={(value) => setFormData({ ...formData, paymentType: value })}
            style={styles.picker}
          >
            <Picker.Item label="Advance Payment" value="advance" />
            <Picker.Item label="Partial Payment" value="partial" />
            <Picker.Item label="Full Payment" value="full" />
          </Picker>
        </View>

        <Text style={styles.label}>Amount *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          value={formData.amount}
          onChangeText={(value) => setFormData({ ...formData, amount: value })}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Payment Date *</Text>
        <TextInput
          style={styles.input}
          value={formData.paymentDate}
          onChangeText={(value) => setFormData({ ...formData, paymentDate: value })}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.paymentMethod}
            onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
            style={styles.picker}
          >
            <Picker.Item label="Cash" value="cash" />
            <Picker.Item label="Bank Transfer" value="bank_transfer" />
            <Picker.Item label="Check" value="check" />
          </Picker>
        </View>

        <Text style={styles.label}>Reference Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter reference number"
          value={formData.referenceNumber}
          onChangeText={(value) => setFormData({ ...formData, referenceNumber: value })}
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter notes"
          value={formData.notes}
          onChangeText={(value) => setFormData({ ...formData, notes: value })}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Payment</Text>
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
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentFormScreen;
