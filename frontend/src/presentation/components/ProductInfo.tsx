/**
 * ProductInfo Component
 * Displays product basic information
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Product } from '../../domain/entities/Product';
import { Card } from './Card';
import THEME from '../../core/constants/theme';

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: product.is_active ? THEME.colors.success : THEME.colors.error }
          ]}
        >
          <Text style={styles.statusText}>
            {product.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <DetailRow label="Code" value={String(product.code)} />

      {product.description && (
        <DetailRow label="Description" value={String(product.description)} />
      )}

      <DetailRow label="Base Unit" value={String(product.base_unit)} />

      <DetailRow
        label="Supported Units"
        value={
          Array.isArray(product.supported_units)
            ? product.supported_units.join(', ')
            : String(product.supported_units)
        }
      />
    </Card>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: THEME.spacing.base,
  },
  statusRow: {
    marginBottom: THEME.spacing.base,
  },
  statusBadge: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs + 2,
    borderRadius: THEME.borderRadius.md,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.sm,
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
});
