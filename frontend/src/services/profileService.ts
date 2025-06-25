import apiClient from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Get user profile information
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get("/api/user/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Update profile information
export const updateUserProfile = async (profileData: any) => {
  try {
    const response = await apiClient.put(
      "/api/user/profile/update",
      profileData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Change password
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  verificationMethod?: string;
  verificationCode?: string;
}) => {
  try {
    const response = await apiClient.post(
      "/api/user/profile/change-password",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

// Send password change verification code via email
export const sendPasswordChangeCode = async () => {
  try {
    const response = await apiClient.post(
      "/api/user/profile/send-password-change-code"
    );
    return response.data;
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw error;
  }
};

// Update notification settings
export const updateNotificationSettings = async (settings: {
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  budgetAlerts?: boolean;
  goalAlerts?: boolean;
  billReminders?: boolean;
}) => {
  try {
    const response = await apiClient.put(
      "/api/user/profile/notifications",
      settings
    );
    return response.data;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
};

// Upload avatar
export const uploadAvatar = async (formData: FormData) => {
  try {
    const response = await apiClient.post(
      "/api/user/profile/upload-avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
};

// Delete account
export const deleteAccount = async (password: string) => {
  try {
    console.log("🚨 Attempting to delete account...");

    // Sử dụng delete với body
    const response = await apiClient.delete("/api/user/profile/delete", {
      data: { password },
    });

    console.log("✅ Account deletion successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting account:", error);
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
  sendPasswordChangeCode,
  updateNotificationSettings,
  uploadAvatar,
  deleteAccount,
};
