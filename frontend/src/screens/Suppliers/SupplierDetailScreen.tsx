import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import apiService from '../../services/api';
import { Supplier } from '../../types';
import { LoadingSpinner, ErrorMessage, Input, Button, Picker } from '../../components';

const SupplierDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { supplierId } = (route.params as any) || {};

  const [loading, setLoading] = useState(!!supplierId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [supplier, setSupplier] = useState<Partial<Supplier>>({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    registration_number: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (supplierId) {
      fetchSupplier();
    }
  }, [supplierId]);

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getSupplier(supplierId);
      setSupplier(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load supplier');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!supplier.name || supplier.name.trim() === '') {
      newErrors.name = 'Name is required';
    }

    if (supplier.email && !/^\S+@\S+\.\S+$/.test(supplier.email)) {
      newErrors.email = 'Invalid email format';
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
      if (supplierId) {
        await apiService.updateSupplier(supplierId, supplier);
        Alert.alert('Success', 'Supplier updated successfully');
      } else {
        await apiService.createSupplier(supplier);
        Alert.alert('Success', 'Supplier created successfully');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this supplier?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteSupplier(supplierId);
              Alert.alert('Success', 'Supplier deleted successfully');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete supplier');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading supplier..." />;
  }

  if (error && !supplier.name) {
    return <ErrorMessage message={error} onRetry={fetchSupplier} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.form}>
        <Input
          label="Supplier Name *"
          value={supplier.name}
          onChangeText={(text) => setSupplier({ ...supplier, name: text })}
          error={errors.name}
          placeholder="Enter supplier name"
        />

        <Input
          label="Contact Person"
          value={supplier.contact_person}
          onChangeText={(text) => setSupplier({ ...supplier, contact_person: text })}
          placeholder="Enter contact person name"
        />

        <Input
          label="Phone"
          value={supplier.phone}
          onChangeText={(text) => setSupplier({ ...supplier, phone: text })}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <Input
          label="Email"
          value={supplier.email}
          onChangeText={(text) => setSupplier({ ...supplier, email: text })}
          error={errors.email}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Address"
          value={supplier.address}
          onChangeText={(text) => setSupplier({ ...supplier, address: text })}
          placeholder="Enter address"
          multiline
          numberOfLines={3}
        />

        <Input
          label="Registration Number"
          value={supplier.registration_number}
          onChangeText={(text) => setSupplier({ ...supplier, registration_number: text })}
          placeholder="Enter registration number"
        />

        <Picker
          label="Status"
          value={supplier.is_active}
          options={[
            { label: 'Active', value: true },
            { label: 'Inactive', value: false },
          ]}
          onValueChange={(value) => setSupplier({ ...supplier, is_active: value })}
        />

        {supplierId && supplier.balance_amount !== undefined && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Financial Summary</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Total Collections:</Text>
              <Text style={styles.balanceAmount}>
                ${(supplier.total_collections_amount || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Total Payments:</Text>
              <Text style={styles.balanceAmount}>
                ${(supplier.total_payments_amount || 0).toFixed(2)}
              </Text>
            </View>
            <View style={[styles.balanceRow, styles.balanceTotal]}>
              <Text style={styles.balanceTotalLabel}>Balance:</Text>
              <Text style={[
                styles.balanceTotalAmount,
                (supplier.balance_amount || 0) > 0 ? styles.balancePositive : styles.balanceNegative
              ]}>
                ${(supplier.balance_amount || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={supplierId ? 'Update Supplier' : 'Create Supplier'}
          onPress={handleSave}
          loading={saving}
        />

        {supplierId && (
          <Button
            title="Delete Supplier"
            variant="danger"
            onPress={handleDelete}
            disabled={saving}
          />
        )}
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
  balanceCard: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dce1e6',
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  balanceTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#dce1e6',
  },
  balanceTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  balanceTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balancePositive: {
    color: '#27ae60',
  },
  balanceNegative: {
    color: '#e74c3c',
  },
});

export default SupplierDetailScreen;
