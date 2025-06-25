import React from "react";
import {
  Text as RNText,
  TextStyle,
  TextProps as RNTextProps,
  StyleSheet,
} from "react-native";
import theme from "../../theme";
import { getFontFamily } from "../../utils/loadFonts";

interface TextProps extends RNTextProps {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "body1"
    | "body2"
    | "caption"
    | "button";
  weight?: "regular" | "medium" | "bold" | "light";
  color?: keyof typeof theme.colors | string;
  center?: boolean;
  useSystemFont?: boolean;
}

// Tự động xác định weight dựa trên variant
const getWeightForVariant = (
  variant: string
): "regular" | "medium" | "bold" | "light" => {
  switch (variant) {
    case "h1":
    case "h2":
      return "bold";
    case "h3":
    case "h4":
    case "button":
      return "medium";
    case "caption":
      return "light";
    default:
      return "regular";
  }
};

const Text: React.FC<TextProps> = ({
  variant = "body1",
  weight,
  color = "text",
  center = false,
  style,
  useSystemFont = false,
  ...props
}) => {
  // Xác định weight dựa trên variant nếu weight không được cung cấp
  const finalWeight = weight || getWeightForVariant(variant);

  // Xác định style dựa trên variant
  const variantStyle: TextStyle = {
    fontSize: theme.typography[variant],
    fontFamily: getFontFamily(finalWeight),
    color:
      color in theme.colors
        ? theme.colors[color as keyof typeof theme.colors]
        : color,
    textAlign: center ? "center" : undefined,
  };

  return <RNText style={[variantStyle, style]} {...props} />;
};

export default Text;
