import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AnalysisScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Financial Analysis</Text>
      <Text>Income: $7,783.00</Text>
      <Text>Expense: -$1,187.40</Text>
      <Text>Projected Savings: $6,595.60</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f0f0f0" },
  header: { fontSize: 22, fontWeight: "bold" },
});

export default AnalysisScreen;
