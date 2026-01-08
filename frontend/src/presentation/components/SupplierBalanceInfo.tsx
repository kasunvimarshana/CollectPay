/**
 * SupplierBalanceInfo Component
 * Displays supplier balance information in a consistent card layout
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import THEME from '../../core/constants/theme';
import { Card } from './Card';

interface SupplierBalanceInfoProps {
  balance: {
    balance: number;
    total_collected: number;
    total_paid: number;
    period?: {
      start_date?: string;
      end_date?: string;
    };
  };
  onViewCollections?: () => void;
  onViewPayments?: () => void;
}

export const SupplierBalanceInfo: React.FC<SupplierBalanceInfoProps> = ({
  balance,
  onViewCollections,
  onViewPayments,
}) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)}`;
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.sectionTitle}>Balance Information</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Total Collections:</Text>
        <Text style={[styles.value, styles.collectionAmount]}>
          {formatCurrency(balance.total_collected)}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Total Payments:</Text>
        <Text style={[styles.value, styles.paymentAmount]}>
          {formatCurrency(balance.total_paid)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.balanceLabel}>Outstanding Balance:</Text>
        <Text
          style={[
            styles.balanceValue,
            { color: balance.balance > 0 ? THEME.colors.error : THEME.colors.success },
          ]}
        >
          {formatCurrency(balance.balance)}
        </Text>
      </View>

      {(onViewCollections || onViewPayments) && (
        <>
          <View style={styles.divider} />
          <View style={styles.actionButtons}>
            {onViewCollections && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onViewCollections}
                accessibilityRole="button"
                accessibilityLabel="View collections"
              >
                <Text style={styles.actionButtonText}>View Collections</Text>
              </TouchableOpacity>
            )}
            {onViewPayments && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onViewPayments}
                accessibilityRole="button"
                accessibilityLabel="View payments"
              >
                <Text style={styles.actionButtonText}>View Payments</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: THEME.spacing.base,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.base,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  label: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
  },
  value: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  collectionAmount: {
    color: THEME.colors.success,
  },
  paymentAmount: {
    color: THEME.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: THEME.spacing.md,
  },
  balanceLabel: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  balanceValue: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  actionButtons: {
    marginTop: THEME.spacing.base,
    gap: THEME.spacing.sm,
  },
  actionButton: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  actionButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
});
