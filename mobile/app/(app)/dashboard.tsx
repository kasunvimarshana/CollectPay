import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent, Badge, SyncStatusBadge } from '../../src/components/ui';
import { useAuth, useSync, useCollectionSummary } from '../../src/hooks';
import { colors, spacing, typography, shadows } from '../../src/theme';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { isSyncing, pendingChangesCount, lastSyncTimestamp, sync } = useSync();
  const { summary, isLoading: summaryLoading, refresh: refreshSummary } = useCollectionSummary({
    startDate: getStartOfMonth(),
    endDate: new Date(),
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([sync(), refreshSummary()]);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return date.toLocaleString('en-LK', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <View style={styles.roleContainer}>
            <Badge
              label={user?.role?.toUpperCase() || 'USER'}
              variant="primary"
            />
          </View>
        </View>

        {/* Sync Status */}
        <TouchableOpacity onPress={sync} disabled={isSyncing}>
          <Card style={styles.syncCard}>
            <CardContent>
              <View style={styles.syncRow}>
                <View>
                  <Text style={styles.syncLabel}>Sync Status</Text>
                  <Text style={styles.syncTime}>
                    Last: {formatDate(lastSyncTimestamp)}
                  </Text>
                </View>
                <View style={styles.syncBadges}>
                  {pendingChangesCount > 0 && (
                    <SyncStatusBadge status="pending" count={pendingChangesCount} />
                  )}
                  <SyncStatusBadge
                    status={isSyncing ? 'Syncing...' : 'Synced'}
                  />
                </View>
              </View>
            </CardContent>
          </Card>
        </TouchableOpacity>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary?.count || 0}</Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {(summary?.totalQuantity || 0).toFixed(1)} kg
            </Text>
            <Text style={styles.statLabel}>Total Quantity</Text>
          </View>
          <View style={[styles.statCard, styles.statCardWide]}>
            <Text style={styles.statValueLarge}>
              {formatCurrency(summary?.totalAmount || 0)}
            </Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <QuickAction
            icon="📦"
            label="New Collection"
            onPress={() => {/* TODO: Navigate */}}
          />
          <QuickAction
            icon="💰"
            label="New Payment"
            onPress={() => {/* TODO: Navigate */}}
          />
          <QuickAction
            icon="👥"
            label="View Suppliers"
            onPress={() => {/* TODO: Navigate */}}
          />
          <QuickAction
            icon="📊"
            label="Reports"
            onPress={() => {/* TODO: Navigate */}}
          />
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Product Breakdown</Text>
        <Card>
          <CardContent>
            {summary?.byProduct && summary.byProduct.length > 0 ? (
              summary.byProduct.map((item, index) => (
                <View
                  key={item.productId}
                  style={[
                    styles.productRow,
                    index < summary.byProduct.length - 1 && styles.productRowBorder,
                  ]}
                >
                  <View>
                    <Text style={styles.productName}>
                      Product #{item.productId.slice(0, 8)}
                    </Text>
                    <Text style={styles.productQuantity}>
                      {item.quantity.toFixed(2)} kg
                    </Text>
                  </View>
                  <Text style={styles.productAmount}>
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No collections this month</Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const QuickAction = ({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Text style={styles.actionIcon}>{icon}</Text>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  roleContainer: {
    alignItems: 'flex-end',
  },
  syncCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primary[50],
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  syncTime: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  syncBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  statCardWide: {
    width: '100%',
    flex: undefined,
    minWidth: undefined,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  statValueLarge: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.success.main,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  productRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  productName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  productQuantity: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  productAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success.main,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
});
