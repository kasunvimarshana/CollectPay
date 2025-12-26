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
import { useCollections, useAuth, useSync } from '../../src/hooks';
import { colors, spacing, typography, shadows } from '../../src/theme';
import { Collection } from '../../src/domain/entities';

export default function CollectionsScreen() {
  const { hasPermission } = useAuth();
  const { isSyncing } = useSync();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const getDateRange = () => {
    const now = new Date();
    const startDate = new Date(now);
    
    switch (selectedPeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    return { startDate, endDate: now };
  };

  const { startDate, endDate } = getDateRange();
  const { collections, isLoading, refresh, deleteCollection } = useCollections({
    startDate,
    endDate,
  });

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-LK', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ] as const;

  const totalQuantity = collections.reduce((sum, c) => sum + c.quantity, 0);
  const totalAmount = collections.reduce((sum, c) => sum + c.totalAmount, 0);

  const renderCollection = ({ item }: { item: Collection }) => (
    <TouchableOpacity
      onPress={() => router.push(`/collections/${item.id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.collectionCard}>
        <CardContent>
          <View style={styles.collectionHeader}>
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionDate}>
                {formatDate(new Date(item.collectedAt))}
              </Text>
              <Text style={styles.supplierRef}>
                Supplier: {item.supplierId.slice(0, 8)}...
              </Text>
            </View>
            <View style={styles.badges}>
              <StatusBadge status={item.status} />
              {item.syncStatus !== 'synced' && (
                <Badge
                  label={item.syncStatus}
                  variant={item.syncStatus === 'pending' ? 'warning' : 'error'}
                />
              )}
            </View>
          </View>

          <View style={styles.collectionDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Quantity</Text>
              <Text style={styles.detailValue}>{item.quantity} {item.unit}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Rate</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(item.rateAtCollection)}/{item.unit}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(item.totalAmount)}</Text>
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
          <Text style={styles.summaryValue}>{collections.length}</Text>
          <Text style={styles.summaryLabel}>Collections</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalQuantity.toFixed(1)} kg</Text>
          <Text style={styles.summaryLabel}>Total Qty</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardWide]}>
          <Text style={styles.summaryValueLarge}>{formatCurrency(totalAmount)}</Text>
          <Text style={styles.summaryLabel}>Total Value</Text>
        </View>
      </View>

      {/* Period Filter */}
      <View style={styles.periodContainer}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.periodButtonTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Collections List */}
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        renderItem={renderCollection}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading || isSyncing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No collections</Text>
            <Text style={styles.emptySubtext}>
              Tap + to add a new collection
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      {hasPermission('create:collections') && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/collections/new')}
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
  periodContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.background.paper,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary[500],
  },
  periodButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  periodButtonTextActive: {
    color: colors.text.inverse,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl + 60,
  },
  collectionCard: {
    marginBottom: spacing.md,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionDate: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  supplierRef: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  collectionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.success.main,
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
