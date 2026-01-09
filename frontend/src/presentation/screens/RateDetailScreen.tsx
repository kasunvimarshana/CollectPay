/**
 * Rate Detail Screen
 * Shows detailed information about a rate
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
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { Rate } from '../../domain/entities/Product';
import { useAuth } from '../contexts/AuthContext';
import { canUpdate, canDelete } from '../../core/utils/permissions';
import Logger from '../../core/utils/Logger';

export const RateDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const rateId = (route.params as any)?.rateId;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rate, setRate] = useState<Rate | null>(null);

  useEffect(() => {
    if (rateId) {
      loadRateData();
    }
  }, [rateId]);

  const loadRateData = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get<any>(`/rates/${rateId}`);

      if (response.success && response.data) {
        setRate(response.data);
      }
    } catch (error) {
      Logger.error('Error loading rate data', error);
      Alert.alert('Error', 'Failed to load rate details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRateData();
    setRefreshing(false);
  };

  const handleEdit = () => {
    (navigation.navigate as any)('RateForm', { rateId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this rate? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/rates/${rateId}`);
              Alert.alert('Success', 'Rate deleted successfully');
              navigation.goBack();
            } catch (error: any) {
              Logger.error('Error deleting rate', error);
              const message = error.response?.data?.message || 'Failed to delete rate';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const handleViewProduct = () => {
    if (rate?.product_id) {
      (navigation.navigate as any)('ProductDetail', { productId: rate.product_id });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading rate details...</Text>
      </View>
    );
  }

  if (!rate) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Rate not found</Text>
      </View>
    );
  }

  const isActive = !rate.effective_to || new Date(rate.effective_to) > new Date();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + THEME.spacing.lg }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with action buttons */}
      <View style={[styles.header, { paddingTop: insets.top + THEME.spacing.base }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          {canUpdate(user, 'rates') && (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {canDelete(user, 'rates') && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Rate Information Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Rate Information</Text>
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
        </View>

        <View style={styles.rateAmountContainer}>
          <Text style={styles.rateAmount}>{String(rate.rate)}</Text>
          <Text style={styles.rateUnit}>per {String(rate.unit)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version:</Text>
          <Text style={styles.infoValue}>{String(rate.version)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={[styles.infoValue, isActive ? styles.activeText : styles.inactiveText]}>
            {rate.is_active ? (isActive ? 'Active' : 'Expired') : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Product Information Card */}
      {rate.product && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Product</Text>
          
          <TouchableOpacity style={styles.productLink} onPress={handleViewProduct}>
            <View>
              <Text style={styles.productName}>{rate.product.name}</Text>
              <Text style={styles.productCode}>Code: {rate.product.code}</Text>
            </View>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Date Information Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Effective Period</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>From:</Text>
          <Text style={styles.infoValue}>
            {new Date(rate.effective_from).toLocaleDateString()}
          </Text>
        </View>

        {rate.effective_to ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>To:</Text>
            <Text style={styles.infoValue}>
              {new Date(rate.effective_to).toLocaleDateString()}
            </Text>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>To:</Text>
            <Text style={[styles.infoValue, styles.ongoingText]}>
              No end date (ongoing)
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created:</Text>
          <Text style={styles.infoValue}>
            {new Date(rate.created_at).toLocaleString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Updated:</Text>
          <Text style={styles.infoValue}>
            {new Date(rate.updated_at).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Rate Usage Information */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Usage Notes</Text>
        <Text style={styles.noteText}>
          This rate is used to calculate collection amounts for the product "{rate.product?.name || 'Unknown'}" 
          when collections are made using the unit "{rate.unit}" during the effective period.
        </Text>
        {!isActive && rate.effective_to && (
          <Text style={styles.warningText}>
            ⚠️ This rate has expired and will not be used in new calculations.
          </Text>
        )}
        {!rate.is_active && (
          <Text style={styles.warningText}>
            ⚠️ This rate is marked as inactive and will not be used in calculations.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: THEME.spacing.md,
  },
  editButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.base,
  },
  editButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  deleteButton: {
    backgroundColor: THEME.colors.error,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.base,
  },
  deleteButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.base,
    margin: THEME.spacing.base,
    ...THEME.shadows.base,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  cardTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  activeBadge: {
    backgroundColor: THEME.colors.success,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.md,
  },
  activeBadgeText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  rateAmountContainer: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  rateAmount: {
    fontSize: THEME.typography.fontSize.huge,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.primary,
  },
  rateUnit: {
    fontSize: THEME.typography.fontSize.xl,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
  },
  infoLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  infoValue: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: THEME.spacing.md,
  },
  activeText: {
    color: THEME.colors.success,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  inactiveText: {
    color: THEME.colors.error,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  ongoingText: {
    color: THEME.colors.success,
    fontStyle: 'italic',
  },
  productLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.base,
    marginTop: THEME.spacing.sm,
  },
  productName: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
  },
  productCode: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
  },
  linkArrow: {
    fontSize: THEME.typography.fontSize.xl,
    color: THEME.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: THEME.spacing.md,
  },
  noteText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
    marginTop: THEME.spacing.sm,
  },
  warningText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.warning,
    lineHeight: 20,
    marginTop: THEME.spacing.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textSecondary,
  },
  errorText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.error,
  },
});
