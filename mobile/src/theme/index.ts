export const colors = {
  // Primary palette
  primary: {
    50: "#e6f1ff",
    100: "#cce3ff",
    200: "#99c7ff",
    300: "#66aaff",
    400: "#338eff",
    500: "#0072ff",
    600: "#005bcc",
    700: "#004499",
    800: "#002e66",
    900: "#001733",
  },

  // Secondary (teal)
  secondary: {
    50: "#e6f7f7",
    100: "#ccefef",
    200: "#99dfdf",
    300: "#66cfcf",
    400: "#33bfbf",
    500: "#00afaf",
    600: "#008c8c",
    700: "#006969",
    800: "#004646",
    900: "#002323",
  },

  // Neutral
  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },

  // Semantic colors
  success: {
    light: "#d1fae5",
    main: "#10b981",
    dark: "#059669",
  },
  warning: {
    light: "#fef3c7",
    main: "#f59e0b",
    dark: "#d97706",
  },
  error: {
    light: "#fee2e2",
    main: "#ef4444",
    dark: "#dc2626",
  },
  info: {
    light: "#dbeafe",
    main: "#3b82f6",
    dark: "#2563eb",
  },

  // Backgrounds
  background: {
    default: "#f8fafc",
    paper: "#ffffff",
    elevated: "#ffffff",
  },

  // Text
  text: {
    primary: "#1e293b",
    secondary: "#64748b",
    disabled: "#94a3b8",
    inverse: "#ffffff",
  },

  // Borders
  border: {
    light: "#e2e8f0",
    main: "#cbd5e1",
    dark: "#94a3b8",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export type Theme = typeof theme;
