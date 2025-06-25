import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import AppHeader from "../components/common/AppHeader";

const SettingsScreen = () => {
  const [notifications, setNotifications] = React.useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <AppHeader
        showBackButton={true}
        showAvatar={false}
        showNotification={false}
        title="Settings"
        backgroundColor="#F5F5F5"
      />

      <ScrollView style={styles.content}>
        <View style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: "#00D09E" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: "#767577", true: "#00D09E" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Currency</Text>
            <Text style={styles.settingValue}>VND</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Language</Text>
            <Text style={styles.settingValue}>English</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLabel: {
    fontSize: 16,
    color: "#333333",
  },
  settingValue: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
});

export default SettingsScreen;
