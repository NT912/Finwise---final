import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "../services/authService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Define a more permissive login response type
interface LoginResponse {
  token?: string;
  success?: boolean;
  message?: string;
  [key: string]: any;
}

export const useAuth = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      console.log("📱 [useAuth] Attempting login with:", {
        email,
        password: "****",
      });

      // Use a type assertion to handle the response
      const response = (await authService.login(
        email,
        password
      )) as LoginResponse;
      console.log("📱 [useAuth] Login response:", response);

      if (response.token) {
        navigation.replace("TabNavigator");
        return { success: true };
      }

      // Nếu không thành công, lấy thông báo lỗi từ response
      const errorMessage =
        response.message || "Login failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } catch (err: any) {
      // Log the full error
      console.error("📱 [useAuth] Login error:", err);

      // Extract message from error response
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred. Please try again.";

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
  };
};

export default useAuth;
