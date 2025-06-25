import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme";

interface FilterButtonsProps {
  selectedFilter: "Daily" | "Weekly" | "Monthly";
  onFilterChange: (filter: "Daily" | "Weekly" | "Monthly") => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  return (
    <View style={styles.filterContainer}>
      {["Daily", "Weekly", "Monthly"].map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            selectedFilter === filter && styles.filterButtonActive,
          ]}
          onPress={() =>
            onFilterChange(filter as "Daily" | "Weekly" | "Monthly")
          }
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === filter && styles.filterTextActive,
            ]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default FilterButtons;
