import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const SecurityScreen = () => {
  const navigation = useNavigation();

  const menuItems = [
    {
      title: "Change Pin",
      icon: "key-outline",
      onPress: () => navigation.navigate("ChangePin"),
    },
    {
      title: "Terms And Conditions",
      icon: "document-text-outline",
      onPress: () => navigation.navigate("TermsAndConditions"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#00D09E"
        translucent={true}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Security</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={24} color="#666666" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 11,
    backgroundColor: "#00D09E",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    backgroundColor: "#F0FFF4",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  menuItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
  },
});

export default SecurityScreen;
