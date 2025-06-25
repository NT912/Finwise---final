import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";

const { width, height } = Dimensions.get("window");

type NavigationProp = StackNavigationProp<RootStackParamList, "Onboarding">;

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [currentPage, setCurrentPage] = useState(1);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Animation cho fade-in/fade-out

  // Hàm chuyển trang với hiệu ứng fade-in
  const handleNext = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(2);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.slide, { opacity: fadeAnim }]}>
        {currentPage === 1 ? (
          <>
            <Text style={styles.title}>Welcome To Expense Manager</Text>
            <Image
              source={require("../../assets/onboarding1.png")}
              style={styles.image}
            />
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>
              Are You Ready To Take Control Of Your Finances?
            </Text>
            <Image
              source={require("../../assets/onboarding2.png")}
              style={styles.image}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.replace("Login")}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3FFF8",
    justifyContent: "center",
    alignItems: "center",
  },
  slide: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#00C897",
    marginBottom: 20,
  },
  image: {
    width: width * 0.7,
    height: height * 0.4,
    resizeMode: "contain",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#00C897",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
