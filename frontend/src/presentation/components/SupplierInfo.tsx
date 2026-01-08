/**
 * SupplierInfo Component
 * Displays supplier information in a consistent card layout
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Supplier } from '../../domain/entities/Supplier';
import THEME from '../../core/constants/theme';
import { Card } from './Card';

interface SupplierInfoProps {
  supplier: Supplier;
}

export const SupplierInfo: React.FC<SupplierInfoProps> = ({ supplier }) => {
  return (
    <Card style={styles.container}>
      <Text style={styles.sectionTitle}>Supplier Information</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{supplier.name}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Code:</Text>
        <Text style={styles.value}>{supplier.code}</Text>
      </View>

      {supplier.contact_person && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Contact Person:</Text>
          <Text style={styles.value}>{supplier.contact_person}</Text>
        </View>
      )}

      {supplier.phone && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{supplier.phone}</Text>
        </View>
      )}

      {supplier.email && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{supplier.email}</Text>
        </View>
      )}

      {supplier.address && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{supplier.address}</Text>
        </View>
      )}

      {supplier.region && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Region:</Text>
          <Text style={styles.value}>{supplier.region}</Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <Text style={styles.label}>Status:</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: supplier.is_active ? THEME.colors.success : THEME.colors.error },
          ]}
        >
          <Text style={styles.statusText}>{supplier.is_active ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
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
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  label: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    width: 140,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  value: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.md,
  },
  statusText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
});
