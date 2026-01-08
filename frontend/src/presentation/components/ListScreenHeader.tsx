/**
 * ListScreenHeader Component
 * Specialized header for list screens with add button and sync indicator
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import THEME from '../../core/constants/theme';

interface ListScreenHeaderProps {
  title: string;
  onAddPress?: () => void;
  showAddButton?: boolean;
  addButtonText?: string;
  rightComponent?: React.ReactNode;
}

export const ListScreenHeader: React.FC<ListScreenHeaderProps> = ({ 
  title,
  onAddPress,
  showAddButton = false,
  addButtonText = '+ Add',
  rightComponent,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[
        styles.header, 
        { paddingTop: insets.top + THEME.spacing.base }
      ]}
    >
      <View style={styles.headerContent}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.actions}>
          {rightComponent}
          {showAddButton && onAddPress && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={onAddPress}
            >
              <Text style={styles.addButtonText}>{addButtonText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.base,
    paddingBottom: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  addButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.base,
  },
  addButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
});
