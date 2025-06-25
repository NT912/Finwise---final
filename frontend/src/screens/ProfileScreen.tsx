import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import LoadingIndicator from "../components/LoadingIndicator";
import api from "../services/apiService";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import AppHeader from "../components/common/AppHeader";
import {
  showError,
  showSuccess,
  showConfirmation,
} from "../services/alertService";

// Định nghĩa kiểu dữ liệu cho User
interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  totalBalance?: number;
  accountStatus: string;
  createdAt: string;
  updatedAt: string;
}

const ProfileScreen = ({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        navigation.navigate("Login");
        return;
      }

      console.log("✅ Đang gửi request lấy profile với token:", token);

      const response = await api.get("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ API /api/user/profile trả về:", response.data);
      setUser(response.data);
    } catch (error) {
      console.error("❌ Lỗi khi lấy thông tin profile:", error);
      showError("Error", "Could not load user information");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile", { user, onUpdate: fetchUserProfile });
  };

  const handleChangePassword = () => {
    navigation.navigate("ChangePassword");
  };

  const handleNotifications = () => {
    navigation.navigate("NotificationSettings");
  };

  const handleTermsAndConditions = () => {
    navigation.navigate("TermsAndConditions");
  };

  const handleLogout = () => {
    showConfirmation(
      "Confirm Logout",
      "Are you sure you want to log out of your account?",
      async () => {
        try {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          await AsyncStorage.removeItem("userId");
          showSuccess(
            "Logout Successful",
            "You have been logged out of your account"
          );
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        } catch (error) {
          console.error("Lỗi khi đăng xuất:", error);
          showError("Error", "Could not log out. Please try again.");
        }
      }
    );
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {user && (
        <>
          <AppHeader
            showBackButton={false}
            showAvatar={true}
            userName={user.fullName}
            backgroundColor="#F5F5F5"
          />

          <ScrollView style={styles.scrollContainer}>
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleEditProfile}
              >
                <Ionicons name="person-outline" size={24} color="#00D09E" />
                <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleChangePassword}
              >
                <Ionicons name="key-outline" size={24} color="#00D09E" />
                <Text style={styles.menuText}>Đổi mật khẩu</Text>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleNotifications}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#00D09E"
                />
                <Text style={styles.menuText}>Thông báo</Text>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleTermsAndConditions}
              >
                <Ionicons name="shield-checkmark" size={24} color="#00D09E" />
                <Text style={styles.menuText}>Điều khoản sử dụng</Text>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
                <Text style={[styles.menuText, styles.logoutText]}>
                  Đăng xuất
                </Text>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Thông tin tài khoản</Text>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Số dư</Text>
                <Text style={styles.infoValue}>
                  {user.totalBalance?.toLocaleString()} VND
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Trạng thái</Text>
                <Text style={styles.infoValue}>
                  {user.accountStatus === "active"
                    ? "Đang hoạt động"
                    : "Đã vô hiệu hóa"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ngày tạo</Text>
                <Text style={styles.infoValue}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContainer: {
    flex: 1,
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
  },
  logoutText: {
    color: "#FF6B6B",
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    margin: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});

export default ProfileScreen;
