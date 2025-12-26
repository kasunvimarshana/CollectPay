import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supplierService, Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../api/supplier';
import { FloatingActionButton, FormModal, Input, Button } from '../components';
import { EMAIL_REGEX } from '../utils/constants';

const SuppliersScreen = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getAll({ per_page: 50 });
      setSuppliers(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load suppliers');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSuppliers();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
    });
    setErrors({});
    setEditingSupplier(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      code: supplier.code,
      address: supplier.address || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
    });
    setModalVisible(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }
    if (formData.email && !EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateSupplierRequest = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        address: formData.address.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
      };

      if (editingSupplier) {
        const updatePayload: UpdateSupplierRequest = {
          ...payload,
          version: editingSupplier.version,
        };
        await supplierService.update(editingSupplier.id, updatePayload);
        Alert.alert('Success', 'Supplier updated successfully');
      } else {
        await supplierService.create(payload);
        Alert.alert('Success', 'Supplier created successfully');
      }

      setModalVisible(false);
      resetForm();
      loadSuppliers();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save supplier'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (supplier: Supplier) => {
    Alert.alert(
      'Delete Supplier',
      `Are you sure you want to delete "${supplier.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await supplierService.delete(supplier.id);
              Alert.alert('Success', 'Supplier deleted successfully');
              loadSuppliers();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to delete supplier'
              );
            }
          },
        },
      ]
    );
  };

  const renderSupplier = ({ item }: { item: Supplier }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEditModal(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      <Text style={styles.code}>Code: {item.code}</Text>
      {item.phone && <Text style={styles.detail}>📞 {item.phone}</Text>}
      {item.email && <Text style={styles.detail}>📧 {item.email}</Text>}
      {item.address && <Text style={styles.detail}>📍 {item.address}</Text>}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suppliers</Text>
        <Text style={styles.count}>{suppliers.length} total</Text>
      </View>
      <FlatList
        data={suppliers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSupplier}
        contentContainerStyle={styles.list}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No suppliers found</Text>
        }
      />
      <FloatingActionButton onPress={openCreateModal} />
      
      <FormModal
        visible={modalVisible}
        title={editingSupplier ? 'Edit Supplier' : 'Create Supplier'}
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <Input
          label="Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          error={errors.name}
          required
        />
        <Input
          label="Code"
          value={formData.code}
          onChangeText={(text) => setFormData({ ...formData, code: text })}
          error={errors.code}
          required
        />
        <Input
          label="Phone"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />
        <Input
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        <Input
          label="Address"
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          multiline
          numberOfLines={3}
        />
        <View style={styles.buttonRow}>
          <Button
            title="Cancel"
            onPress={() => {
              setModalVisible(false);
              resetForm();
            }}
            variant="secondary"
            style={styles.buttonHalf}
          />
          <Button
            title={editingSupplier ? 'Update' : 'Create'}
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.buttonHalf}
          />
        </View>
      </FormModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  count: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  code: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#34C759',
  },
  badgeInactive: {
    backgroundColor: '#FF9500',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  buttonHalf: {
    flex: 1,
  },
});

export default SuppliersScreen;
