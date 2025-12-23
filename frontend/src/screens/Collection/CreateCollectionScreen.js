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

const CreateCollectionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    supplier_id: '',
    product_id: '',
    quantity: '',
    unit: 'kg',
    collection_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [rate, setRate] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [errors, setErrors] = useState({});

  const units = ['grams', 'kg', 'liters', 'ml'];

  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  useEffect(() => {
    if (formData.product_id && formData.quantity) {
      calculateTotal();
    }
  }, [formData.product_id, formData.quantity, formData.unit]);

  const loadSuppliers = async () => {
    try {
      const db = await getDatabase();
      const results = await db.getAllAsync('SELECT * FROM suppliers ORDER BY name ASC');
      setSuppliers(results);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const db = await getDatabase();
      const results = await db.getAllAsync('SELECT * FROM products ORDER BY name ASC');
      setProducts(results);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const calculateTotal = async () => {
    try {
      const db = await getDatabase();
      // Get current rate for the product
      const rateData = await db.getFirstAsync(
        `SELECT rate FROM product_rates WHERE product_id = ? AND effective_from <= ? ORDER BY effective_from DESC LIMIT 1`,
        [formData.product_id, formData.collection_date]
      );

      if (rateData) {
        setRate(rateData.rate);
        const total = parseFloat(formData.quantity) * rateData.rate;
        setTotalAmount(total);
      }
    } catch (error) {
      console.error('Error calculating total:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }

    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
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
        `INSERT INTO collections (client_uuid, supplier_id, product_id, quantity, unit, rate, total_amount, collection_date, notes, collector_id, is_synced, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientUuid,
          formData.supplier_id,
          formData.product_id,
          parseFloat(formData.quantity),
          formData.unit,
          rate,
          totalAmount,
          formData.collection_date,
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
          'collection',
          result.lastInsertRowId,
          'create',
          JSON.stringify({ ...formData, client_uuid: clientUuid, rate, total_amount: totalAmount }),
          'pending',
          now,
        ]
      );

      Alert.alert('Success', 'Collection created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating collection:', error);
      Alert.alert('Error', 'Failed to create collection');
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
        <Text style={styles.title}>New Collection</Text>
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Product *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.product_id}
              onValueChange={(value) => setFormData({ ...formData, product_id: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Product" value="" />
              {products.map((product) => (
                <Picker.Item key={product.id} label={product.name} value={product.id} />
              ))}
            </Picker>
          </View>
          {errors.product_id && <Text style={styles.errorText}>{errors.product_id}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantity *</Text>
          <TextInput
            style={[styles.input, errors.quantity && styles.inputError]}
            placeholder="Enter quantity"
            value={formData.quantity}
            onChangeText={(text) => setFormData({ ...formData, quantity: text })}
            keyboardType="numeric"
          />
          {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Unit *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.unit}
              onValueChange={(value) => setFormData({ ...formData, unit: value })}
              style={styles.picker}
            >
              {units.map((unit) => (
                <Picker.Item key={unit} label={unit} value={unit} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Collection Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.collection_date}
            onChangeText={(text) => setFormData({ ...formData, collection_date: text })}
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

        {rate > 0 && (
          <View style={styles.calculationCard}>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Rate:</Text>
              <Text style={styles.calculationValue}>LKR {rate.toFixed(2)}/{formData.unit}</Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Total Amount:</Text>
              <Text style={styles.calculationTotal}>LKR {totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Collection</Text>
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
  calculationCard: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calculationLabel: {
    fontSize: 16,
    color: '#333',
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  calculationTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
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

export default CreateCollectionScreen;
