/**
 * Payment Detail Screen
 * Displays detailed payment information
 */

import React, { useState, useEffect } from 'react';
import THEME from '../../core/constants/theme';
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
        <ActivityIndicator size="large" color={THEME.colors.primary} />
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + THEME.spacing.lg }}>
      <View style={[styles.header, { paddingTop: insets.top + THEME.spacing.base }]}>
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
    backgroundColor: THEME.colors.background,
  },
  header: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backButton: {
    marginBottom: THEME.spacing.sm,
  },
  backButtonText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.primary,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  section: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    marginTop: THEME.spacing.md,
  },
  typeRow: {
    marginBottom: THEME.spacing.base,
  },
  typeBadge: {
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.lg,
    alignSelf: 'flex-start',
  },
  typeText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
  },
  detailLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    width: 140,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  detailValue: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingVertical: THEME.spacing.base,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.colors.border,
  },
  amountLabel: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
  },
  amountValue: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.success,
  },
  notesContainer: {
    marginTop: THEME.spacing.base,
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.gray50,
    borderRadius: THEME.borderRadius.base,
  },
  notesLabel: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: THEME.spacing.base,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  editButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: THEME.colors.error,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  errorText: {
    fontSize: THEME.typography.fontSize.lg,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.base,
  },
  backText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.primary,
  },
});
