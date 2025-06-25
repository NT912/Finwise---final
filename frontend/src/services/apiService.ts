import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { config } from "../config/config";
import apiClient from "./apiClient";

// Array of fallback IP addresses to try if main URL fails
const FALLBACK_IPS = [
  config.api.baseUrl, // Thử URL từ config trước
  "http://localhost:3002",
  "http://127.0.0.1:3002",
  "http://10.0.2.2:3002", // Android emulator default
  "http://192.168.2.15:3002",
];

// Lưu API URL vào AsyncStorage
export const saveApiUrl = async (url: string) => {
  try {
    await AsyncStorage.setItem("api_url", url);
    console.log("✅ Đã lưu API URL:", url);
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi lưu API URL:", error);
    return false;
  }
};

// Lấy API URL từ AsyncStorage
export const getStoredApiUrl = async () => {
  try {
    const url = await AsyncStorage.getItem("api_url");
    if (url) {
      console.log("🔍 Đã tìm thấy API URL đã lưu:", url);
      return url;
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy API URL:", error);
  }
  return null;
};

// Xác định baseURL dựa trên platform
const getBaseUrl = async () => {
  // Thử lấy từ AsyncStorage trước tiên
  const storedUrl = await getStoredApiUrl();
  if (storedUrl) {
    return storedUrl;
  }

  // Nếu không có URL đã lưu, xác định dựa trên platform
  if (Platform.OS === "android") {
    if (Platform.constants.Release === null) {
      // Android Emulator
      return "http://10.0.2.2:3002";
    }
    // Android Device
    return config.api.baseUrl;
  }
  // iOS hoặc platform khác
  return config.api.baseUrl;
};

// Function to try connecting to all fallback IPs
const tryFallbackIps = async () => {
  console.log("🔄 Trying fallback IP addresses...");

  // Check if we need to add the current baseURL to the fallback list
  if (!FALLBACK_IPS.includes(apiClient.defaults.baseURL as string)) {
    FALLBACK_IPS.unshift(apiClient.defaults.baseURL as string);
  }

  for (const ip of FALLBACK_IPS) {
    console.log(`🔄 Trying IP: ${ip}`);
    try {
      const response = await axios.get(`${ip}/api/health`, {
        timeout: 5000,
      });

      if (response.status === 200 || response.status === 401) {
        console.log(`✅ Successfully connected to ${ip}`);
        apiClient.defaults.baseURL = ip;
        saveApiUrl(ip);
        return true;
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.log(
          `✅ Successfully connected to ${ip} (401 is ok for health endpoint)`
        );
        apiClient.defaults.baseURL = ip;
        saveApiUrl(ip);
        return true;
      }
      console.log(`❌ Failed to connect to ${ip}: ${error.message}`);
    }
  }

  console.error("❌ All fallback IPs failed");
  return false;
};

// Khởi tạo API client với URL từ AsyncStorage hoặc giá trị mặc định
export const initializeApi = async () => {
  try {
    const baseUrl = await getBaseUrl();
    apiClient.defaults.baseURL = baseUrl;
    console.log("🚀 Khởi tạo API client với baseURL:", baseUrl);

    // Test the connection to see if we need to use fallbacks
    try {
      await checkServerConnection();
    } catch (error) {
      console.log("⚠️ Initial connection failed, trying fallbacks");

      const success = await tryFallbackIps();
      if (success) {
        // Cập nhật biến API_URL để đồng bộ với các module khác
        console.log("✅ Fallback successful, updating API URL");

        // Đảm bảo URL này là URL chung được sử dụng xuyên suốt ứng dụng
        exports.API_URL = apiClient.defaults.baseURL;
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Lỗi khởi tạo API client:", error);
    return false;
  }
};

// Gọi hàm khởi tạo ngay lập tức
initializeApi();

// Thêm hàm retry để thử lại request nhiều lần nếu có lỗi kết nối
export const retryRequest = async (
  requestFn: () => Promise<any>,
  maxRetries = 3
) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      console.log(`🔄 Attempt ${attempt + 1} failed: ${error.message}`);
      lastError = error;

      // If we've already retried several times, try fallback IPs
      if (attempt === 1) {
        console.log("⚠️ Trying fallback IPs after request failure");
        await tryFallbackIps();
      }

      // Wait a bit before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }

  throw lastError;
};

// Log mỗi request để debug
apiClient.interceptors.request.use((request) => {
  console.log("🔄 Request:", request.url);
  return request;
});

// Log mỗi response để debug
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log("🚨 API Error:", error.message, error.config?.url);

    // Xử lý lỗi mạng và thử kết nối lại
    if (error.message === "Network Error" || !error.response) {
      console.log("⚠️ Lỗi mạng, thử kết nối lại với các IP dự phòng");

      try {
        // Lưu lại request gốc
        const originalRequest = error.config;

        // Thử với các IP dự phòng
        const success = await tryFallbackIps();

        if (success && originalRequest) {
          // Thử lại request với URL mới
          console.log(
            "🔄 Thử lại request với URL mới:",
            apiClient.defaults.baseURL
          );

          // Cập nhật cài đặt trong request gốc
          originalRequest.baseURL = apiClient.defaults.baseURL;

          // Thông báo rõ ràng
          console.log(
            `🔄 Thử lại request với URL mới: ${originalRequest.baseURL}${originalRequest.url}`
          );

          // Thử lại request
          return axios(originalRequest);
        } else {
          console.error("❌ Không tìm thấy URL hoạt động nào!");
        }
      } catch (fallbackError) {
        console.error("❌ Lỗi khi thử kết nối lại:", fallbackError);
      }
    }

    return Promise.reject(error);
  }
);

// Xóa URL đã lưu
export const clearStoredUrl = async () => {
  try {
    await AsyncStorage.removeItem("api_url");
    console.log("🗑️ Đã xóa API URL từ AsyncStorage");
  } catch (error) {
    console.error("❌ Lỗi khi xóa API URL:", error);
  }
};

// Kiểm tra token hiện tại
export const checkCurrentToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    console.log("🔑 Token hiện tại:", token.substring(0, 20) + "...");
    return true;
  }
  console.warn("⚠️ Không tìm thấy token trong AsyncStorage");
  return false;
};

// Kiểm tra kết nối server
export const checkServerConnection = async () => {
  try {
    console.log(
      `🔍 Kiểm tra kết nối đến: ${apiClient.defaults.baseURL}/api/health`
    );
    const response = await axios.get(
      `${apiClient.defaults.baseURL}/api/health`,
      {
        timeout: 5000, // Reduced timeout for faster feedback
      }
    );
    console.log(`✅ Kết nối thành công, status: ${response.status}`);
    return true;
  } catch (error: any) {
    console.error(
      `❌ Lỗi kết nối đến ${apiClient.defaults.baseURL}:`,
      error.message
    );

    if (error.response) {
      // Server trả về response với status code không phải 2xx
      console.log(`⚠️ Server response: ${error.response.status}`);

      // Nếu server trả về 401, vẫn coi là kết nối thành công vì endpoint health không yêu cầu token
      if (error.response.status === 401) {
        console.log(`⚠️ Server yêu cầu xác thực, nhưng kết nối cơ bản là OK`);
        return true;
      }
    }

    // Nếu là lỗi mạng, thử lại với các IP dự phòng
    if (error.message === "Network Error" || error.code === "ECONNREFUSED") {
      console.log("⚠️ Lỗi kết nối mạng, thử các IP dự phòng");
      return await tryFallbackIps();
    }

    return false;
  }
};

// Interceptor request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error("Không có kết nối mạng");
      }

      const token = await AsyncStorage.getItem("token");

      // Nếu có token, thêm vào header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("❌ Lỗi trong interceptor request:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
