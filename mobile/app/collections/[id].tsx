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
import { useCollections, useAuth, useSupplier } from '../../../src/hooks';
import { colors, spacing, typography } from '../../../src/theme';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const { collections, isLoading, deleteCollection } = useCollections({});
  
  const collection = collections.find((c) => c.id === id);
  const { supplier } = useSupplier(collection?.supplierId || '');

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('en-LK', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCollection(id);
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading || !collection) {
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
          title: 'Collection Details',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Status Header */}
          <Card style={styles.headerCard}>
            <CardContent>
              <View style={styles.statusRow}>
                <StatusBadge status={collection.status} />
                <SyncStatusBadge status={collection.syncStatus} />
              </View>
              <Text style={styles.collectionDate}>
                {formatDate(collection.collectedAt)}
              </Text>
            </CardContent>
          </Card>

          {/* Amount Card */}
          <Card style={styles.amountCard}>
            <CardContent>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.amountValue}>
                {formatCurrency(collection.totalAmount)}
              </Text>
              <View style={styles.amountBreakdown}>
                <Text style={styles.breakdownText}>
                  {collection.quantity} {collection.unit} × {formatCurrency(collection.rateAtCollection)}/{collection.unit}
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* Supplier Info */}
          <Text style={styles.sectionTitle}>Supplier</Text>
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

          {/* Collection Details */}
          <Text style={styles.sectionTitle}>Collection Details</Text>
          <Card>
            <CardContent>
              <InfoRow label="Quantity" value={`${collection.quantity} ${collection.unit}`} />
              <View style={styles.divider} />
              <InfoRow label="Rate at Collection" value={formatCurrency(collection.rateAtCollection)} />
              <View style={styles.divider} />
              <InfoRow label="Product ID" value={collection.productId.slice(0, 12) + '...'} />
              <View style={styles.divider} />
              <InfoRow label="Collected By" value={collection.collectedBy.slice(0, 12) + '...'} />
            </CardContent>
          </Card>

          {/* Notes */}
          {collection.notes && (
            <>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Card>
                <CardContent>
                  <Text style={styles.notes}>{collection.notes}</Text>
                </CardContent>
              </Card>
            </>
          )}

          {/* Record Info */}
          <Text style={styles.sectionTitle}>Record Info</Text>
          <Card>
            <CardContent>
              <InfoRow label="ID" value={collection.id.slice(0, 16) + '...'} />
              <View style={styles.divider} />
              <InfoRow 
                label="Created" 
                value={new Date(collection.createdAt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })} 
              />
              <View style={styles.divider} />
              <InfoRow 
                label="Updated" 
                value={new Date(collection.updatedAt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })} 
              />
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version</Text>
                <Badge label={`v${collection.version}`} variant="default" size="sm" />
              </View>
            </CardContent>
          </Card>

          {/* Delete Button */}
          {hasPermission('delete:collections') && collection.status === 'pending' && (
            <Button
              title="Delete Collection"
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
  collectionDate: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  amountCard: {
    backgroundColor: colors.success.light,
    marginBottom: spacing.md,
  },
  amountLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.success.dark,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: typography.fontSize.xxl + 8,
    fontWeight: typography.fontWeight.bold,
    color: colors.success.dark,
  },
  amountBreakdown: {
    marginTop: spacing.sm,
  },
  breakdownText: {
    fontSize: typography.fontSize.md,
    color: colors.success.dark,
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
