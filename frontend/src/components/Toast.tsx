import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, View, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onHide?: () => void;
}

const { width } = Dimensions.get("window");

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = "info",
  duration = 3000,
  onHide,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onHide) onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, fadeAnim, translateY, onHide]);

  if (!visible) return null;

  const getIconName = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      case "warning":
        return "warning";
      default:
        return "information-circle";
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#00D09E";
      case "error":
        return "#FF6B6B";
      case "warning":
        return "#FFB946";
      default:
        return "#2196F3";
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={getIconName()} size={24} color="white" />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    borderRadius: 8,
    padding: 12,
    minWidth: width * 0.8,
    maxWidth: width * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontWeight: "500",
    marginLeft: 10,
    fontSize: 14,
  },
});

export default Toast;
