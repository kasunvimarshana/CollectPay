import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent, Button, Badge, StatusBadge, SyncStatusBadge } from '../../../src/components/ui';
import { usePayments, useAuth, useSupplier } from '../../../src/hooks';
import { colors, spacing, typography } from '../../../src/theme';
import { Payment } from '../../../src/domain/entities';

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const { payments, isLoading, deletePayment } = usePayments({});
  
  const payment = payments.find((p) => p.id === id);
  const { supplier } = useSupplier(payment?.supplierId || '');

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('en-LK', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  };

  const getMethodIcon = (method: Payment['method']) => {
    const icons: Record<Payment['method'], string> = {
      cash: '💵',
      bank_transfer: '🏦',
      cheque: '📝',
      mobile_money: '📱',
    };
    return icons[method] || '💰';
  };

  const getMethodLabel = (method: Payment['method']) => {
    const labels: Record<Payment['method'], string> = {
      cash: 'Cash Payment',
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque Payment',
      mobile_money: 'Mobile Money',
    };
    return labels[method] || method;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePayment(id);
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading || !payment) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Payment Details',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Status Header */}
          <Card style={styles.headerCard}>
            <CardContent>
              <View style={styles.statusRow}>
                <StatusBadge status={payment.status} />
                <SyncStatusBadge status={payment.syncStatus} />
              </View>
              <View style={styles.methodRow}>
                <Text style={styles.methodIcon}>{getMethodIcon(payment.method)}</Text>
                <Text style={styles.methodLabel}>{getMethodLabel(payment.method)}</Text>
              </View>
            </CardContent>
          </Card>

          {/* Amount Card */}
          <Card style={styles.amountCard}>
            <CardContent>
              <Text style={styles.amountLabel}>Payment Amount</Text>
              <Text style={styles.amountValue}>
                {formatCurrency(payment.amount)}
              </Text>
              <Text style={styles.referenceNumber}>
                Ref: {payment.referenceNumber}
              </Text>
            </CardContent>
          </Card>

          {/* Payment Date */}
          <Text style={styles.sectionTitle}>Payment Date</Text>
          <Card>
            <CardContent>
              <Text style={styles.paymentDate}>
                {formatDate(payment.paidAt)}
              </Text>
            </CardContent>
          </Card>

          {/* Supplier Info */}
          <Text style={styles.sectionTitle}>Paid To</Text>
          <TouchableOpacity onPress={() => supplier && router.push(`/suppliers/${supplier.id}`)}>
            <Card>
              <CardContent>
                <View style={styles.supplierRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {supplier?.name?.charAt(0).toUpperCase() || 'S'}
                    </Text>
                  </View>
                  <View style={styles.supplierInfo}>
                    <Text style={styles.supplierName}>{supplier?.name || 'Unknown'}</Text>
                    <Text style={styles.supplierCode}>{supplier?.code || '-'}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>

          {/* Payment Details */}
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <Card>
            <CardContent>
              <InfoRow label="Method" value={getMethodLabel(payment.method)} />
              <View style={styles.divider} />
              <InfoRow label="Reference" value={payment.referenceNumber} />
              <View style={styles.divider} />
              <InfoRow label="Paid By" value={payment.paidBy.slice(0, 12) + '...'} />
            </CardContent>
          </Card>

          {/* Notes */}
          {payment.notes && (
            <>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Card>
                <CardContent>
                  <Text style={styles.notes}>{payment.notes}</Text>
                </CardContent>
              </Card>
            </>
          )}

          {/* Record Info */}
          <Text style={styles.sectionTitle}>Record Info</Text>
          <Card>
            <CardContent>
              <InfoRow label="ID" value={payment.id.slice(0, 16) + '...'} />
              <View style={styles.divider} />
              <InfoRow 
                label="Created" 
                value={new Date(payment.createdAt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })} 
              />
              <View style={styles.divider} />
              <InfoRow 
                label="Updated" 
                value={new Date(payment.updatedAt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })} 
              />
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version</Text>
                <Badge label={`v${payment.version}`} variant="default" size="sm" />
              </View>
            </CardContent>
          </Card>

          {/* Delete Button */}
          {hasPermission('delete:payments') && payment.status === 'pending' && (
            <Button
              title="Delete Payment"
              variant="danger"
              onPress={handleDelete}
              style={styles.deleteButton}
              fullWidth
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  methodIcon: {
    fontSize: 24,
  },
  methodLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  amountCard: {
    backgroundColor: colors.primary[50],
    marginBottom: spacing.md,
  },
  amountLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: typography.fontSize.xxl + 8,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  referenceNumber: {
    fontSize: typography.fontSize.md,
    color: colors.primary[500],
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginLeft: spacing.xs,
  },
  paymentDate: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  supplierCode: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  arrow: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  notes: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: 22,
  },
  deleteButton: {
    marginTop: spacing.lg,
  },
});
