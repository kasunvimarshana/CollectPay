/**
 * Pagination Component
 * Reusable pagination controls for list screens
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import THEME from '../../core/constants/theme';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  return (
    <View style={styles.container}>
      <Text style={styles.info}>
        Showing {startItem}-{endItem} of {totalItems} items
      </Text>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, !hasPreviousPage && styles.buttonDisabled]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
        >
          <Text style={[styles.buttonText, !hasPreviousPage && styles.buttonTextDisabled]}>
            ← Previous
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.button, !hasNextPage && styles.buttonDisabled]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          <Text style={[styles.buttonText, !hasNextPage && styles.buttonTextDisabled]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  info: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: THEME.spacing.sm,
    borderRadius: 6,
    backgroundColor: THEME.colors.primary,
    minWidth: 100,
  },
  buttonDisabled: {
    backgroundColor: THEME.colors.border,
  },
  buttonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  buttonTextDisabled: {
    color: THEME.colors.textTertiary,
  },
  pageInfo: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
});
