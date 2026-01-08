/**
 * Rate History Screen
 * Displays historical rates for a product
 */

import React, { useState, useEffect } from 'react';
import THEME from '../../core/constants/theme';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { Rate } from '../../domain/entities/Product';

export const RateHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId, productName } = (route.params as any) || {};
  const insets = useSafeAreaInsets();

  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRateHistory();
  }, [productId]);

  const loadRateHistory = async () => {
    try {
      const response = await apiClient.get<any>(`/products/${productId}/rate-history`);
      if (response.success && response.data) {
        const rateData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data && Array.isArray(response.data.data) ? response.data.data : []);
        setRates(rateData);
      }
    } catch (error) {
      console.error('Error loading rate history:', error);
      Alert.alert('Error', 'Failed to load rate history');
    } finally {
      setLoading(false);
    }
  };

  const renderRateItem = ({ item }: { item: Rate }) => {
    const isActive = !item.effective_to || new Date(item.effective_to) > new Date();
    
    return (
      <View style={styles.rateCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.rateAmount}>{String(item.rate)} per {String(item.unit)}</Text>
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Version:</Text>
            <Text style={styles.detailValue}>{String(item.version)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Effective From:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.effective_from).toLocaleDateString()}
            </Text>
          </View>
          
          {item.effective_to && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Effective To:</Text>
              <Text style={styles.detailValue}>
                {new Date(item.effective_to).toLocaleDateString()}
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading rate history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + THEME.spacing.base }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Rate History</Text>
        {productName && <Text style={styles.subtitle}>{productName}</Text>}
      </View>

      {rates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No rate history available</Text>
        </View>
      ) : (
        <FlatList
          data={rates}
          keyExtractor={(item, index) => item.id?.toString() || `rate-${index}`}
          renderItem={renderRateItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + THEME.spacing.base }]}
        />
      )}
    </View>
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
  subtitle: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
  },
  listContent: {
    padding: THEME.spacing.base,
  },
  rateCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.base,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.base,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  rateAmount: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.primary,
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
  cardBody: {
    marginTop: THEME.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  detailLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  detailValue: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    flex: 1,
    textAlign: 'right',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  emptyText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textSecondary,
  },
});
