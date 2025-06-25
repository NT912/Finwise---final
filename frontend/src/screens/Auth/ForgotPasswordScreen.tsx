import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { forgotPassword } from "../../services/authService";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import CustomAlert from "../../components/common/CustomAlert";

type ForgotPasswordScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Custom Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "error" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleNextStep = async () => {
    if (!email) {
      setAlertConfig({
        type: "error",
        title: "Thiếu Email",
        message: "Vui lòng nhập địa chỉ email của bạn để tiếp tục.",
        onConfirm: () => setShowAlert(false),
      });
      setShowAlert(true);
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertConfig({
        type: "error",
        title: "Email Không Hợp Lệ",
        message: "Vui lòng nhập một địa chỉ email hợp lệ.",
        onConfirm: () => setShowAlert(false),
      });
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      navigation.navigate("SecurityPin", { email });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setAlertConfig({
        type: "error",
        title: "Đặt Lại Mật Khẩu Thất Bại",
        message:
          error.response?.data?.message ||
          "Không thể gửi mã xác minh. Vui lòng thử lại sau.",
        onConfirm: () => setShowAlert(false),
      });
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.greenBackground}>
          <Text style={styles.headerText}>Quên Mật Khẩu</Text>
        </View>

        <View style={styles.whiteContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>Đặt Lại Mật Khẩu?</Text>
            <Text style={styles.description}>
              Nhập địa chỉ email của bạn bên dưới để đặt lại mật khẩu. Chúng tôi
              sẽ gửi cho bạn một email với hướng dẫn.
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nhập Địa Chỉ Email"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.nextButton, loading && styles.disabledButton]}
              onPress={handleNextStep}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.nextButtonText}>Bước Tiếp Theo</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.signUpLink}>Đăng Ký</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <CustomAlert
          visible={showAlert}
          onClose={() => setShowAlert(false)}
          onConfirm={alertConfig.onConfirm}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  greenBackground: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 48,
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: "#E8F8F2",
    borderRadius: 12,
    marginBottom: 40,
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000000",
  },
  nextButton: {
    backgroundColor: "#00D09E",
    borderRadius: 25,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00D09E",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 40,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
  },
  signUpText: {
    color: "#666666",
    fontSize: 14,
  },
  signUpLink: {
    color: "#00D09E",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default ForgotPasswordScreen;
