/**
 * EmptyState Component
 * Displays when lists are empty
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import THEME from '../../core/constants/theme';

interface EmptyStateProps {
  message: string;
  icon?: string;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  icon = '📭',
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xxxl,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    marginVertical: 20,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  message: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
