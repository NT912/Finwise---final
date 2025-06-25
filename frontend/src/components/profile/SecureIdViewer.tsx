import React from "react";
import { View, StyleSheet } from "react-native";

// Nhận prop userId nhưng không hiển thị ID
type SecureIdViewerProps = {
  userId: string;
};

const SecureIdViewer: React.FC<SecureIdViewerProps> = () => {
  // Component trống, không hiển thị gì
  return <View style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    // Giữ một khoảng cách nhỏ để duy trì bố cục của màn hình
    marginVertical: 5,
  },
});

export default SecureIdViewer;
