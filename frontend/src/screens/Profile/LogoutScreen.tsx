import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LogoutScreen = ({ navigation }: { navigation: any }) => {
  const handleLogout = async () => {
    try {
      // Xóa token đăng nhập
      await AsyncStorage.removeItem("token");
      console.log("✅ Đã xóa token đăng nhập");

      // Chuyển về màn hình đăng nhập
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.modalContainer}>
        <Text style={styles.title}>End Session</Text>
        <Text style={styles.message}>Are you sure you want to log out?</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Yes, End Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginVertical: 5,
  },
  logoutButton: {
    backgroundColor: "#00D09E",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
  },
});

export default LogoutScreen;
