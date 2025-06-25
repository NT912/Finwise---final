import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TabOption {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface TabSelectorProps {
  options: TabOption[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({
  options,
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.tabContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[styles.tab, activeTab === option.key && styles.activeTab]}
          onPress={() => onTabChange(option.key)}
          activeOpacity={0.7}
        >
          <View style={styles.tabContent}>
            <Ionicons
              name={option.icon}
              size={20}
              color={activeTab === option.key ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === option.key && styles.activeTabText,
              ]}
            >
              {option.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    marginBottom: 20,
    marginHorizontal: 5,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 5,
    alignItems: "center",
    borderRadius: 22,
    marginHorizontal: 2,
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#00D09E",
    shadowColor: "#00D09E",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  tabText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
    marginLeft: 5,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default TabSelector;
