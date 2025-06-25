import { StyleSheet } from "react-native";

export const typography = StyleSheet.create({
  h1: {
    fontFamily: "Roboto-Bold",
    fontSize: 24,
    fontWeight: "bold",
  },
  h2: {
    fontFamily: "Roboto-Bold",
    fontSize: 20,
    fontWeight: "bold",
  },
  h3: {
    fontFamily: "Roboto-Medium",
    fontSize: 18,
    fontWeight: "500",
  },
  h4: {
    fontFamily: "Roboto-Medium",
    fontSize: 16,
    fontWeight: "500",
  },
  body1: {
    fontFamily: "Roboto-Regular",
    fontSize: 16,
  },
  body2: {
    fontFamily: "Roboto-Regular",
    fontSize: 14,
  },
  caption: {
    fontFamily: "Roboto-Light",
    fontSize: 12,
  },
  button: {
    fontFamily: "Roboto-Medium",
    fontSize: 16,
    fontWeight: "500",
  },
});

// Fallback styles sử dụng system fonts
export const fallbackTypography = StyleSheet.create({
  h1: {
    fontFamily: "System",
    fontSize: 24,
    fontWeight: "bold",
  },
  h2: {
    fontFamily: "System",
    fontSize: 20,
    fontWeight: "bold",
  },
  h3: {
    fontFamily: "System",
    fontSize: 18,
    fontWeight: "500",
  },
  h4: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "500",
  },
  body1: {
    fontFamily: "System",
    fontSize: 16,
  },
  body2: {
    fontFamily: "System",
    fontSize: 14,
  },
  caption: {
    fontFamily: "System",
    fontSize: 12,
  },
  button: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "500",
  },
});
