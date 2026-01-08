/**
 * ProductActionButtons Component
 * Action buttons for edit and delete operations
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import THEME from '../../core/constants/theme';

interface ProductActionButtonsProps {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProductActionButtons: React.FC<ProductActionButtonsProps> = ({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}) => {
  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <View style={styles.actionButtons}>
      {canEdit && (
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>Edit Product</Text>
        </TouchableOpacity>
      )}

      {canDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete Product</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    padding: THEME.spacing.base,
    gap: THEME.spacing.md,
  },
  editButton: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  editButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: THEME.colors.error,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
});
