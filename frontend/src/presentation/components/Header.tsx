/**
 * ScreenHeader Component
 * Unified header component for all screens with consistent layout and theming
 * Supports both detail screens (with back button) and list screens (with add button)
 * 
 * @deprecated The old "Header" export name is deprecated. Use "ScreenHeader" instead.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import THEME from '../../core/constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  variant?: 'primary' | 'light';
  style?: ViewStyle;
  onBackPress?: () => void;
  // List screen specific props (from ListScreenHeader)
  showAddButton?: boolean;
  onAddPress?: () => void;
  addButtonText?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ 
  title, 
  subtitle,
  showBackButton = false,
  rightComponent,
  variant = 'primary',
  style,
  onBackPress,
  showAddButton = false,
  onAddPress,
  addButtonText = '+ Add',
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const isPrimary = variant === 'primary';

  return (
    <View 
      style={[
        styles.header, 
        { 
          paddingTop: insets.top + THEME.spacing.base,
          backgroundColor: isPrimary ? THEME.colors.primary : THEME.colors.surface,
        }, 
        style
      ]}
    >
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={[
              styles.backButtonText,
              { color: isPrimary ? THEME.colors.white : THEME.colors.primary }
            ]}>
              ← Back
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={[
            styles.title,
            { color: isPrimary ? THEME.colors.white : THEME.colors.textPrimary }
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[
              styles.subtitle,
              { color: isPrimary ? 'rgba(255, 255, 255, 0.8)' : THEME.colors.textSecondary }
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
        {(rightComponent || showAddButton) && (
          <View style={styles.actionsContainer}>
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
        )}
      </View>
    </View>
  );
};

/**
 * @deprecated Use ScreenHeader instead. This export is maintained for backward compatibility.
 */
export const Header = ScreenHeader;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: THEME.spacing.base,
    paddingBottom: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: THEME.spacing.sm,
  },
  backButtonText: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.base,
    marginTop: THEME.spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginLeft: THEME.spacing.sm,
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
