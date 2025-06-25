import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { resetPassword } from "../../services/authService";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../../components/common/CustomAlert";

// Định nghĩa kiểu cho navigation
type ResetPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ResetPassword"
>;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute();
  const { email, resetCode } = route.params as {
    email?: string;
    resetCode?: string;
  };

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Custom Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "error" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (!email || !resetCode) {
      console.error("Missing required params:", { email, resetCode });
      setAlertConfig({
        type: "error",
        title: "Thiếu Thông Tin",
        message: "Thông tin cần thiết bị thiếu. Vui lòng thử lại.",
        onConfirm: () => {
          setShowAlert(false);
          navigation.replace("ForgotPassword");
        },
      });
      setShowAlert(true);
    }
  }, [email, resetCode]);

  const handleResetPassword = async () => {
    // Validate inputs
    if (!newPassword || !confirmPassword) {
      setAlertConfig({
        type: "error",
        title: "Thông Tin Không Đầy Đủ",
        message: "Vui lòng nhập cả hai trường mật khẩu để tiếp tục.",
        onConfirm: () => setShowAlert(false),
      });
      setShowAlert(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertConfig({
        type: "error",
        title: "Mật Khẩu Không Khớp",
        message: "Vui lòng đảm bảo mật khẩu của bạn khớp nhau và thử lại.",
        onConfirm: () => setShowAlert(false),
      });
      setShowAlert(true);
      return;
    }

    if (newPassword.length < 6) {
      setAlertConfig({
        type: "error",
        title: "Mật Khẩu Quá Ngắn",
        message: "Mật khẩu của bạn phải có ít nhất 6 ký tự.",
        onConfirm: () => setShowAlert(false),
      });
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email!, resetCode!, newPassword);

      setAlertConfig({
        type: "success",
        title: "Thành Công!",
        message:
          "Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.",
        onConfirm: () => {
          setShowAlert(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      });
      setShowAlert(true);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setAlertConfig({
        type: "error",
        title: "Đặt Lại Thất Bại",
        message:
          error.response?.data?.message ||
          "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.",
        onConfirm: () => setShowAlert(false),
      });
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.greenBackground}>
          <Text style={styles.title}>Mật Khẩu Mới</Text>
        </View>

        <View style={styles.whiteContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidView}
            keyboardVerticalOffset={Platform.OS === "ios" ? -64 : 0}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Mật Khẩu Mới</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      placeholder="Nhập mật khẩu mới"
                      style={styles.input}
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Ionicons
                        name={
                          showNewPassword ? "eye-outline" : "eye-off-outline"
                        }
                        size={24}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Xác Nhận Mật Khẩu Mới</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      placeholder="Xác nhận mật khẩu mới"
                      style={styles.input}
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-outline"
                            : "eye-off-outline"
                        }
                        size={24}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Đổi Mật Khẩu</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  innerContainer: {
    flex: 1,
  },
  greenBackground: {
    height: "25%",
    backgroundColor: "#00D09E",
    justifyContent: "center",
    alignItems: "center",
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    paddingTop: 30,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    color: "#333",
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    padding: 8,
  },
  button: {
    backgroundColor: "#00D09E",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
