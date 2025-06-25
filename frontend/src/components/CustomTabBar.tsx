import React from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const currentRoute = state.routes[state.index].name;

  const tabs = [
    { name: "HomeTab", icon: "home" as const },
    { name: "TransactionTab", icon: "list" as const },
    { name: "BudgetTab", icon: "pie-chart" as const },
    { name: "ProfileTab", icon: "person" as const },
  ] as const;

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = currentRoute === tab.name;
        return (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name={isActive ? tab.icon : `${tab.icon}-outline`}
                size={24}
                color={isActive ? "#00D09E" : "#64748B"}
              />
              {isActive && (
                <View style={styles.indicatorContainer}>
                  <View style={styles.indicator} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 80,
    backgroundColor: "#DFF7E2",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContent: {
    alignItems: "center",
    position: "relative",
    paddingVertical: 8,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: -8,
    width: "100%",
    alignItems: "center",
  },
  indicator: {
    width: 6,
    height: 6,
    backgroundColor: "#00D09E",
    borderRadius: 3,
  },
});

export default CustomTabBar;
