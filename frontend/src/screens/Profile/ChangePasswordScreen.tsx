import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ProfileStackParamList } from "../../navigation/types";

const ChangePasswordScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [circleScale] = useState(new Animated.Value(0));
  const [dotScale] = useState(new Animated.Value(0));

  // Animation for success screen
  useEffect(() => {
    if (isSuccess) {
      // Animate circle
      Animated.sequence([
        Animated.timing(circleScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        // Animate dot after circle animation
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Navigate back to Profile after 2 seconds
      const timer = setTimeout(() => {
        navigation.navigate("Profile");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigation, circleScale, dotScale]);

  const handleChangePassword = () => {
    // Validate passwords
    if (!currentPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (!newPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu mới");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu không khớp");
      return;
    }

    // Here you would call your API to change the password
    // After successful API call:
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#00D09E" />
        <View style={styles.successContent}>
          <Animated.View
            style={[
              styles.circle,
              {
                transform: [{ scale: circleScale }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.dot,
                {
                  transform: [{ scale: dotScale }],
                },
              ]}
            />
          </Animated.View>
          <Text style={styles.successTitle}>Mật Khẩu Đã Được</Text>
          <Text style={styles.successTitle}>Thay Đổi Thành Công</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00D09E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Đổi Mật Khẩu</Text>
        </View>
        <View style={styles.placeholderButton} />
      </View>

      {/* Content */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.contentContainer}>
          {/* Current Password */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Mật Khẩu Hiện Tại</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                placeholder="••••••••"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons
                  name={showCurrentPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Mật Khẩu Mới</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                placeholder="••••••••"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Xác Nhận Mật Khẩu Mới</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="••••••••"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={styles.changeButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.changeButtonText}>Đổi Mật Khẩu</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  placeholderButton: {
    width: 40,
    height: 40,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F6F9F8",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5F8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 55,
  },
  input: {
    flex: 1,
    height: 55,
    color: "#333",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  changeButton: {
    backgroundColor: "#00D09E",
    borderRadius: 30,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  changeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    backgroundColor: "#00D09E",
    justifyContent: "center",
    alignItems: "center",
  },
  successContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
});

export default ChangePasswordScreen;
