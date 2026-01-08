/**
 * Comprehensive Theme Constants for the Application
 * Provides consistent colors, spacing, typography, and layout values
 */

// Spacing scale
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

// Typography
export const TYPOGRAPHY = {
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
  },
  fontWeight: {
    normal: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Border radius
export const BORDER_RADIUS = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Theme object combining all constants
export const THEME = {
  colors: {
    // Primary brand colors
    primary: '#007bff',
    primaryDark: '#0056b3',
    primaryLight: '#4da3ff',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FF9500',
    error: '#dc3545',
    info: '#17a2b8',
    
    // Neutral colors
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    
    // Semantic colors
    background: '#f5f5f5',
    surface: '#FFFFFF',
    border: '#e0e0e0',
    
    // Text colors
    textPrimary: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textLight: '#FFFFFF',
    textDisabled: '#cccccc',
    
    // Payment type colors (semantic mappings)
    paymentAdvance: '#FF9800',
    paymentPartial: '#2196F3',
    paymentFull: '#4CAF50',
    paymentAdjustment: '#9C27B0',
    
    // Report/Print colors (for consistency with PDF generation)
    reportPrimary: '#007bff',
    reportSuccess: '#28a745',
    reportDanger: '#dc3545',
    reportSecondary: '#666666',
    reportBackground: '#f8f9fa',
    reportBorder: '#dddddd',
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
};

// Header specific constants
export const HEADER_CONSTANTS = {
  paddingTop: 16, // Base padding, will be added to insets.top
  paddingHorizontal: 16,
  paddingBottom: 16,
  backgroundColor: THEME.colors.primary,
  textColor: THEME.colors.white,
};

// Layout constants
export const LAYOUT = {
  containerPadding: SPACING.base,
  sectionGap: SPACING.md,
  cardPadding: SPACING.base,
};

/**
 * Helper function to get color for payment type
 * Provides consistent color mapping across the application
 */
export const getPaymentTypeColor = (type: string): string => {
  switch (type?.toLowerCase()) {
    case 'advance':
      return THEME.colors.paymentAdvance;
    case 'partial':
      return THEME.colors.paymentPartial;
    case 'full':
      return THEME.colors.paymentFull;
    case 'adjustment':
      return THEME.colors.paymentAdjustment;
    default:
      return THEME.colors.textSecondary;
  }
};

export default THEME;
