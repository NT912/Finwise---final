import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface AppHeaderProps {
  showBackButton?: boolean;
  showAvatar?: boolean;
  backgroundColor?: string;
  textColor?: string;
  customLeftComponent?: React.ReactNode;
  customRightComponent?: React.ReactNode;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  userName?: string;
  headerTitle?: string;
  showNotification?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showBackButton = false,
  showAvatar = true,
  backgroundColor = "#00D09E",
  textColor = "#000000",
  customLeftComponent,
  customRightComponent,
  onBackPress,
  onNotificationPress,
  userName = "",
  headerTitle,
  showNotification = true,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return "Good Morning";
    } else if (currentHour >= 12 && currentHour < 17) {
      return "Good Afternoon";
    } else if (currentHour >= 17 && currentHour < 22) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.headerContent}>
        {showBackButton ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        ) : null}

        <View
          style={[styles.titleContainer, showBackButton && { marginLeft: 10 }]}
        >
          {headerTitle ? (
            <Text style={[styles.headerTitleText, { color: textColor }]}>
              {headerTitle}
            </Text>
          ) : (
            <>
              <Text style={[styles.greetingText, { color: textColor }]}>
                {getGreeting()}
              </Text>
              <Text style={[styles.welcomeText, { color: textColor }]}>
                Hi, {userName || "User"}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 10,
  },
  titleContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#000000",
    opacity: 0.9,
    marginTop: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    lineHeight: 32,
  },
  notificationButton: {
    marginLeft: 16,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
});

export default AppHeader;
