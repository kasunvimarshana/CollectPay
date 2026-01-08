/**
 * Payment Detail Screen
 * Displays detailed payment information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { Payment } from '../../domain/entities/Payment';

export const PaymentDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const paymentId = (route.params as any)?.paymentId;
  const insets = useSafeAreaInsets();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  const loadPayment = async () => {
    try {
      const response = await apiClient.get(`/payments/${paymentId}`);
      if (response.success) {
        setPayment(response.data as any);
      }
    } catch (error) {
      console.error('Error loading payment:', error);
      Alert.alert('Error', 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    (navigation.navigate as any)('PaymentForm', { paymentId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      await apiClient.delete(`/payments/${paymentId}`);
      Alert.alert('Success', 'Payment deleted successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting payment:', error);
      Alert.alert('Error', 'Failed to delete payment');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'advance':
        return '#FF9800';
      case 'partial':
        return '#2196F3';
      case 'full':
        return '#4CAF50';
      case 'adjustment':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading payment...</Text>
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Payment not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment Details</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.typeRow}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(payment.type) }]}>
            <Text style={styles.typeText}>{payment.type.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Supplier:</Text>
          <Text style={styles.detailValue}>{payment.supplier?.name || 'Unknown'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Date:</Text>
          <Text style={styles.detailValue}>
            {new Date(payment.payment_date).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Amount:</Text>
          <Text style={styles.amountValue}>${payment.amount.toFixed(2)}</Text>
        </View>

        {payment.reference_number && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference Number:</Text>
            <Text style={styles.detailValue}>{payment.reference_number}</Text>
          </View>
        )}

        {payment.payment_method && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>
              {payment.payment_method.replace('_', ' ').split(' ').map(w => 
                w.charAt(0).toUpperCase() + w.slice(1)
              ).join(' ')}
            </Text>
          </View>
        )}

        {payment.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{payment.notes}</Text>
          </View>
        )}

        {payment.user && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recorded By:</Text>
            <Text style={styles.detailValue}>{payment.user.name}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created:</Text>
          <Text style={styles.detailValue}>
            {new Date(payment.created_at).toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Edit Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  typeRow: {
    marginBottom: 16,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  typeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 140,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  amountLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  notesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#007bff',
  },
});
