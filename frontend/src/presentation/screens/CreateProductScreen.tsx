/**
 * Create Product Screen
 * Form to create a new product
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProductStore } from '../state/useProductStore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { NetworkStatus } from '../components/NetworkStatus';

interface CreateProductScreenProps {
  navigation: any;
}

const UNITS = [
  { label: 'Kilogram (kg)', value: 'kg' },
  { label: 'Gram (g)', value: 'g' },
  { label: 'Liter (l)', value: 'l' },
  { label: 'Milliliter (ml)', value: 'ml' },
  { label: 'Piece', value: 'piece' },
  { label: 'Unit', value: 'unit' },
];

export const CreateProductScreen: React.FC<CreateProductScreenProps> = ({ navigation }) => {
  const { createProduct, isLoading } = useProductStore();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    defaultUnit: 'kg',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }
    if (!formData.defaultUnit.trim()) {
      newErrors.defaultUnit = 'Default unit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      await createProduct(formData);
      Alert.alert('Success', 'Product created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create product');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatus />
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <Text style={styles.title}>Create New Product</Text>

          <Input
            label="Name *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            error={errors.name}
            placeholder="Enter product name"
          />

          <Input
            label="Code *"
            value={formData.code}
            onChangeText={(text) => setFormData({ ...formData, code: text })}
            error={errors.code}
            placeholder="Enter unique code (e.g., PROD001)"
          />

          <View style={styles.unitContainer}>
            <Text style={styles.unitLabel}>Default Unit *</Text>
            <View style={styles.unitButtons}>
              {UNITS.map((unit) => (
                <Button
                  key={unit.value}
                  title={unit.label}
                  onPress={() => setFormData({ ...formData, defaultUnit: unit.value })}
                  variant={formData.defaultUnit === unit.value ? 'primary' : 'secondary'}
                  style={styles.unitButton}
                />
              ))}
            </View>
            {errors.defaultUnit && (
              <Text style={styles.errorText}>{errors.defaultUnit}</Text>
            )}
          </View>

          <Input
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter product description"
            multiline
            numberOfLines={3}
            style={styles.descriptionInput}
          />

          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.cancelButton}
            />
            <Button
              title="Create Product"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  unitContainer: {
    marginBottom: 16,
  },
  unitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  unitButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  unitButton: {
    flex: 0,
    minWidth: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 12,
  },
  submitButton: {
    flex: 2,
  },
});
