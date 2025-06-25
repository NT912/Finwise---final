// Define a single API URL that will be used throughout the app
// Sử dụng URL từ biến môi trường, nếu không có thì dùng URL local
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://192.168.2.32:3003" ||
  "http://172.20.10.2:3000";

// Log URL để debug
console.log("📡 CONFIG: API BASE URL is set to:", API_BASE_URL);

export const config = {
  api: {
    baseUrl: API_BASE_URL,
    timeout: 30000,
  },
  app: {
    name: "FinWise",
    version: "1.0.0",
  },
  auth: {
    tokenKey: "token",
    userKey: "user",
  },
} as const;

export type Config = typeof config;

// Export API_URL for backward compatibility
export const API_URL = API_BASE_URL;
