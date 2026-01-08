/**
 * ScreenHeader Component
 * Standardized header component for all screens with consistent layout and theming
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
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ 
  title, 
  subtitle,
  showBackButton = false,
  rightComponent,
  variant = 'primary',
  style,
  onBackPress,
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
        {rightComponent && (
          <View style={styles.rightComponent}>
            {rightComponent}
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
    width: '100%',
  },
  backButton: {
    marginBottom: THEME.spacing.sm,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  titleContainer: {
    marginBottom: THEME.spacing.xs,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.base,
    marginTop: THEME.spacing.xs,
  },
  rightComponent: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
