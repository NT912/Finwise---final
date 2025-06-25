import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyCategoriesProps {
  onAddCategory: () => void;
}

const EmptyCategories: React.FC<EmptyCategoriesProps> = ({ onAddCategory }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="folder-open" size={64} color="#666" />
      <Text style={styles.title}>No Categories Found</Text>
      <Text style={styles.subtitle}>
        Start by adding your first category to organize your transactions
      </Text>
      <TouchableOpacity style={styles.button} onPress={onAddCategory}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.buttonText}>Add Category</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00D09E",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default EmptyCategories;
