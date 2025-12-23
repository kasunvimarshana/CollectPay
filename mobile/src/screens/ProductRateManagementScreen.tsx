import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import {
  setProductRates,
  addProductRate,
  updateProductRate,
  deleteProductRate,
  setLoading,
  setError,
  setSelectedProductId,
} from '../store/slices/productRatesSlice';
import apiService from '../services/api';
import { ProductRate } from '../types';

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export default function ProductRateManagementScreen() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(state => state.products.items);
  const productRates = useAppSelector(state => state.productRates.items);
  const selectedProductId = useAppSelector(state => state.productRates.selectedProductId);
  const loading = useAppSelector(state => state.productRates.loading);
  const user = useAppSelector(state => state.auth.user);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRate, setEditingRate] = useState<ProductRate | null>(null);
  const [formData, setFormData] = useState({
    rate: '',
    effective_from: '',
    effective_to: '',
  });

  useEffect(() => {
    if (selectedProductId) {
      loadProductRates(selectedProductId);
    }
  }, [selectedProductId]);

  const loadProductRates = async (productId: number) => {
    try {
      dispatch(setLoading(true));
      const response = await apiService.getProductRates(productId);
      dispatch(setProductRates(response.data || []));
      dispatch(setError(null));
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to load product rates'));
      Alert.alert('Error', 'Failed to load product rates');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSelectProduct = (productId: number) => {
    dispatch(setSelectedProductId(productId));
  };

  const handleAddRate = () => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      Alert.alert('Permission Denied', 'You do not have permission to add product rates');
      return;
    }
    setEditingRate(null);
    setFormData({ rate: '', effective_from: '', effective_to: '' });
    setModalVisible(true);
  };

  const handleEditRate = (rate: ProductRate) => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      Alert.alert('Permission Denied', 'You do not have permission to edit product rates');
      return;
    }
    setEditingRate(rate);
    setFormData({
      rate: rate.rate.toString(),
      effective_from: rate.effective_from.split('T')[0],
      effective_to: rate.effective_to ? rate.effective_to.split('T')[0] : '',
    });
    setModalVisible(true);
  };

  const handleDeleteRate = async (rateId: number) => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      Alert.alert('Permission Denied', 'You do not have permission to delete product rates');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this rate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!selectedProductId) return;
              await apiService.deleteProductRate(selectedProductId, rateId);
              dispatch(deleteProductRate(rateId));
              Alert.alert('Success', 'Rate deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete rate');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!selectedProductId) return;

    if (!formData.rate || !formData.effective_from) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      const data = {
        rate: parseFloat(formData.rate),
        effective_from: formData.effective_from,
        effective_to: formData.effective_to || undefined,
      };

      if (editingRate) {
        const response = await apiService.updateProductRate(selectedProductId, editingRate.id, data);
        dispatch(updateProductRate(response));
        Alert.alert('Success', 'Rate updated successfully');
      } else {
        const response = await apiService.createProductRate(selectedProductId, data);
        dispatch(addProductRate(response));
        Alert.alert('Success', 'Rate added successfully');
      }

      setModalVisible(false);
      setFormData({ rate: '', effective_from: '', effective_to: '' });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save rate');
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const canManageRates = user && (user.role === 'admin' || user.role === 'manager');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Product Rate Management</Text>
      </View>

      {!selectedProductId ? (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Select a Product</Text>
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => handleSelectProduct(item.id)}
              >
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productInfo}>
                  Base Rate: ${item.base_rate} | Current: ${item.current_rate || item.base_rate}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No products available</Text>
              </View>
            }
          />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.productHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => dispatch(setSelectedProductId(null))}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.productTitle}>{selectedProduct?.name}</Text>
          </View>

          {canManageRates && (
            <TouchableOpacity style={styles.addButton} onPress={handleAddRate}>
              <Text style={styles.addButtonText}>+ Add New Rate</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={productRates}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.rateCard}>
                <View style={styles.rateInfo}>
                  <Text style={styles.rateAmount}>${item.rate}</Text>
                  <Text style={styles.rateDate}>
                    Effective From: {formatDate(item.effective_from)}
                  </Text>
                  {item.effective_to && (
                    <Text style={styles.rateDate}>
                      Effective To: {formatDate(item.effective_to)}
                    </Text>
                  )}
                  {item.creator && (
                    <Text style={styles.rateCreator}>Created by: {item.creator.name}</Text>
                  )}
                </View>
                {canManageRates && (
                  <View style={styles.rateActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditRate(item)}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRate(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No rates defined for this product</Text>
                <Text style={styles.emptySubtext}>Using base rate: ${selectedProduct?.base_rate}</Text>
              </View>
            }
          />
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingRate ? 'Edit Rate' : 'Add New Rate'}
              </Text>

              <Text style={styles.label}>Rate *</Text>
              <TextInput
                style={styles.input}
                value={formData.rate}
                onChangeText={(text) => setFormData({ ...formData, rate: text })}
                keyboardType="decimal-pad"
                placeholder="Enter rate"
              />

              <Text style={styles.label}>Effective From *</Text>
              <TextInput
                style={styles.input}
                value={formData.effective_from}
                onChangeText={(text) => setFormData({ ...formData, effective_from: text })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>Effective To (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.effective_to}
                onChangeText={(text) => setFormData({ ...formData, effective_to: text })}
                placeholder="YYYY-MM-DD"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 15,
    backgroundColor: '#fff',
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  productInfo: {
    fontSize: 14,
    color: '#666',
  },
  productHeader: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rateCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rateInfo: {
    flex: 1,
  },
  rateAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  rateDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  rateCreator: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  rateActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
