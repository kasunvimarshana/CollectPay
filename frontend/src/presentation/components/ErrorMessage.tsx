/**
 * ErrorMessage Component
 * Displays error messages in a consistent format
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import THEME from '../../core/constants/theme';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry,
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: THEME.spacing.lg,
    backgroundColor: THEME.colors.gray100,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.warning,
    margin: THEME.spacing.base,
    alignItems: 'center',
  },
  icon: {
    fontSize: THEME.typography.fontSize.xxxl,
    marginBottom: THEME.spacing.sm,
  },
  message: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.base,
    lineHeight: THEME.typography.lineHeight.normal * THEME.typography.fontSize.base,
  },
  retryButton: {
    backgroundColor: THEME.colors.warning,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.base,
  },
  retryButtonText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.bold,
  },
});
