import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { forgotPassword } from "../../services/authService";
import CustomAlert from "../../components/common/CustomAlert";
import apiClient from "../../services/apiClient";

type SecurityPinScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SecurityPin"
>;

const SecurityPinScreen = () => {
  const navigation = useNavigation<SecurityPinScreenNavigationProp>();
  const route = useRoute();
  const { email } = route.params as { email: string };
  const [pin, setPin] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "error" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handlePinInput = async (number: string) => {
    if (pin.length < 6) {
      const newPin = [...pin, number];
      setPin(newPin);

      if (newPin.length === 6) {
        setIsLoading(true);
        try {
          const pinString = newPin.join("");
          console.log("Sending pin:", pinString);

          const response = await apiClient.post("/api/auth/verify-reset-code", {
            email,
            resetCode: pinString,
          });
          if (response.data && response.data.success) {
            navigation.navigate("ResetPassword", {
              email,
              resetCode: pinString,
            });
          } else {
            setAlertConfig({
              type: "error",
              title: "Mã Không Hợp Lệ",
              message:
                response.data?.message || "Vui lòng kiểm tra mã và thử lại.",
              onConfirm: () => setShowAlert(false),
            });
            setShowAlert(true);
            setPin([]);
          }
        } catch (error: any) {
          console.error("Error verifying code:", error);
          setAlertConfig({
            type: "error",
            title: "Xác Minh Thất Bại",
            message: "Không thể xác minh mã bảo mật. Vui lòng thử lại.",
            onConfirm: () => setShowAlert(false),
          });
          setShowAlert(true);
          setPin([]);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleAccept = () => {
    const pinString = pin.join("");
    navigation.navigate("ResetPassword", {
      email,
      resetCode: pinString,
    });
  };

  const handleResendCode = async () => {
    try {
      await forgotPassword(email);
      setAlertConfig({
        type: "success",
        title: "Đã Gửi Mã",
        message: "Mã bảo mật mới đã được gửi đến email của bạn.",
        onConfirm: () => setShowAlert(false),
      });
      setShowAlert(true);
      setPin([]);
    } catch (error: any) {
      setAlertConfig({
        type: "error",
        title: "Gửi Mã Thất Bại",
        message: error.message || "Không thể gửi mã mới. Vui lòng thử lại sau.",
        onConfirm: () => setShowAlert(false),
      });
      setShowAlert(true);
    }
  };

  const renderPinDots = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D09E" />
          <Text style={styles.loadingText}>Đang xác minh mã...</Text>
        </View>
      );
    }

    return (
      <View style={styles.dotsContainer}>
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < pin.length ? styles.dotFilled : styles.dotEmpty,
            ]}
          >
            {index < pin.length && (
              <Text style={styles.pinText}>{pin[index]}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      ["", "0", "delete"],
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((num, index) => {
              if (num === "") {
                return <View key={index} style={styles.emptyButton} />;
              }
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.numberButton,
                    num === "delete" && styles.deleteButton,
                  ]}
                  onPress={() =>
                    num === "delete" ? handleDelete() : handlePinInput(num)
                  }
                >
                  {num === "delete" ? (
                    <Ionicons
                      name="backspace-outline"
                      size={24}
                      color="#666666"
                    />
                  ) : (
                    <Text style={styles.numberText}>{num}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.greenBackground}>
        <Text style={styles.title}>Mã Bảo Mật</Text>
      </View>
      <View style={styles.whiteContainer}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>Nhập Mã Bảo Mật</Text>

          {renderPinDots()}
          {renderNumberPad()}

          <View style={styles.bottomContent}>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendCode}
            >
              <Text style={styles.resendText}>Gửi Lại</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.signUpText}>Đăng Ký</Text>
              </TouchableOpacity>
            </View>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
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
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  bottomContent: {
    width: "100%",
    alignItems: "center",
    marginTop: 0,
    paddingBottom: 30,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 12,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dotEmpty: {
    borderColor: "#00D09E",
    backgroundColor: "transparent",
  },
  dotFilled: {
    borderColor: "#00D09E",
    backgroundColor: "#E8F8F2",
  },
  pinText: {
    fontSize: 20,
    color: "#00D09E",
  },
  acceptButton: {
    backgroundColor: "#00D09E",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 0,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#00D09E",
  },
  resendText: {
    color: "#00D09E",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    marginTop: 0,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  signUpText: {
    color: "#00D09E",
    fontSize: 14,
    fontWeight: "600",
  },
  numberPad: {
    width: "100%",
    maxWidth: 250,
    marginBottom: 20,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 14,
    width: "100%",
    gap: 12,
  },
  numberButton: {
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyButton: {
    width: 65,
    height: 65,
    backgroundColor: "transparent",
  },
  deleteButton: {
    backgroundColor: "#F8F8F8",
  },
  numberText: {
    fontSize: 24,
    color: "#333333",
    fontWeight: "500",
  },
  loadingContainer: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
});

export default SecurityPinScreen;
