import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { collectionService, supplierService, productService } from '../services/api';

export default function CollectionsScreen({ navigation }) {
  const [collections, setCollections] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    supplier_id: '',
    product_id: '',
    collection_date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: 'kg',
    rate_applied: '',
    notes: '',
  });

  useEffect(() => {
    loadCollections();
    loadSuppliers();
    loadProducts();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await collectionService.getAll();
      setCollections(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load collections');
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getAll({ is_active: true });
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getAll({ is_active: true });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCollections();
    setRefreshing(false);
  }, []);

  const openCreateModal = () => {
    setEditingCollection(null);
    setFormData({
      supplier_id: '',
      product_id: '',
      collection_date: new Date().toISOString().split('T')[0],
      quantity: '',
      unit: 'kg',
      rate_applied: '',
      notes: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (collection) => {
    setEditingCollection(collection);
    setFormData({
      supplier_id: collection.supplier_id?.toString() || '',
      product_id: collection.product_id?.toString() || '',
      collection_date: collection.collection_date || new Date().toISOString().split('T')[0],
      quantity: collection.quantity?.toString() || '',
      unit: collection.unit || 'kg',
      rate_applied: collection.rate_applied?.toString() || '',
      notes: collection.notes || '',
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.supplier_id || !formData.product_id || !formData.quantity || !formData.rate_applied) {
      Alert.alert('Error', 'Supplier, Product, Quantity, and Rate are required');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        supplier_id: parseInt(formData.supplier_id),
        product_id: parseInt(formData.product_id),
        quantity: parseFloat(formData.quantity),
        rate_applied: parseFloat(formData.rate_applied),
      };

      if (editingCollection) {
        await collectionService.update(editingCollection.id, submitData);
        Alert.alert('Success', 'Collection updated successfully');
      } else {
        await collectionService.create(submitData);
        Alert.alert('Success', 'Collection created successfully');
      }
      setModalVisible(false);
      loadCollections();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save collection');
      console.error('Error saving collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (collection) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await collectionService.delete(collection.id);
              Alert.alert('Success', 'Collection deleted successfully');
              loadCollections();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete collection');
              console.error('Error deleting collection:', error);
            }
          },
        },
      ]
    );
  };

  const renderCollectionItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {item.supplier?.name || `Supplier #${item.supplier_id}`}
        </Text>
        <Text style={styles.cardAmount}>
          ${parseFloat(item.total_amount || 0).toFixed(2)}
        </Text>
      </View>
      <Text style={styles.cardSubtitle}>
        Product: {item.product?.name || `Product #${item.product_id}`}
      </Text>
      <Text style={styles.cardText}>
        Quantity: {item.quantity} {item.unit}
      </Text>
      <Text style={styles.cardText}>
        Rate: ${parseFloat(item.rate_applied || 0).toFixed(2)} per {item.unit}
      </Text>
      <Text style={styles.cardText}>
        Date: {item.collection_date}
      </Text>
      {item.notes && <Text style={styles.cardNotes}>Notes: {item.notes}</Text>}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const PickerModal = ({ visible, onClose, options, value, onChange, title }) => (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContent}>
          <Text style={styles.pickerTitle}>{title}</Text>
          <ScrollView style={styles.pickerList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pickerItem,
                  value === option.value && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  onChange(option.value);
                  onClose();
                }}
              >
                <Text style={[
                  styles.pickerItemText,
                  value === option.value && styles.pickerItemTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.pickerCloseButton} onPress={onClose}>
            <Text style={styles.pickerCloseButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const [supplierPickerVisible, setSupplierPickerVisible] = useState(false);
  const [productPickerVisible, setProductPickerVisible] = useState(false);

  const supplierOptions = suppliers.map(s => ({ value: s.id.toString(), label: s.name }));
  const productOptions = products.map(p => ({ value: p.id.toString(), label: p.name }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Collections</Text>
      <Text style={styles.subtitle}>Record and manage daily collections</Text>

      <TouchableOpacity style={styles.button} onPress={openCreateModal}>
        <Text style={styles.buttonText}>+ Add New Collection</Text>
      </TouchableOpacity>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
      ) : (
        <FlatList
          data={collections}
          renderItem={renderCollectionItem}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No collections found</Text>
            </View>
          }
          contentContainerStyle={collections.length === 0 ? styles.emptyList : null}
        />
      )}

      {/* Create/Edit Modal */}
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
                {editingCollection ? 'Edit Collection' : 'Add New Collection'}
              </Text>

              <Text style={styles.label}>Supplier *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setSupplierPickerVisible(true)}
              >
                <Text style={[styles.pickerButtonText, !formData.supplier_id && styles.placeholderText]}>
                  {formData.supplier_id 
                    ? suppliers.find(s => s.id.toString() === formData.supplier_id)?.name || 'Select Supplier'
                    : 'Select Supplier'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Product *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setProductPickerVisible(true)}
              >
                <Text style={[styles.pickerButtonText, !formData.product_id && styles.placeholderText]}>
                  {formData.product_id 
                    ? products.find(p => p.id.toString() === formData.product_id)?.name || 'Select Product'
                    : 'Select Product'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Collection Date *</Text>
              <TextInput
                style={styles.input}
                value={formData.collection_date}
                onChangeText={(text) => setFormData({ ...formData, collection_date: text })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                value={formData.quantity}
                onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                placeholder="e.g., 100.5"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Unit *</Text>
              <TextInput
                style={styles.input}
                value={formData.unit}
                onChangeText={(text) => setFormData({ ...formData, unit: text })}
                placeholder="e.g., kg, liters"
              />

              <Text style={styles.label}>Rate per Unit *</Text>
              <TextInput
                style={styles.input}
                value={formData.rate_applied}
                onChangeText={(text) => setFormData({ ...formData, rate_applied: text })}
                placeholder="e.g., 25.50"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Optional notes"
                multiline
                numberOfLines={3}
              />

              {formData.quantity && formData.rate_applied && (
                <View style={styles.calculationBox}>
                  <Text style={styles.calculationLabel}>Total Amount:</Text>
                  <Text style={styles.calculationValue}>
                    ${(parseFloat(formData.quantity) * parseFloat(formData.rate_applied)).toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Saving...' : editingCollection ? 'Update' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Supplier Picker */}
      <PickerModal
        visible={supplierPickerVisible}
        onClose={() => setSupplierPickerVisible(false)}
        options={supplierOptions}
        value={formData.supplier_id}
        onChange={(value) => setFormData({ ...formData, supplier_id: value })}
        title="Select Supplier"
      />

      {/* Product Picker */}
      <PickerModal
        visible={productPickerVisible}
        onClose={() => setProductPickerVisible(false)}
        options={productOptions}
        value={formData.product_id}
        onChange={(value) => setFormData({ ...formData, product_id: value })}
        title="Select Product"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
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
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 3,
  },
  cardNotes: {
    fontSize: 13,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: 5,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#bdc3c7',
    fontSize: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  placeholderText: {
    color: '#95a5a6',
  },
  calculationBox: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calculationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  calculationValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#27ae60',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  pickerList: {
    maxHeight: 400,
  },
  pickerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  pickerItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  pickerItemTextSelected: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  pickerCloseButton: {
    backgroundColor: '#95a5a6',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  pickerCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
