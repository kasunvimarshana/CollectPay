/**
 * Card Component
 * Reusable card container for consistent styling
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import THEME from '../../core/constants/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.base,
    marginVertical: THEME.spacing.sm,
    ...THEME.shadows.base,
  },
});
