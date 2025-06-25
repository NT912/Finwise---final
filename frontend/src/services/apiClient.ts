import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { config } from "../config/config";
import { API_CONFIG } from "../env.config";
import { Platform } from "react-native";

// Danh sách các địa chỉ IP dự phòng để thử kết nối
const FALLBACK_IPS = [
  API_CONFIG.API_URL, // Thử URL từ env config trước
  config.api.baseUrl, // Thử URL từ config
  "http://localhost:3002",
  "http://127.0.0.1:3002",
  "http://10.0.2.2:3002", // Địa chỉ localhost cho Android Emulator
  "http://192.168.2.15:3003",
];

// Lấy API URL đã lưu từ AsyncStorage
const getStoredApiUrl = async () => {
  try {
    const url = await AsyncStorage.getItem("api_url");
    if (url) {
      console.log("🔍 Đã lấy API URL từ storage:", url);
      return url;
    }
    return null;
  } catch (error) {
    console.error("❌ Lỗi khi lấy API URL từ storage:", error);
    return null;
  }
};

// Lưu API URL vào AsyncStorage
const saveApiUrl = async (url: string) => {
  try {
    await AsyncStorage.setItem("api_url", url);
    console.log("✅ Đã lưu API URL:", url);
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi lưu API URL:", error);
    return false;
  }
};

// Đồng bộ với cấu hình từ apiService để đảm bảo tất cả các gọi API đều sử dụng cùng URL base
const getApiUrl = () => {
  // Ưu tiên sử dụng biến môi trường API_URL nếu có
  if (process.env.API_URL) {
    console.log("🔍 Sử dụng API_URL từ .env:", process.env.API_URL);
    return process.env.API_URL;
  }

  // Sử dụng URL từ config hoặc dùng URL fallback nếu không có
  const url = config.api.baseUrl || "http://192.168.2.5:3002";
  console.log("🔍 API URL from config:", url);
  return url;
};

// Khởi tạo với URL mặc định, sẽ được cập nhật sau
const API_URL = getApiUrl();
console.log("🔍 API URL hiện tại (apiClient):", API_URL);
const token = AsyncStorage.getItem("token");

console.log("token: ", token);

// Tạo instance axios với cấu hình chung
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
  timeout: config.api.timeout,
});

// Kiểm tra kết nối đến server với caching để tránh gọi liên tục
let lastConnectionCheck = 0;
let lastConnectionResult = false;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds

const checkServerConnection = async (url: string): Promise<boolean> => {
  try {
    // Kiểm tra nếu đã kiểm tra gần đây, trả về kết quả trước đó
    const now = Date.now();
    if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
      console.log(
        "📡 Using cached connection check result:",
        lastConnectionResult
      );
      return lastConnectionResult;
    }

    const response = await axios.get(`${url}/api/health`, {
      timeout: 3000,
    });

    // Cập nhật cache
    lastConnectionCheck = now;
    lastConnectionResult = response.status === 200 || response.status === 401;

    return lastConnectionResult;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      // Cập nhật cache
      lastConnectionCheck = Date.now();
      lastConnectionResult = true;
      return true; // 401 vẫn là kết nối thành công, chỉ là chưa xác thực
    }

    // Cập nhật cache
    lastConnectionCheck = Date.now();
    lastConnectionResult = false;
    return false;
  }
};

// Thử kết nối với tất cả các IP dự phòng - có caching
let cachedWorkingUrl: string | null = null;

const tryFallbackIps = async (): Promise<string | null> => {
  // Nếu đã có URL cached và chưa quá thời gian cache
  if (
    cachedWorkingUrl &&
    Date.now() - lastConnectionCheck < CONNECTION_CHECK_INTERVAL
  ) {
    console.log(`📡 Using cached working URL: ${cachedWorkingUrl}`);
    return cachedWorkingUrl;
  }

  console.log("🔄 Đang thử kết nối với các địa chỉ IP dự phòng...");

  // Thử với URL đã lưu trước đó
  const storedUrl = await getStoredApiUrl();
  if (storedUrl) {
    console.log(`🔄 Thử kết nối với URL đã lưu: ${storedUrl}`);
    if (await checkServerConnection(storedUrl)) {
      console.log(`✅ Kết nối thành công với ${storedUrl}`);
      cachedWorkingUrl = storedUrl;
      return storedUrl;
    }
  }

  // Giới hạn số lượng URL thử cùng lúc để tránh quá tải
  const priorityIPs = FALLBACK_IPS.slice(0, 3);

  // Thử các địa chỉ ưu tiên trước
  for (const ip of priorityIPs) {
    console.log(`🔄 Thử kết nối với IP ưu tiên: ${ip}`);
    if (await checkServerConnection(ip)) {
      console.log(`✅ Kết nối thành công với ${ip}`);
      saveApiUrl(ip);
      cachedWorkingUrl = ip;
      return ip;
    }
  }

  console.error("❌ Tất cả các IP ưu tiên đều thất bại");
  cachedWorkingUrl = null;
  return null;
};

// Khởi tạo API client và thử kết nối
const initializeApiClient = async () => {
  try {
    // Đầu tiên, thử lấy URL từ storage (đã được lưu bởi apiService)
    const storedUrl = await getStoredApiUrl();
    if (storedUrl) {
      console.log(`🔍 Thử URL đã lưu: ${storedUrl}`);
      // Kiểm tra kết nối trước khi sử dụng
      if (await checkServerConnection(storedUrl)) {
        console.log(`✅ Kết nối thành công với URL đã lưu: ${storedUrl}`);
        apiClient.defaults.baseURL = storedUrl;
        return;
      } else {
        console.log(`❌ URL đã lưu không kết nối được: ${storedUrl}`);
      }
    }

    // Tiếp theo, thử kết nối với URL hiện tại
    console.log(`🔍 Thử URL hiện tại: ${API_URL}`);
    if (await checkServerConnection(API_URL)) {
      console.log(`✅ Kết nối thành công với URL mặc định: ${API_URL}`);
      saveApiUrl(API_URL); // Lưu lại URL thành công
      return;
    }

    // Cuối cùng, thử với tất cả các IP dự phòng
    console.log("⚠️ Không thể kết nối với URL mặc định, thử các IP dự phòng");
    const workingUrl = await tryFallbackIps();

    if (workingUrl) {
      // Cập nhật baseURL cho apiClient
      apiClient.defaults.baseURL = workingUrl;
      console.log(`🔄 Đã cập nhật baseURL thành: ${workingUrl}`);
      saveApiUrl(workingUrl);
    } else {
      console.error("❌ Không thể kết nối đến bất kỳ địa chỉ nào!");
    }
  } catch (error) {
    console.error("❌ Lỗi khởi tạo API client:", error);
  }
};

// Chạy quá trình khởi tạo
initializeApiClient();

// Thêm interceptor cho request để tự động thêm token xác thực
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Add detailed logging for auth requests
      if (config.url?.includes("/auth/")) {
        console.log(
          `🔐 Auth Request: ${config.method?.toUpperCase()} ${config.url}`,
          {
            data: config.data
              ? JSON.stringify(config.data).substring(0, 100) + "..."
              : "No data",
            headers: config.headers,
          }
        );
      }

      // Try to get token - check multiple possible storage keys
      let token = null;

      // First try the config.auth.tokenKey if available
      token = await AsyncStorage.getItem("token");

      if (!token) {
        console.log(
          "Token not found in primary storage, checking alternatives"
        );
        // Try alternative storage keys
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          console.log("Found userId, token should be available");
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("✅ Added token to request headers");
      } else {
        if (
          config.url &&
          (config.url.includes("/auth/login") ||
            config.url.includes("/auth/register"))
        ) {
          console.log("🔑 Auth request - no token needed");
        } else {
          console.warn("⚠️ No token found in AsyncStorage");
        }
      }
    } catch (error) {
      console.error("❌ Error getting token:", error);
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Thêm interceptor cho response để xử lý lỗi
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ Response thành công (apiClient):", {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
    });

    // Log detailed data for debugging when getting transactions
    if (response.config.url?.includes("/transactions")) {
      console.log("🧾 Transaction response data structure:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        hasTransactionsByDate:
          response.data && response.data.transactionsByDate ? true : false,
        dataKeys: response.data ? Object.keys(response.data) : [],
        count: Array.isArray(response.data)
          ? response.data.length
          : response.data?.transactionsByDate
          ? response.data.transactionsByDate.length
          : "not applicable",
        // If it's a transaction response, log a sample
        sample:
          Array.isArray(response.data) && response.data.length > 0
            ? response.data[0]
            : response.data?.transactionsByDate?.length > 0
            ? {
                date: response.data.transactionsByDate[0].date,
                transactionCount:
                  response.data.transactionsByDate[0].transactions?.length,
              }
            : "no sample available",
      });
    }

    return response;
  },
  async (error) => {
    // Kiểm tra trạng thái lỗi 401 (Unauthorized) - token hết hạn hoặc không hợp lệ
    if (error.response && error.response.status === 401) {
      try {
        // Xóa token và thông tin người dùng
        await AsyncStorage.multiRemove(["token", "user"]);
      } catch (e) {
        console.error("Error removing auth data:", e);
      }
    }

    // Xử lý lỗi mạng và thử kết nối lại với các IP dự phòng
    if (error.message === "Network Error" || !error.response) {
      console.log("⚠️ Lỗi mạng, thử kết nối lại với các IP dự phòng");

      try {
        // Lưu lại request gốc
        const originalRequest = error.config;

        // Thử với các IP dự phòng
        const workingUrl = await tryFallbackIps();
        if (workingUrl) {
          // Cập nhật baseURL cho apiClient
          apiClient.defaults.baseURL = workingUrl;
          console.log(`🔄 Đã cập nhật baseURL thành: ${workingUrl}`);

          // Cập nhật baseURL cho request gốc
          originalRequest.baseURL = workingUrl;

          // Thông báo cho người dùng
          console.log(
            `🔄 Thử lại request với URL mới: ${originalRequest.baseURL}${originalRequest.url}`
          );

          // Thử lại request với URL mới
          return axios(originalRequest);
        } else {
          console.error("❌ Không tìm thấy URL hoạt động nào!");
        }
      } catch (fallbackError) {
        console.error("❌ Lỗi khi thử kết nối lại:", fallbackError);
      }
    }

    console.error("❌ Response error (apiClient):", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

export default apiClient;
