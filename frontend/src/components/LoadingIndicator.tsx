import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import homeStyles from "../styles/home/homeStyles";

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Loading...",
}) => {
  return (
    <View style={homeStyles.loaderContainer}>
      <ActivityIndicator size="large" color="#00D09E" />
      {message && <Text style={styles.loadingText}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555555",
    textAlign: "center",
  },
});

export default LoadingIndicator;
