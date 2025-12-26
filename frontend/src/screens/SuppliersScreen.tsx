import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'balance'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSuppliers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filterActive]);
  
  // Reload when sort changes
  useEffect(() => {
    if (!isLoading) {
      loadSuppliers();
    }
  }, [sortBy, sortOrder]);

  const loadSuppliers = async () => {
    try {
      const params: any = { per_page: 50, include_balance: true };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (filterActive !== undefined) {
        params.is_active = filterActive;
      }
      const response = await supplierService.getAll(params);
      let data = response.data || [];
      
      // Client-side sorting
      data = data.sort((a: Supplier, b: Supplier) => {
        let compareA, compareB;
        
        switch (sortBy) {
          case 'name':
            compareA = a.name.toLowerCase();
            compareB = b.name.toLowerCase();
            break;
          case 'code':
            compareA = a.code.toLowerCase();
            compareB = b.code.toLowerCase();
            break;
          case 'balance':
            compareA = typeof a.balance === 'number' ? a.balance : 0;
            compareB = typeof b.balance === 'number' ? b.balance : 0;
            break;
        }
        
        if (sortOrder === 'asc') {
          return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
        } else {
          return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
        }
      });
      
      setSuppliers(data);
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
      
      {/* Balance Information */}
      {typeof item.balance !== 'undefined' && (
        <View style={styles.balanceContainer}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Total Collections:</Text>
            <Text style={styles.balanceValue}>Rs. {(item.total_collections || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Total Payments:</Text>
            <Text style={styles.balanceValue}>Rs. {(item.total_payments || 0).toFixed(2)}</Text>
          </View>
          <View style={[styles.balanceRow, styles.balanceTotal]}>
            <Text style={styles.balanceTotalLabel}>Balance:</Text>
            <Text style={[
              styles.balanceTotalValue,
              item.balance > 0 ? styles.positiveBalance : item.balance < 0 ? styles.negativeBalance : {}
            ]}>
              Rs. {item.balance.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
      
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
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, code, or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>
      
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterActive === undefined && styles.filterButtonActive]}
          onPress={() => setFilterActive(undefined)}
        >
          <Text style={[styles.filterButtonText, filterActive === undefined && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterActive === true && styles.filterButtonActive]}
          onPress={() => setFilterActive(true)}
        >
          <Text style={[styles.filterButtonText, filterActive === true && styles.filterButtonTextActive]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterActive === false && styles.filterButtonActive]}
          onPress={() => setFilterActive(false)}
        >
          <Text style={[styles.filterButtonText, filterActive === false && styles.filterButtonTextActive]}>
            Inactive
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
          onPress={() => {
            if (sortBy === 'name') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('name');
              setSortOrder('asc');
            }
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>
            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'code' && styles.sortButtonActive]}
          onPress={() => {
            if (sortBy === 'code') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('code');
              setSortOrder('asc');
            }
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'code' && styles.sortButtonTextActive]}>
            Code {sortBy === 'code' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'balance' && styles.sortButtonActive]}
          onPress={() => {
            if (sortBy === 'balance') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('balance');
              setSortOrder('asc');
            }
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'balance' && styles.sortButtonTextActive]}>
            Balance {sortBy === 'balance' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
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
  searchContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  filterContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  sortContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sortLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sortButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#fff',
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
  balanceContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#666',
  },
  balanceValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  balanceTotal: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  balanceTotalLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  },
  balanceTotalValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  positiveBalance: {
    color: '#34C759',
  },
  negativeBalance: {
    color: '#FF3B30',
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
