import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { colors } from "../theme";

// Các loại thông báo được hỗ trợ
export type ToastType = "success" | "error" | "info" | "warning";

// Cấu hình cho mỗi loại thông báo
const toastConfig = {
  // Thông báo thành công (màu xanh lá)
  success: ({ text1, text2, props, ...rest }: any) => (
    <View style={[styles.container, styles.successContainer]}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={24} color="white" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={() => Toast.hide()}>
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>
    </View>
  ),

  // Thông báo lỗi (màu đỏ)
  error: ({ text1, text2, props, ...rest }: any) => (
    <View style={[styles.container, styles.errorContainer]}>
      <View style={styles.iconContainer}>
        <Ionicons name="close-circle" size={24} color="white" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={() => Toast.hide()}>
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>
    </View>
  ),

  // Thông báo cảnh báo (màu cam)
  warning: ({ text1, text2, props, ...rest }: any) => (
    <View style={[styles.container, styles.warningContainer]}>
      <View style={styles.iconContainer}>
        <Ionicons name="warning" size={24} color="white" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={() => Toast.hide()}>
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>
    </View>
  ),

  // Thông báo thông tin (màu xanh dương)
  info: ({ text1, text2, props, ...rest }: any) => (
    <View style={[styles.container, styles.infoContainer]}>
      <View style={styles.iconContainer}>
        <Ionicons name="information-circle" size={24} color="white" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={() => Toast.hide()}>
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>
    </View>
  ),
};

// Hàm tiện ích để hiển thị các loại thông báo khác nhau
export const showToast = (
  type: ToastType,
  title: string,
  message?: string,
  duration = 3000
) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: "top",
    visibilityTime: duration,
    autoHide: true,
    topOffset: 50,
  });
};

// Hàm nhanh cho từng loại thông báo
export const showSuccessToast = (title: string, message?: string) =>
  showToast("success", title, message);

export const showErrorToast = (title: string, message?: string) =>
  showToast("error", title, message);

export const showInfoToast = (title: string, message?: string) =>
  showToast("info", title, message);

export const showWarningToast = (title: string, message?: string) =>
  showToast("warning", title, message);

// Cấu hình của toast
export const toastConfigMap = toastConfig;

// Styles cho toast
const styles = StyleSheet.create({
  container: {
    width: "90%",
    maxWidth: 350,
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  successContainer: {
    backgroundColor: "#07bc0c", // Xanh lá đậm
  },
  errorContainer: {
    backgroundColor: "#ff3b30", // Đỏ iOS
  },
  warningContainer: {
    backgroundColor: "#ff9500", // Cam iOS
  },
  infoContainer: {
    backgroundColor: "#007aff", // Xanh dương iOS
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  message: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
