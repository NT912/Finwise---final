import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Image,
  Text,
  Modal,
  StyleSheet,
  Animated,
  StatusBar,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileMenu from "../../components/profile/ProfileMenu";
import LoadingIndicator from "../../components/LoadingIndicator";
import { fetchUserProfile } from "../../services/userService";
import commonProfileStyles from "../../styles/profile/commonProfileStyles";
import {
  ProfileStackParamList,
  RootStackParamList,
} from "../../navigation/types";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { User } from "../../types";
import { StackNavigationProp } from "@react-navigation/stack";
import categoryStyles from "../../styles/category/categoryStyles";

// Định nghĩa kiểu cho navigation
type ProfileScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  "Profile"
>;

// Add type for root navigation
type RootScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "TabNavigator"
>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const rootNavigation = useNavigation<RootScreenNavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await fetchUserProfile();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu hồ sơ");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogoutPress = () => {
    setLogoutModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogoutCancel = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setLogoutModalVisible(false);
    });
  };

  const handleLogoutConfirm = async () => {
    try {
      await AsyncStorage.removeItem("token");
      console.log("Token removed successfully");

      setLogoutModalVisible(false);

      rootNavigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert(
        "Đăng xuất thất bại",
        "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại."
      );
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserData().then(() => setRefreshing(false));
  }, []);

  // Add this function to handle profile updates
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const menuItems = [
    {
      icon: "person-outline",
      text: "Chỉnh Sửa Hồ Sơ",
      onPress: () => {
        if (user) {
          navigation.navigate("EditProfile");
        } else {
          Alert.alert("Lỗi", "Không thể tải hồ sơ người dùng");
        }
      },
      color: "#4DABFF",
      textColor: "#FFFFFF",
    },
    {
      icon: "settings-outline",
      text: "Cài Đặt",
      onPress: () => navigation.navigate("Settings"),
      color: "#4DABFF",
      textColor: "#FFFFFF",
    },
    {
      icon: "document-text-outline",
      text: "Điều Khoản & Điều Kiện",
      onPress: () => navigation.navigate("Terms"),
      color: "#4DABFF",
      textColor: "#FFFFFF",
    },
    {
      icon: "help-circle-outline",
      text: "Trợ Giúp",
      onPress: () => navigation.navigate("Help"),
      color: "#4DABFF",
      textColor: "#FFFFFF",
    },
    {
      icon: "log-out-outline",
      text: "Đăng Xuất",
      onPress: handleLogoutPress,
      color: "#4DABFF",
      textColor: "#FFFFFF",
    },
  ];

  // Display user's name
  const renderUsername = () => {
    return (
      <View style={styles.usernameContainer}>
        <Text style={styles.usernameText}>
          {user?.fullName || "Người dùng"}
        </Text>
      </View>
    );
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#00D09E"
        translucent={true}
      />

      {/* Header với tiêu đề giữa */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Hồ Sơ</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.contentContainer}>
        {/* Avatar và tên người dùng */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
                user?.avatar
                  ? { uri: user.avatar }
                  : require("../../../assets/user-avatar.png")
              }
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{user?.fullName || "Người dùng"}</Text>
        </View>

        {/* Phần nội dung cố định */}
        <View style={styles.staticContent}>
          {/* Menu items */}
          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View
                  style={[styles.iconCircle, { backgroundColor: item.color }]}
                >
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={item.textColor}
                  />
                </View>
                <Text style={styles.menuText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={handleLogoutCancel}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Warning Icon */}
            <View style={styles.warningIconContainer}>
              <FontAwesome5
                name="exclamation-triangle"
                size={40}
                color="#FF6B35"
              />
            </View>

            <Text style={styles.modalTitle}>Cảnh Báo Đăng Xuất</Text>
            <Text style={styles.modalMessage}>
              Bạn chắc chắn muốn đăng xuất khỏi FinWise?{"\n"}
              Hành động này sẽ đưa bạn về màn hình đăng nhập và bạn sẽ cần đăng
              nhập lại để tiếp tục sử dụng ứng dụng.
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleLogoutConfirm}
              >
                <Text style={styles.confirmButtonText}>Đăng Xuất</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleLogoutCancel}
              >
                <Text style={styles.cancelButtonText}>Hủy Bỏ</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  placeholder: {
    width: 40,
    height: 40,
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
  notificationButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "transparent",
  },
  avatarContainer: {
    position: "absolute",
    alignItems: "center",
    width: "100%",
    top: 20,
    zIndex: 10,
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
  },
  staticContent: {
    flex: 1,
    backgroundColor: "#F0FFF4",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: 75,
    paddingTop: 125,
    paddingBottom: 30,
  },
  menuList: {
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginVertical: 6,
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  warningIconContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#FFF5F5",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#FFE5E5",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#D32F2F",
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    color: "#424242",
    lineHeight: 22,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  confirmButton: {
    backgroundColor: "#D32F2F",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    flex: 1,
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    color: "#424242",
    fontSize: 16,
    fontWeight: "500",
  },
  usernameContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  usernameText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1a1a1a",
  },
});

export default ProfileScreen;
