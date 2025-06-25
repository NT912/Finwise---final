import React, { useEffect, useState, ReactNode } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";

interface NetworkStatusMonitorProps {
  children?: ReactNode;
}

const NetworkStatusMonitor: React.FC<NetworkStatusMonitorProps> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [attemptingReconnect, setAttemptingReconnect] = useState(false);
  const translateY = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log("📶 Network state changed:", state.isConnected);
      setIsConnected(!!state.isConnected);
    });

    // Kiểm tra kết nối khi component mount
    checkConnection();

    return () => {
      unsubscribe();
    };
  }, []);

  // Kiểm tra kết nối mỗi khi trạng thái isConnected thay đổi
  useEffect(() => {
    if (isConnected) {
      // Ẩn thông báo khi có kết nối
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Hiện thông báo khi mất kết nối
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Thử kết nối lại sau mỗi 5 giây
      setAttemptingReconnect(true);
      const intervalId = setInterval(() => {
        checkConnection();
      }, 5000);

      return () => {
        clearInterval(intervalId);
        setAttemptingReconnect(false);
      };
    }
  }, [isConnected]);

  const checkConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      setIsConnected(!!state.isConnected);
      console.log(
        "📶 Connection check:",
        state.isConnected ? "Connected" : "Disconnected"
      );
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
            backgroundColor: attemptingReconnect ? "#FFB946" : "#FF6B6B",
          },
        ]}
      >
        <View style={styles.content}>
          <Ionicons
            name={attemptingReconnect ? "cellular" : "cellular-outline"}
            size={24}
            color="white"
          />
          <Text style={styles.text}>
            {attemptingReconnect
              ? "Đang thử kết nối lại..."
              : "Không có kết nối mạng"}
          </Text>
        </View>
      </Animated.View>
      {children}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  text: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default NetworkStatusMonitor;
