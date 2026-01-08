/**
 * Button Component
 * Standardized button component with consistent styling
 */

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import THEME from '../../core/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const isDisabled = disabled || loading;

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDisabled ? THEME.colors.gray400 : THEME.colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: isDisabled ? THEME.colors.gray400 : THEME.colors.gray600,
        };
      case 'danger':
        return {
          backgroundColor: isDisabled ? THEME.colors.gray400 : THEME.colors.error,
        };
      case 'success':
        return {
          backgroundColor: isDisabled ? THEME.colors.gray400 : THEME.colors.success,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: isDisabled ? THEME.colors.gray400 : THEME.colors.primary,
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): ViewStyle & TextStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: THEME.spacing.sm,
          paddingHorizontal: THEME.spacing.base,
          fontSize: THEME.typography.fontSize.sm,
        };
      case 'large':
        return {
          paddingVertical: THEME.spacing.lg,
          paddingHorizontal: THEME.spacing.xl,
          fontSize: THEME.typography.fontSize.lg,
        };
      case 'medium':
      default:
        return {
          paddingVertical: THEME.spacing.base,
          paddingHorizontal: THEME.spacing.lg,
          fontSize: THEME.typography.fontSize.md,
        };
    }
  };

  const getTextColor = (): string => {
    if (variant === 'outline') {
      return isDisabled ? THEME.colors.gray400 : THEME.colors.primary;
    }
    return THEME.colors.white;
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        { 
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? THEME.colors.primary : THEME.colors.white} 
        />
      ) : (
        <Text 
          style={[
            styles.text,
            { 
              fontSize: sizeStyles.fontSize,
              color: getTextColor(),
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // iOS accessibility minimum
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: THEME.typography.fontWeight.bold,
    textAlign: 'center',
  },
});
