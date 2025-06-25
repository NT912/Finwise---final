import { Platform } from "react-native";

// Font family theo platform - updated for consistent naming
export const fontFamily = {
  regular: "Roboto-Regular",
  light: "Roboto-Light",
  medium: "Roboto-Medium",
  bold: "Roboto-Bold",
};

// System fonts fallback
export const systemFontFamily = Platform.select({
  ios: {
    regular: "System",
    medium: "System",
    bold: "System",
    light: "System",
  },
  android: {
    regular: "sans-serif",
    medium: "sans-serif-medium",
    bold: "sans-serif-bold",
    light: "sans-serif-light",
  },
  default: {
    regular: "System",
    medium: "System",
    bold: "System",
    light: "System",
  },
});

// Colors - maintain backward compatibility
export const colors = {
  primary: "#00D09E", // Green
  secondary: "#E8F8F2", // Light Green
  accent: "#FF9800", // Preserved from original
  background: "#FFFFFF", // Main background
  card: "#FFFFFF", // Card background
  text: "#2E3E5C", // Primary text
  textSecondary: "#9FA5C0", // Secondary text
  border: "#D0DBEA", // Border color
  success: "#34C759", // Success state
  warning: "#FFC107", // Warning state
  error: "#FF3B30", // Error state
  disabled: "#BDBDBD", // Disabled state
  overlay: "rgba(0, 0, 0, 0.5)", // Overlay
  // New nested structure for additional options
  textColors: {
    primary: "#1E1E1E",
    secondary: "#757575",
    light: "#ABABAB",
  },
  backgrounds: {
    light: "#FFFFFF",
    secondary: "#F5F5F5",
  },
};

// Typography
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40, // Add back the xxl value
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  round: 100,
};

// Shadow with platform-specific values
export const shadows = Platform.select({
  ios: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
  },
  android: {
    sm: { elevation: 2 },
    md: { elevation: 4 },
    lg: { elevation: 8 },
  },
  default: {
    sm: { elevation: 2 },
    md: { elevation: 4 },
    lg: { elevation: 8 },
  },
});

// Shadow for cross-platform consistency
export const shadow = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export default {
  colors,
  fontFamily,
  systemFontFamily,
  typography,
  spacing,
  borderRadius,
  shadows,
  shadow, // Include both shadow styles for backward compatibility
};
