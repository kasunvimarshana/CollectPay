import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, CardContent, Badge, StatusBadge } from '../../src/components/ui';
import { usePayments, useAuth, useSync } from '../../src/hooks';
import { colors, spacing, typography, shadows } from '../../src/theme';
import { Payment } from '../../src/domain/entities';

export default function PaymentsScreen() {
  const { hasPermission } = useAuth();
  const { isSyncing } = useSync();
  const [selectedMethod, setSelectedMethod] = useState<string | undefined>();

  const { payments, isLoading, refresh } = usePayments({
    method: selectedMethod as Payment['method'],
  });

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-LK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const methods = ['All', 'cash', 'bank_transfer', 'cheque', 'mobile_money'] as const;

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const completedCount = payments.filter((p) => p.status === 'completed').length;

  const getMethodIcon = (method: Payment['method']) => {
    const icons: Record<Payment['method'], string> = {
      cash: '💵',
      bank_transfer: '🏦',
      cheque: '📝',
      mobile_money: '📱',
    };
    return icons[method] || '💰';
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      bank_transfer: 'Bank',
      cheque: 'Cheque',
      mobile_money: 'Mobile',
    };
    return labels[method] || method;
  };

  const renderPayment = ({ item }: { item: Payment }) => (
    <TouchableOpacity
      onPress={() => router.push(`/payments/${item.id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.paymentCard}>
        <CardContent>
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <View style={styles.methodRow}>
                <Text style={styles.methodIcon}>{getMethodIcon(item.method)}</Text>
                <Text style={styles.methodText}>{getMethodLabel(item.method)}</Text>
              </View>
              <Text style={styles.reference}>{item.referenceNumber}</Text>
            </View>
            <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
          </View>

          <View style={styles.paymentDetails}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(new Date(item.paidAt))}</Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Supplier</Text>
              <Text style={styles.detailValue}>{item.supplierId.slice(0, 8)}...</Text>
            </View>
            <View style={styles.badges}>
              <StatusBadge status={item.status} />
              {item.syncStatus !== 'synced' && (
                <Badge
                  label={item.syncStatus}
                  variant={item.syncStatus === 'pending' ? 'warning' : 'error'}
                  size="sm"
                />
              )}
            </View>
          </View>

          {item.notes && (
            <Text style={styles.notes} numberOfLines={1}>
              📝 {item.notes}
            </Text>
          )}
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Summary Card */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{payments.length}</Text>
          <Text style={styles.summaryLabel}>Total Payments</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{completedCount}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardWide]}>
          <Text style={styles.summaryValueLarge}>{formatCurrency(totalPaid)}</Text>
          <Text style={styles.summaryLabel}>Total Paid</Text>
        </View>
      </View>

      {/* Method Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={methods}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                (item === 'All' && !selectedMethod) || selectedMethod === item
                  ? styles.filterChipActive
                  : null,
              ]}
              onPress={() => setSelectedMethod(item === 'All' ? undefined : item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  (item === 'All' && !selectedMethod) || selectedMethod === item
                    ? styles.filterChipTextActive
                    : null,
                ]}
              >
                {item === 'All' ? 'All' : getMethodLabel(item)}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Payments List */}
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderPayment}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading || isSyncing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>No payments</Text>
            <Text style={styles.emptySubtext}>
              Tap + to make a new payment
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      {hasPermission('create:payments') && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/payments/new')}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  summaryCardWide: {
    width: '100%',
    flex: undefined,
    minWidth: undefined,
  },
  summaryValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  summaryValueLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.success.main,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  filterContainer: {
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.background.default,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl + 60,
  },
  paymentCard: {
    marginBottom: spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  paymentInfo: {
    flex: 1,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  methodIcon: {
    fontSize: 18,
  },
  methodText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  reference: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  amount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.success.main,
  },
  paymentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  notes: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.light,
  },
});
