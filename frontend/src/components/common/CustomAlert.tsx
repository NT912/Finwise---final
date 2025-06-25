import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomAlertProps {
  visible: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  onClose: () => void;
  duration?: number; // Thời gian tự động đóng (ms), mặc định là 3000ms
  showConfirmButton?: boolean;
  confirmText?: string;
  onConfirm?: () => void;
  showCancelButton?: boolean;
  cancelText?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
  duration = 3000,
  showConfirmButton = true,
  confirmText = "Xác Nhận",
  onConfirm,
  showCancelButton = false,
  cancelText = "Hủy",
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Tự động đóng sau khoảng thời gian duration
      if (!showConfirmButton && !showCancelButton) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    handleClose();
  };

  // Xác định icon và màu sắc dựa trên type
  const getAlertStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: "checkmark-circle" as const,
          color: "#00D09E",
          backgroundColor: "rgba(0, 208, 158, 0.15)",
        };
      case "error":
        return {
          icon: "close-circle" as const,
          color: "#FF6B6B",
          backgroundColor: "rgba(255, 107, 107, 0.15)",
        };
      case "warning":
        return {
          icon: "warning-outline" as const,
          color: "#FFB700",
          backgroundColor: "rgba(255, 183, 0, 0.15)",
        };
      case "info":
      default:
        return {
          icon: "information-circle" as const,
          color: "#0095FF",
          backgroundColor: "rgba(0, 149, 255, 0.15)",
        };
    }
  };

  const { icon, color, backgroundColor } = getAlertStyles();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor }]}>
            <Ionicons name={icon} size={32} color={color} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {(showConfirmButton || showCancelButton) && (
            <View style={styles.buttonContainer}>
              {showCancelButton && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
              )}

              {showConfirmButton && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    { backgroundColor: color },
                  ]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.85,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  confirmButton: {
    backgroundColor: "#00D09E",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CustomAlert;
