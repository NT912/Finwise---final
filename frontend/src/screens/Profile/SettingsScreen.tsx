import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ProfileStackParamList } from "../../navigation/types";

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();

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
          <Text style={styles.headerTitle}>Cài Đặt</Text>
        </View>
        <View style={styles.placeholderButton} />
      </View>

      {/* White container with settings items */}
      <View style={styles.contentContainer}>
        {/* Notification Settings */}
        {/* Xóa Notification Settings item */}

        {/* Password Settings */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={24} color="#00D09E" />
          </View>
          <Text style={styles.settingText}>Cài Đặt Mật Khẩu</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={[styles.settingItem, { borderBottomWidth: 0 }]}
          onPress={() => navigation.navigate("DeleteAccount")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
          </View>
          <Text style={styles.settingText}>Xóa Tài Khoản</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>
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
  rightIcon: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F6F9F8",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1FFF9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
});

export default SettingsScreen;
