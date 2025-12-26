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
import { paymentService, supplierService } from '../services/api';

export default function PaymentsScreen({ navigation }) {
  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    supplier_id: '',
    payment_type: 'advance',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    loadPayments();
    loadSuppliers();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAll();
      setPayments(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load payments');
      console.error('Error loading payments:', error);
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  }, []);

  const openCreateModal = () => {
    setEditingPayment(null);
    setFormData({
      supplier_id: '',
      payment_type: 'advance',
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      reference_number: '',
      notes: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (payment) => {
    setEditingPayment(payment);
    setFormData({
      supplier_id: payment.supplier_id?.toString() || '',
      payment_type: payment.payment_type || 'advance',
      amount: payment.amount?.toString() || '',
      payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
      payment_method: payment.payment_method || 'cash',
      reference_number: payment.reference_number || '',
      notes: payment.notes || '',
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.supplier_id || !formData.amount) {
      Alert.alert('Error', 'Supplier and Amount are required');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        supplier_id: parseInt(formData.supplier_id),
        amount: parseFloat(formData.amount),
      };

      if (editingPayment) {
        await paymentService.update(editingPayment.id, submitData);
        Alert.alert('Success', 'Payment updated successfully');
      } else {
        await paymentService.create(submitData);
        Alert.alert('Success', 'Payment created successfully');
      }
      setModalVisible(false);
      loadPayments();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save payment');
      console.error('Error saving payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (payment) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentService.delete(payment.id);
              Alert.alert('Success', 'Payment deleted successfully');
              loadPayments();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete payment');
              console.error('Error deleting payment:', error);
            }
          },
        },
      ]
    );
  };

  const handleApprove = (payment) => {
    Alert.alert(
      'Confirm Approval',
      `Are you sure you want to approve this payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await paymentService.approve(payment.id);
              Alert.alert('Success', 'Payment approved successfully');
              loadPayments();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to approve payment');
              console.error('Error approving payment:', error);
            }
          },
        },
      ]
    );
  };

  const renderPaymentItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {item.supplier?.name || `Supplier #${item.supplier_id}`}
        </Text>
        <Text style={styles.cardAmount}>
          ${parseFloat(item.amount || 0).toFixed(2)}
        </Text>
      </View>
      <View style={styles.cardRow}>
        <View style={[styles.typeBadge, getPaymentTypeStyle(item.payment_type)]}>
          <Text style={styles.typeBadgeText}>{item.payment_type || 'N/A'}</Text>
        </View>
        {item.approved_by && (
          <View style={styles.approvedBadge}>
            <Text style={styles.approvedBadgeText}>Approved</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardText}>Method: {item.payment_method || 'N/A'}</Text>
      <Text style={styles.cardText}>Date: {item.payment_date}</Text>
      {item.reference_number && (
        <Text style={styles.cardText}>Ref: {item.reference_number}</Text>
      )}
      {item.notes && <Text style={styles.cardNotes}>Notes: {item.notes}</Text>}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
        {!item.approved_by && (
          <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(item)}>
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getPaymentTypeStyle = (type) => {
    switch (type) {
      case 'advance':
        return styles.typeAdvance;
      case 'partial':
        return styles.typePartial;
      case 'full':
        return styles.typeFull;
      default:
        return styles.typeDefault;
    }
  };

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
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [methodPickerVisible, setMethodPickerVisible] = useState(false);

  const supplierOptions = suppliers.map(s => ({ value: s.id.toString(), label: s.name }));
  const typeOptions = [
    { value: 'advance', label: 'Advance' },
    { value: 'partial', label: 'Partial' },
    { value: 'full', label: 'Full' },
  ];
  const methodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'mobile_payment', label: 'Mobile Payment' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payments</Text>
      <Text style={styles.subtitle}>Manage advance and partial payments</Text>

      <TouchableOpacity style={styles.button} onPress={openCreateModal}>
        <Text style={styles.buttonText}>+ Add New Payment</Text>
      </TouchableOpacity>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No payments found</Text>
            </View>
          }
          contentContainerStyle={payments.length === 0 ? styles.emptyList : null}
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
                {editingPayment ? 'Edit Payment' : 'Add New Payment'}
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

              <Text style={styles.label}>Payment Type *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setTypePickerVisible(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {typeOptions.find(t => t.value === formData.payment_type)?.label || 'Select Type'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Amount *</Text>
              <TextInput
                style={styles.input}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="e.g., 1000.00"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Payment Date *</Text>
              <TextInput
                style={styles.input}
                value={formData.payment_date}
                onChangeText={(text) => setFormData({ ...formData, payment_date: text })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>Payment Method *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setMethodPickerVisible(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {methodOptions.find(m => m.value === formData.payment_method)?.label || 'Select Method'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Reference Number</Text>
              <TextInput
                style={styles.input}
                value={formData.reference_number}
                onChangeText={(text) => setFormData({ ...formData, reference_number: text })}
                placeholder="Optional reference number"
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
                    {loading ? 'Saving...' : editingPayment ? 'Update' : 'Create'}
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

      {/* Payment Type Picker */}
      <PickerModal
        visible={typePickerVisible}
        onClose={() => setTypePickerVisible(false)}
        options={typeOptions}
        value={formData.payment_type}
        onChange={(value) => setFormData({ ...formData, payment_type: value })}
        title="Select Payment Type"
      />

      {/* Payment Method Picker */}
      <PickerModal
        visible={methodPickerVisible}
        onClose={() => setMethodPickerVisible(false)}
        options={methodOptions}
        value={formData.payment_method}
        onChange={(value) => setFormData({ ...formData, payment_method: value })}
        title="Select Payment Method"
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeAdvance: {
    backgroundColor: '#3498db',
  },
  typePartial: {
    backgroundColor: '#f39c12',
  },
  typeFull: {
    backgroundColor: '#27ae60',
  },
  typeDefault: {
    backgroundColor: '#95a5a6',
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  approvedBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  approveButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButtonText: {
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
