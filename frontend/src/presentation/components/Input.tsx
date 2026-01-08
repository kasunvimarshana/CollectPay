/**
 * Input Component
 * Standardized text input component with consistent styling
 */

import React from 'react';
import { 
  View,
  Text,
  TextInput, 
  StyleSheet, 
  TextInputProps,
  ViewStyle,
} from 'react-native';
import THEME from '../../core/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  accessibilityLabel,
  accessibilityHint,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={THEME.colors.textTertiary}
        accessibilityLabel={accessibilityLabel || label || textInputProps.placeholder}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: textInputProps.editable === false }}
        {...textInputProps}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.base,
  },
  label: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.medium,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.xs,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
    fontSize: THEME.typography.fontSize.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    color: THEME.colors.textPrimary,
  },
  inputError: {
    borderColor: THEME.colors.error,
  },
  errorText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.error,
    marginTop: THEME.spacing.xs,
  },
});
