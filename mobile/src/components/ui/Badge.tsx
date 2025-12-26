import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
}) => {
  return (
    <View style={[styles.badge, styles[`variant_${variant}`], styles[`size_${size}`]]}>
      <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
        {label}
      </Text>
    </View>
  );
};

// Status-specific badges
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const variantMap: Record<string, BadgeVariant> = {
    pending: 'warning',
    confirmed: 'success',
    approved: 'success',
    completed: 'success',
    active: 'success',
    disputed: 'error',
    cancelled: 'error',
    inactive: 'default',
    failed: 'error',
    synced: 'success',
    conflict: 'warning',
  };

  const variant = variantMap[status.toLowerCase()] || 'default';

  return <Badge label={status.charAt(0).toUpperCase() + status.slice(1)} variant={variant} />;
};

export const SyncStatusBadge: React.FC<{ status: string; count?: number }> = ({ 
  status, 
  count 
}) => {
  const variantMap: Record<string, BadgeVariant> = {
    synced: 'success',
    pending: 'warning',
    conflict: 'error',
    failed: 'error',
  };

  const variant = variantMap[status.toLowerCase()] || 'info';
  const label = count ? `${status} (${count})` : status;

  return <Badge label={label} variant={variant} size="sm" />;
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },
  
  // Variants
  variant_default: {
    backgroundColor: colors.neutral[100],
  },
  variant_primary: {
    backgroundColor: colors.primary[100],
  },
  variant_success: {
    backgroundColor: colors.success.light,
  },
  variant_warning: {
    backgroundColor: colors.warning.light,
  },
  variant_error: {
    backgroundColor: colors.error.light,
  },
  variant_info: {
    backgroundColor: colors.info.light,
  },
  
  // Sizes
  size_sm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  size_md: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  
  // Text
  text: {
    fontWeight: typography.fontWeight.medium,
  },
  text_default: {
    color: colors.text.secondary,
  },
  text_primary: {
    color: colors.primary[700],
  },
  text_success: {
    color: colors.success.dark,
  },
  text_warning: {
    color: colors.warning.dark,
  },
  text_error: {
    color: colors.error.dark,
  },
  text_info: {
    color: colors.info.dark,
  },
  
  // Text sizes
  textSize_sm: {
    fontSize: typography.fontSize.xs,
  },
  textSize_md: {
    fontSize: typography.fontSize.sm,
  },
});
