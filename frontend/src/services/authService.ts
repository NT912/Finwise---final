import apiClient from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { config } from "../config/config";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Đăng ký tài khoản
export const register = async (props: {
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string | any;
  fullName: string;
}): Promise<AuthResponse> => {
  const { email, password, phoneNumber, dateOfBirth, fullName } = props;
  const response = await apiClient.post("/api/auth/register", {
    email,
    password,
    phoneNumber,
    dateOfBirth,
    fullName,
  });
  const { token, user } = response.data;

  await AsyncStorage.setItem(config.auth.tokenKey, token);
  await AsyncStorage.setItem(config.auth.userKey, JSON.stringify(user));

  return response.data;
};

// Đăng nhập
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await apiClient.post("/api/auth/login", { email, password });
  const { token, user } = response.data;

  await AsyncStorage.setItem(config.auth.tokenKey, token);
  await AsyncStorage.setItem(config.auth.userKey, JSON.stringify(user));
  await AsyncStorage.setItem("userId", user.id);

  console.log("🔐 Login success - Stored data:", {
    token: token ? `${token.substring(0, 20)}...` : null,
    userId: user.id,
    user: user,
  });

  return response.data;
};

// Forgot password - request reset code
export const forgotPassword = async (email: string): Promise<any> => {
  const response = await apiClient.post("/api/auth/forgot-password", { email });
  return response.data;
};

// Reset password with code
export const resetPassword = async (
  email: string,
  resetCode: string,
  newPassword: string
): Promise<any> => {
  const response = await apiClient.post("/api/auth/reset-password", {
    email,
    resetCode,
    newPassword,
  });
  return response.data;
};

// Đăng xuất
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      config.auth.tokenKey,
      config.auth.userKey,
      "userId",
    ]);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Lấy thông tin người dùng
export const getCurrentUser = async (): Promise<any> => {
  try {
    const userStr = await AsyncStorage.getItem(config.auth.userKey);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
};

// Kiểm tra xem người dùng đã đăng nhập chưa
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(config.auth.tokenKey);
    return !!token;
  } catch (error) {
    console.error("Check authentication error:", error);
    return false;
  }
};

export const verifyEmail = async (email: string, code: string) => {
  const response = await apiClient.post("/api/auth/verify-email", {
    email,
    code,
  });
  return response.data;
};

export const resendVerificationCode = async (email: string) => {
  const response = await apiClient.post("/api/auth/resend-verification", {
    email,
  });
  return response.data;
};

export default {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationCode,
  getCurrentUser,
  isAuthenticated,
};
