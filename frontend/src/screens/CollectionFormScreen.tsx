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
import { CollectionModel, SupplierModel, ProductModel } from '../models/Collection';
import ApiService from '../services/api';
import { Picker } from '@react-native-picker/picker';

const CollectionFormScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: '',
    productId: '',
    quantity: '',
    unit: 'kilogram',
    rate: '',
    amount: '',
    collectionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Auto-calculate amount when quantity or rate changes
    if (formData.quantity && formData.rate) {
      const calculatedAmount = (
        parseFloat(formData.quantity) * parseFloat(formData.rate)
      ).toFixed(2);
      setFormData((prev) => ({ ...prev, amount: calculatedAmount }));
    }
  }, [formData.quantity, formData.rate]);

  const loadData = async () => {
    try {
      // Try to load from API first
      const [suppliersData, productsData] = await Promise.all([
        ApiService.getSuppliers({ is_active: true }),
        ApiService.getProducts({ is_active: true }),
      ]);

      setSuppliers(suppliersData.data || []);
      setProducts(productsData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Info', 'Unable to load suppliers and products. Please sync when online.');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.supplierId || !formData.productId || !formData.quantity || !formData.rate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Save to local database
      await database.write(async () => {
        await database.get<CollectionModel>('collections').create((collection) => {
          collection.clientId = `${Date.now()}-${Math.random()}`;
          collection.userId = user!.id;
          collection.supplierId = formData.supplierId;
          collection.productId = formData.productId;
          collection.quantity = parseFloat(formData.quantity);
          collection.unit = formData.unit;
          collection.rate = parseFloat(formData.rate);
          collection.amount = parseFloat(formData.amount);
          collection.collectionDate = new Date(formData.collectionDate);
          collection.notes = formData.notes;
          collection.version = 1;
        });
      });

      Alert.alert('Success', 'Collection saved successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error saving collection:', error);
      Alert.alert('Error', error.message || 'Failed to save collection');
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

        <Text style={styles.label}>Product *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.productId}
            onValueChange={(value) => setFormData({ ...formData, productId: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select Product" value="" />
            {products.map((product) => (
              <Picker.Item
                key={product.id}
                label={`${product.name} (${product.unit})`}
                value={product.id.toString()}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Quantity *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter quantity"
          value={formData.quantity}
          onChangeText={(value) => setFormData({ ...formData, quantity: value })}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Unit *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value })}
            style={styles.picker}
          >
            <Picker.Item label="Kilogram" value="kilogram" />
            <Picker.Item label="Gram" value="gram" />
            <Picker.Item label="Liter" value="liter" />
            <Picker.Item label="Milliliter" value="milliliter" />
          </Picker>
        </View>

        <Text style={styles.label}>Rate (per unit) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter rate"
          value={formData.rate}
          onChangeText={(value) => setFormData({ ...formData, rate: value })}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={formData.amount}
          editable={false}
        />

        <Text style={styles.label}>Collection Date *</Text>
        <TextInput
          style={styles.input}
          value={formData.collectionDate}
          onChangeText={(value) => setFormData({ ...formData, collectionDate: value })}
          placeholder="YYYY-MM-DD"
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
            <Text style={styles.buttonText}>Save Collection</Text>
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
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#666',
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
    backgroundColor: '#007AFF',
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

export default CollectionFormScreen;
