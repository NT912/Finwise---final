import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { RootStackParamList } from "../../types/navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Email và mật khẩu là bắt buộc");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
    } catch (error: any) {
      // Only log to console, don't show on screen
      console.error("Unexpected login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
                Welcome
              </Animated.Text>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.whiteContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.content}
          >
            <View style={styles.form}>
              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="example@example.com"
                    placeholderTextColor="#999999"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrorMessage(null);
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật Khẩu</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="• • • • • • • •"
                    placeholderTextColor="#999999"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrorMessage(null);
                    }}
                    secureTextEntry={!showPassword}
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
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    isLoading && styles.disabledButton,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                >
                  <Text style={styles.forgotPasswordText}>Quên Mật Khẩu?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text style={styles.signUpButtonText}>Đăng Ký</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    height: 280,
  },
  topSafeArea: {
    flex: 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: "center",
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 220,
  },
  content: {
    flex: 1,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#000000",
    marginTop: 40,
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#000000",
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: "#E8F8F2",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#000000",
  },
  eyeIcon: {
    padding: 8,
  },
  buttonContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  loginButton: {
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
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPasswordText: {
    color: "#000000",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 12,
  },
  signUpButton: {
    backgroundColor: "#E8F8F2",
    borderRadius: 25,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButtonText: {
    color: "#00D09E",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FFE8E8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default LoginScreen;
