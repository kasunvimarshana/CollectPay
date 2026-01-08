/**
 * DetailActionButtons Component
 * Reusable action buttons for detail screens (Edit/Delete)
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import THEME from '../../core/constants/theme';

interface DetailActionButtonsProps {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export const DetailActionButtons: React.FC<DetailActionButtonsProps> = ({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
}) => {
  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <View style={styles.container}>
      {canEdit && (
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={editLabel}
          accessibilityHint="Press to edit this item"
        >
          <Text style={styles.buttonText}>{editLabel}</Text>
        </TouchableOpacity>
      )}
      {canDelete && (
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={deleteLabel}
          accessibilityHint="Press to delete this item"
        >
          <Text style={styles.buttonText}>{deleteLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: THEME.spacing.base,
    gap: THEME.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: THEME.colors.primary,
  },
  deleteButton: {
    backgroundColor: THEME.colors.error,
  },
  buttonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
});
