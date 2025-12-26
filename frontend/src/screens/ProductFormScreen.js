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
  Switch,
} from 'react-native';
import { productAPI } from '../api';

const ProductFormScreen = ({ route, navigation }) => {
  const { productId } = route.params || {};
  const isEdit = !!productId;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    unit: '',
    is_active: true,
    rate: '',
    rate_effective_from: new Date().toISOString().split('T')[0],
    version: 0,
  });

  useEffect(() => {
    if (isEdit) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getOne(productId);
      const product = response.product;
      setFormData({
        ...product,
        rate: product.current_rate?.rate || '',
        rate_effective_from: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load product details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.code || !formData.unit) {
      Alert.alert('Validation Error', 'Name, Code, and Unit are required');
      return;
    }

    if (!isEdit && !formData.rate) {
      Alert.alert('Validation Error', 'Initial rate is required for new products');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        unit: formData.unit,
        is_active: formData.is_active,
      };

      if (isEdit) {
        payload.version = formData.version;
        await productAPI.update(productId, payload);
        Alert.alert('Success', 'Product updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        payload.rate = parseFloat(formData.rate);
        payload.rate_effective_from = formData.rate_effective_from;
        await productAPI.create(payload);
        Alert.alert('Success', 'Product created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save product';
      Alert.alert('Error', message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading && isEdit) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => updateField('name', value)}
          placeholder="Enter product name"
        />

        <Text style={styles.label}>Code *</Text>
        <TextInput
          style={styles.input}
          value={formData.code}
          onChangeText={(value) => updateField('code', value)}
          placeholder="Enter product code"
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Unit *</Text>
        <TextInput
          style={styles.input}
          value={formData.unit}
          onChangeText={(value) => updateField('unit', value)}
          placeholder="e.g., kg, g, liters, pieces"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(value) => updateField('description', value)}
          placeholder="Enter product description"
          multiline
          numberOfLines={3}
        />

        {!isEdit && (
          <>
            <Text style={styles.label}>Initial Rate *</Text>
            <TextInput
              style={styles.input}
              value={formData.rate}
              onChangeText={(value) => updateField('rate', value)}
              placeholder="Enter initial rate per unit"
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Effective From</Text>
            <TextInput
              style={styles.input}
              value={formData.rate_effective_from}
              onChangeText={(value) => updateField('rate_effective_from', value)}
              placeholder="YYYY-MM-DD"
            />
          </>
        )}

        {isEdit && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Current Rate: {formData.rate || 'Not set'}
            </Text>
            <Text style={styles.infoTextSmall}>
              To add new rates, view product details and use "Add Rate" button
            </Text>
          </View>
        )}

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Active</Text>
          <Switch
            value={formData.is_active}
            onValueChange={(value) => updateField('is_active', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={formData.is_active ? '#007AFF' : '#f4f3f4'}
          />
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
              {isEdit ? 'Update Product' : 'Create Product'}
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 10,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 5,
  },
  infoTextSmall: {
    fontSize: 14,
    color: '#1976d2',
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

export default ProductFormScreen;
