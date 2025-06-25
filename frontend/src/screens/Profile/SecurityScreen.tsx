import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getUserProfile } from "../../services/profileService";
import commonProfileStyles from "../../styles/profile/commonProfileStyles";

const SecurityScreen = ({ navigation }: { navigation: any }) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await getUserProfile();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const securityItems = [
    {
      icon: "lock-closed",
      title: "Change Password",
      description: "Update your account password",
      onPress: () => navigation.navigate("ChangePassword"),
    },
  ];

  return (
    <SafeAreaView style={commonProfileStyles.container}>
      <View style={commonProfileStyles.enhancedHeader}>
        <TouchableOpacity
          style={commonProfileStyles.enhancedBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={commonProfileStyles.enhancedHeaderTitle}>
          Change Password
        </Text>
      </View>

      <ScrollView
        style={commonProfileStyles.scrollView}
        contentContainerStyle={commonProfileStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00D09E"]}
            tintColor="#00D09E"
          />
        }
      >
        <View style={commonProfileStyles.section}>
          {securityItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                commonProfileStyles.menuItem,
                index === securityItems.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={item.onPress}
            >
              <View style={commonProfileStyles.menuIcon}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color="#00D09E"
                />
              </View>
              <View style={commonProfileStyles.menuContent}>
                <Text style={commonProfileStyles.menuTitle}>{item.title}</Text>
                <Text style={commonProfileStyles.menuDescription}>
                  {item.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SecurityScreen;
