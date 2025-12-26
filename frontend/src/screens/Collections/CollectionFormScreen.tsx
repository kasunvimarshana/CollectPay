import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../services/api';
import { Supplier, Product, ProductRate } from '../../types';
import { LoadingSpinner, Input, Button, Picker, PickerOption } from '../../components';

const CollectionFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productRates, setProductRates] = useState<ProductRate[]>([]);

  const [formData, setFormData] = useState({
    supplier_id: null as number | null,
    product_id: null as number | null,
    collection_date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);
  const [selectedRate, setSelectedRate] = useState<ProductRate | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.product_id) {
      fetchProductRates(formData.product_id);
      const product = products.find(p => p.id === formData.product_id);
      if (product && !formData.unit) {
        setFormData(prev => ({ ...prev, unit: product.default_unit }));
      }
    }
  }, [formData.product_id]);

  useEffect(() => {
    calculateAmount();
  }, [formData.quantity, formData.unit, productRates, formData.collection_date]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [suppliersRes, productsRes] = await Promise.all([
        apiService.getSuppliers({ is_active: true, per_page: 100 }),
        apiService.getProducts({ is_active: true, per_page: 100 }),
      ]);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductRates = async (productId: number) => {
    try {
      const response = await apiService.getProductRates({
        product_id: productId,
        is_active: true,
        per_page: 50,
      });
      setProductRates(response.data);
    } catch (err: any) {
      console.error('Failed to fetch product rates:', err);
    }
  };

  const calculateAmount = () => {
    if (!formData.quantity || !formData.unit || productRates.length === 0) {
      setCalculatedAmount(null);
      setSelectedRate(null);
      return;
    }

    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity)) {
      setCalculatedAmount(null);
      return;
    }

    // Find applicable rate for the collection date and unit
    const collectionDate = new Date(formData.collection_date);
    const applicableRate = productRates.find(rate => {
      const effectiveFrom = new Date(rate.effective_from);
      const effectiveTo = rate.effective_to ? new Date(rate.effective_to) : null;

      return (
        rate.unit === formData.unit &&
        collectionDate >= effectiveFrom &&
        (!effectiveTo || collectionDate <= effectiveTo)
      );
    });

    if (applicableRate) {
      setSelectedRate(applicableRate);
      setCalculatedAmount(quantity * applicableRate.rate);
    } else {
      setSelectedRate(null);
      setCalculatedAmount(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }

    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }

    if (!formData.quantity || isNaN(parseFloat(formData.quantity))) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }

    if (!selectedRate) {
      newErrors.rate = 'No active rate found for this product and unit';
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
      await apiService.createCollection({
        supplier_id: formData.supplier_id!,
        product_id: formData.product_id!,
        collection_date: formData.collection_date,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        notes: formData.notes || undefined,
      });

      Alert.alert('Success', 'Collection recorded successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  const supplierOptions: PickerOption[] = suppliers.map(s => ({
    label: s.name,
    value: s.id,
  }));

  const productOptions: PickerOption[] = products.map(p => ({
    label: `${p.name} (${p.code})`,
    value: p.id,
  }));

  const unitOptions: PickerOption[] = [
    { label: 'Kilogram (kg)', value: 'kg' },
    { label: 'Gram (g)', value: 'g' },
    { label: 'Liter (l)', value: 'l' },
    { label: 'Milliliter (ml)', value: 'ml' },
    { label: 'Unit', value: 'unit' },
    { label: 'Piece (pcs)', value: 'pcs' },
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

        <Picker
          label="Product *"
          value={formData.product_id}
          options={productOptions}
          onValueChange={(value) => setFormData({ ...formData, product_id: value })}
          error={errors.product_id}
          placeholder="Select a product"
        />

        <Input
          label="Collection Date *"
          value={formData.collection_date}
          onChangeText={(text) => setFormData({ ...formData, collection_date: text })}
          placeholder="YYYY-MM-DD"
        />

        <Input
          label="Quantity *"
          value={formData.quantity}
          onChangeText={(text) => setFormData({ ...formData, quantity: text })}
          error={errors.quantity}
          placeholder="Enter quantity"
          keyboardType="decimal-pad"
        />

        <Picker
          label="Unit *"
          value={formData.unit}
          options={unitOptions}
          onValueChange={(value) => setFormData({ ...formData, unit: value })}
          error={errors.unit}
          placeholder="Select unit"
        />

        {errors.rate && (
          <Text style={styles.errorText}>⚠️ {errors.rate}</Text>
        )}

        {selectedRate && calculatedAmount !== null && (
          <View style={styles.calculationCard}>
            <Text style={styles.calculationTitle}>Calculation Preview</Text>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Rate:</Text>
              <Text style={styles.calculationValue}>
                ${selectedRate.rate.toFixed(2)}/{formData.unit}
              </Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Quantity:</Text>
              <Text style={styles.calculationValue}>
                {formData.quantity} {formData.unit}
              </Text>
            </View>
            <View style={[styles.calculationRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>
                ${calculatedAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        <Input
          label="Notes"
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholder="Add notes (optional)"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Record Collection"
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
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fee',
    borderRadius: 5,
  },
  calculationCard: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#e8f8f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#2c3e50',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#27ae60',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
});

export default CollectionFormScreen;
