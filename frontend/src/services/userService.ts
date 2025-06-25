import apiClient from "./apiClient";

// Lấy thông tin user
export const fetchUserProfile = async () => {
  try {
    // Sử dụng apiClient để tận dụng cơ chế retry và fallback
    const response = await apiClient.get("/api/user/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Cập nhật thông tin user
export const updateUserProfile = async (userData: any) => {
  try {
    // Sử dụng apiClient để tận dụng cơ chế retry và fallback
    const response = await apiClient.put("/api/user/profile/update", userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Thay đổi mật khẩu
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  try {
    // Sử dụng apiClient để tận dụng cơ chế retry và fallback
    const response = await apiClient.post("/api/user/profile/change-password", {
      currentPassword,
      newPassword,
      verificationMethod: "password",
    });
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

// Upload avatar
export const uploadAvatar = async (formData: FormData) => {
  try {
    // Sử dụng apiClient để tận dụng cơ chế retry và fallback
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
