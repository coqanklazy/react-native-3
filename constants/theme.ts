// Design system based on Vietnamese food service theme
// Colors: Warm red palette for appetite and Vietnamese culture
// Typography: Be Vietnam Pro for native feel

export const COLORS = {
  // Primary palette - Red theme for food service
  primary: "#DC2626", // Vibrant red
  secondary: "#F87171", // Light red
  accent: "#CA8A04", // Gold/Yellow for CTA

  // Semantic colors
  success: "#059669",
  warning: "#D97706",
  error: "#DC2626",
  info: "#0284C7",

  // Base colors
  white: "#FFFFFF",
  black: "#000000",

  // Grays
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  // Background & Text (from design system)
  background: "#FEF2F2", // Light red tint
  surface: "#FFFFFF",
  text: "#450A0A", // Dark red
  textSecondary: "#7C2D12",
  textLight: "#9CA3AF",

  // Overlays
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
} as const;

export const SIZES = {
  // Base
  base: 8,

  // Spacing - Vibrant style uses larger gaps
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Border radius - Rounded for modern feel
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,

  // Padding & Margin
  padding: 16,
  margin: 16,

  // Font sizes - Large type for vibrant style (32px+)
  h1: 36,
  h2: 28,
  h3: 24,
  h4: 20,
  body1: 16,
  body2: 14,
  body3: 13,
  caption: 12,

  // Button heights
  buttonSm: 40,
  buttonMd: 48,
  buttonLg: 56,

  // Input heights
  inputHeight: 48,
} as const;

export const FONTS = {
  // Note: Be Vietnam Pro should be loaded via expo-google-fonts
  // For now, using system fonts as fallback
  regular: "System",
  medium: "System",
  semibold: "System",
  bold: "System",

  h1: { fontSize: SIZES.h1, fontWeight: "700" as const, lineHeight: 44 },
  h2: { fontSize: SIZES.h2, fontWeight: "700" as const, lineHeight: 36 },
  h3: { fontSize: SIZES.h3, fontWeight: "600" as const, lineHeight: 32 },
  h4: { fontSize: SIZES.h4, fontWeight: "600" as const, lineHeight: 28 },
  body1: { fontSize: SIZES.body1, fontWeight: "400" as const, lineHeight: 24 },
  body2: { fontSize: SIZES.body2, fontWeight: "400" as const, lineHeight: 20 },
  body3: { fontSize: SIZES.body3, fontWeight: "400" as const, lineHeight: 18 },
  caption: {
    fontSize: SIZES.caption,
    fontWeight: "400" as const,
    lineHeight: 16,
  },
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

export const ANIMATIONS = {
  // Vibrant style: 200-300ms transitions
  fast: 150,
  normal: 200,
  slow: 300,
} as const;

// Export theme object for easy access
export const theme = {
  colors: COLORS,
  sizes: SIZES,
  fonts: FONTS,
  shadows: SHADOWS,
  animations: ANIMATIONS,
} as const;

export default theme;
