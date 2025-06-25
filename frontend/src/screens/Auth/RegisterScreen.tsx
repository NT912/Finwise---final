import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
  SafeAreaView,
  Animated,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { register } from "../../services/authService";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import Modal from "react-native-modal";
import { RootStackParamList } from "@/types/navigation";
import CustomAlert from "../../components/common/CustomAlert";

type RegisterScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Custom Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "error" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  const capitalizeWords = (text: string) => {
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleFullNameChange = (text: string) => {
    setFullName(capitalizeWords(text));
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError("Mật khẩu không khớp");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleRegister = async () => {
    try {
      if (!fullName || !email || !password) {
        setAlertConfig({
          type: "error",
          title: "Thiếu Thông Tin",
          message:
            "Vui lòng nhập đầy đủ họ tên, email và mật khẩu để tiếp tục.",
          onConfirm: () => setShowAlert(false),
        });
        setShowAlert(true);
        return;
      }

      if (!validatePassword(password)) {
        return;
      }

      setIsLoading(true);

      await register({
        fullName,
        email,
        password,
        phoneNumber: mobile,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined,
      });

      setAlertConfig({
        type: "success",
        title: "Đăng Ký Thành Công",
        message: "Tài khoản của bạn đã được tạo thành công!",
        onConfirm: () => {
          setShowAlert(false);
          navigation.replace("Onboarding" as keyof RootStackParamList);
        },
      });
      setShowAlert(true);
    } catch (error: any) {
      console.error("❌ Registration failed:", error.message);
      setAlertConfig({
        type: "error",
        title: "Lỗi Đăng Ký",
        message:
          error.message ||
          "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.",
        onConfirm: () => setShowAlert(false),
      });
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.greenBackground}>
        <SafeAreaView style={styles.topSafeArea}>
          <View style={styles.header}>
            <Animated.Text
              style={[
                styles.titleText,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              Tạo Tài Khoản
            </Animated.Text>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.whiteContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          <ScrollView style={styles.scrollView}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ Và Tên</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập họ và tên của bạn"
                    placeholderTextColor="#999999"
                    value={fullName}
                    onChangeText={handleFullNameChange}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="example@example.com"
                    placeholderTextColor="#999999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số Điện Thoại</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="+ 84 123 456 789"
                    placeholderTextColor="#999999"
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày Sinh</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={[
                      styles.input,
                      dateOfBirth ? {} : styles.placeholder,
                    ]}
                  >
                    {dateOfBirth
                      ? format(dateOfBirth, "dd/MM/yyyy")
                      : "DD/MM/YYYY"}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={24}
                    color="#999999"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </View>

              <Modal
                isVisible={showDatePicker}
                onBackdropPress={closeDatePicker}
                backdropOpacity={0.5}
                style={styles.modalContainer}
              >
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>Chọn Ngày</Text>
                    <TouchableOpacity onPress={closeDatePicker}>
                      <Ionicons name="close" size={24} color="#000000" />
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={dateOfBirth || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    textColor="#000000"
                    style={styles.datePicker}
                  />
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={closeDatePicker}
                  >
                    <Text style={styles.confirmButtonText}>Xác Nhận</Text>
                  </TouchableOpacity>
                </View>
              </Modal>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật Khẩu</Text>
                <View
                  style={[
                    styles.inputContainer,
                    passwordError ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="• • • • • • • •"
                    placeholderTextColor="#999999"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError("");
                    }}
                    secureTextEntry={!showPassword}
                    autoComplete="off"
                    textContentType="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={24}
                      color="#999999"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Xác Nhận Mật Khẩu</Text>
                <View
                  style={[
                    styles.inputContainer,
                    passwordError ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="• • • • • • • •"
                    placeholderTextColor="#999999"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setPasswordError("");
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="off"
                    textContentType="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={24}
                      color="#999999"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.termsText}>
                Bằng việc tiếp tục, bạn đồng ý với{"\n"}
                <Text
                  style={styles.termsLink}
                  onPress={() => {
                    navigation.navigate("TermsOfUse");
                  }}
                >
                  Điều Khoản Sử Dụng
                </Text>{" "}
                và{" "}
                <Text
                  style={styles.termsLink}
                  onPress={() => {
                    navigation.navigate("PrivacyPolicy");
                  }}
                >
                  Chính Sách Bảo Mật
                </Text>
                .
              </Text>

              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.signUpButtonText}>Đăng Ký</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginPrompt}>
                <Text style={styles.loginPromptText}>
                  Đã có tài khoản?{" "}
                  <Text
                    style={styles.loginLink}
                    onPress={() => navigation.navigate("Login")}
                  >
                    Đăng Nhập
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  greenBackground: {
    backgroundColor: "#00D09E",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  topSafeArea: {
    flex: 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: "center",
  },
  titleText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#000000",
    marginTop: 0,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 120,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 6,
  },
  inputContainer: {
    backgroundColor: "#E8F8F2",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#000000",
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  eyeIcon: {
    padding: 6,
  },
  termsText: {
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  termsLink: {
    color: "#00D09E",
  },
  signUpButton: {
    backgroundColor: "#00D09E",
    borderRadius: 25,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#00D09E",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginPrompt: {
    alignItems: "center",
    marginTop: 20,
  },
  loginPromptText: {
    fontSize: 14,
    color: "#666666",
  },
  loginLink: {
    color: "#00D09E",
    fontWeight: "600",
  },
  calendarIcon: {
    padding: 6,
  },
  placeholder: {
    color: "#999999",
  },
  modalContainer: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  datePicker: {
    width: 300,
    height: 200,
  },
  confirmButton: {
    backgroundColor: "#00D09E",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default RegisterScreen;
