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
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collectionAPI, supplierAPI, productAPI } from '../api';

const CollectionFormScreen = ({ route, navigation }) => {
  const { collectionId } = route.params || {};
  const isEdit = !!collectionId;

  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    supplier_id: '',
    product_id: '',
    collection_date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: '',
    notes: '',
    version: 0,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isEdit && collectionId) {
      loadCollection();
    }
  }, [collectionId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [suppliersRes, productsRes] = await Promise.all([
        supplierAPI.getAll({ per_page: 100, is_active: true }),
        productAPI.getAll({ per_page: 100, is_active: true }),
      ]);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load initial data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCollection = async () => {
    try {
      setLoading(true);
      const response = await collectionAPI.getOne(collectionId);
      const collection = response.collection;
      setFormData({
        supplier_id: collection.supplier_id,
        product_id: collection.product_id,
        collection_date: collection.collection_date,
        quantity: collection.quantity.toString(),
        unit: collection.unit,
        notes: collection.notes || '',
        version: collection.version,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load collection details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.supplier_id || !formData.product_id || !formData.quantity) {
      Alert.alert('Validation Error', 'Supplier, Product, and Quantity are required');
      return;
    }

    if (parseFloat(formData.quantity) <= 0) {
      Alert.alert('Validation Error', 'Quantity must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity),
      };

      if (isEdit) {
        await collectionAPI.update(collectionId, payload);
        Alert.alert('Success', 'Collection updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await collectionAPI.create(payload);
        Alert.alert('Success', 'Collection recorded successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save collection';
      Alert.alert('Error', message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-fill unit when product is selected
    if (field === 'product_id' && value) {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        setFormData(prev => ({ ...prev, unit: product.unit }));
      }
    }
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
            enabled={!isEdit} // Disabled in edit mode to preserve collection integrity and rate application
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

        <Text style={styles.label}>Product *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.product_id}
            onValueChange={(value) => updateField('product_id', value)}
            enabled={!isEdit} // Disabled in edit mode to preserve rate application and auditing
          >
            <Picker.Item label="Select a product" value="" />
            {products.map((product) => (
              <Picker.Item
                key={product.id}
                label={`${product.name} (${product.unit})`}
                value={product.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Collection Date *</Text>
        <TextInput
          style={styles.input}
          value={formData.collection_date}
          onChangeText={(value) => updateField('collection_date', value)}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Quantity *</Text>
        <TextInput
          style={styles.input}
          value={formData.quantity}
          onChangeText={(value) => updateField('quantity', value)}
          placeholder="Enter quantity"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Unit *</Text>
        <TextInput
          style={styles.input}
          value={formData.unit}
          onChangeText={(value) => updateField('unit', value)}
          placeholder="e.g., kg, g, liters"
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

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEdit ? 'Update Collection' : 'Record Collection'}
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

export default CollectionFormScreen;
