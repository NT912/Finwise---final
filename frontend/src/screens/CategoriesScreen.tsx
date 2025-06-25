import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CategoriesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Categories</Text>
      <Text>Food</Text>
      <Text>Transport</Text>
      <Text>Entertainment</Text>
      <Text>Rent</Text>
      <Text>Groceries</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});

export default CategoriesScreen;
