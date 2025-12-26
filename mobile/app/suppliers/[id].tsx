import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, Button, Badge, StatusBadge } from '../../../src/components/ui';
import { useSupplier, useAuth, useCollections, usePayments } from '../../../src/hooks';
import { colors, spacing, typography, shadows } from '../../../src/theme';

export default function SupplierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const { supplier, balance, isLoading, deleteSupplier } = useSupplier(id);
  const { collections } = useCollections({ supplierId: id });
  const { payments } = usePayments({ supplierId: id });

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-LK', {
      dateStyle: 'medium',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Supplier',
      'Are you sure you want to delete this supplier? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSupplier();
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading || !supplier) {
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
          title: supplier.name,
          headerRight: () => hasPermission('update:suppliers') ? (
            <TouchableOpacity
              onPress={() => router.push(`/suppliers/${id}/edit`)}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : null,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Header Card */}
          <Card style={styles.headerCard}>
            <CardContent>
              <View style={styles.supplierHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {supplier.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.supplierInfo}>
                  <Text style={styles.supplierName}>{supplier.name}</Text>
                  <Text style={styles.supplierCode}>{supplier.code}</Text>
                </View>
                <Badge
                  label={supplier.status}
                  variant={supplier.status === 'active' ? 'success' : 'warning'}
                />
              </View>
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card style={styles.balanceCard}>
            <CardContent>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={[
                styles.balanceValue,
                (balance || 0) > 0 ? styles.balancePositive : styles.balanceZero
              ]}>
                {formatCurrency(balance || 0)}
              </Text>
              <Text style={styles.balanceSubtext}>
                {(balance || 0) > 0 
                  ? 'Amount owed to supplier' 
                  : 'No outstanding balance'}
              </Text>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Card>
            <CardContent>
              <InfoRow icon="📞" label="Phone" value={supplier.phone} />
              {supplier.email && (
                <>
                  <View style={styles.divider} />
                  <InfoRow icon="✉️" label="Email" value={supplier.email} />
                </>
              )}
              <View style={styles.divider} />
              <InfoRow icon="📍" label="Region" value={supplier.region} />
              {supplier.address && (
                <>
                  <View style={styles.divider} />
                  <InfoRow icon="🏠" label="Address" value={supplier.address} />
                </>
              )}
            </CardContent>
          </Card>

          {/* Bank Details */}
          {supplier.bankDetails && (
            <>
              <Text style={styles.sectionTitle}>Bank Details</Text>
              <Card>
                <CardContent>
                  <InfoRow label="Bank" value={supplier.bankDetails.bankName || '-'} />
                  <View style={styles.divider} />
                  <InfoRow label="Account" value={supplier.bankDetails.accountNumber || '-'} />
                  <View style={styles.divider} />
                  <InfoRow label="Account Name" value={supplier.bankDetails.accountName || '-'} />
                  {supplier.bankDetails.branchCode && (
                    <>
                      <View style={styles.divider} />
                      <InfoRow label="Branch" value={supplier.bankDetails.branchCode} />
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Stats */}
          <Text style={styles.sectionTitle}>Activity Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{collections.length}</Text>
              <Text style={styles.statLabel}>Collections</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{payments.length}</Text>
              <Text style={styles.statLabel}>Payments</Text>
            </View>
          </View>

          {/* Recent Collections */}
          <Text style={styles.sectionTitle}>Recent Collections</Text>
          <Card>
            <CardContent>
              {collections.length > 0 ? (
                collections.slice(0, 3).map((c, index) => (
                  <View key={c.id}>
                    {index > 0 && <View style={styles.divider} />}
                    <TouchableOpacity
                      style={styles.activityRow}
                      onPress={() => router.push(`/collections/${c.id}`)}
                    >
                      <View>
                        <Text style={styles.activityDate}>
                          {formatDate(c.collectedAt)}
                        </Text>
                        <Text style={styles.activityDetail}>
                          {c.quantity} {c.unit}
                        </Text>
                      </View>
                      <Text style={styles.activityAmount}>
                        {formatCurrency(c.totalAmount)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No collections yet</Text>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Text style={styles.sectionTitle}>Record Info</Text>
          <Card>
            <CardContent>
              <InfoRow label="Created" value={formatDate(supplier.createdAt)} />
              <View style={styles.divider} />
              <InfoRow label="Updated" value={formatDate(supplier.updatedAt)} />
              <View style={styles.divider} />
              <View style={styles.syncRow}>
                <Text style={styles.infoLabel}>Sync Status</Text>
                <StatusBadge status={supplier.syncStatus} />
              </View>
            </CardContent>
          </Card>

          {/* Delete Button */}
          {hasPermission('delete:suppliers') && (
            <Button
              title="Delete Supplier"
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

const InfoRow = ({ icon, label, value }: { icon?: string; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabelContainer}>
      {icon && <Text style={styles.infoIcon}>{icon}</Text>}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
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
  headerButton: {
    paddingHorizontal: spacing.md,
  },
  headerButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  supplierCode: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: colors.primary[50],
    marginBottom: spacing.md,
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: typography.fontSize.xxl + 8,
    fontWeight: typography.fontWeight.bold,
  },
  balancePositive: {
    color: colors.success.main,
  },
  balanceZero: {
    color: colors.text.secondary,
  },
  balanceSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  activityDate: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  activityDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success.main,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    padding: spacing.md,
  },
  deleteButton: {
    marginTop: spacing.lg,
  },
});
