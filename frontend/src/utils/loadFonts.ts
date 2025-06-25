import * as Font from "expo-font";
import { Platform } from "react-native";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_300Light,
} from "@expo-google-fonts/roboto";

// Định nghĩa interface để tránh lỗi index signature
interface FontStatus {
  "Roboto-Regular": boolean;
  "Roboto-Medium": boolean;
  "Roboto-Bold": boolean;
  "Roboto-Light": boolean;
  [key: string]: boolean; // Cho phép đánh chỉ mục bằng string
}

interface SystemFonts {
  regular: string;
  medium: string;
  bold: string;
  light: string;
  [key: string]: string; // Cho phép đánh chỉ mục bằng string
}

// Danh sách font hệ thống dự phòng theo platform
const systemFonts: SystemFonts = Platform.select({
  ios: {
    regular: "System",
    medium: "System",
    bold: "System",
    light: "System",
  },
  android: {
    regular: "sans-serif",
    medium: "sans-serif-medium",
    bold: "sans-serif-bold",
    light: "sans-serif-light",
  },
  default: {
    regular: "System",
    medium: "System",
    bold: "System",
    light: "System",
  },
}) as SystemFonts;

// Font đã tải thành công
export const loadedFonts: FontStatus = {
  "Roboto-Regular": false,
  "Roboto-Medium": false,
  "Roboto-Bold": false,
  "Roboto-Light": false,
};

export const loadFonts = async () => {
  console.log("🔠 Bắt đầu tải fonts với @expo-google-fonts/roboto...");

  try {
    // Tải fonts từ thư viện Google Fonts
    await Font.loadAsync({
      "Roboto-Regular": Roboto_400Regular,
      "Roboto-Medium": Roboto_500Medium,
      "Roboto-Bold": Roboto_700Bold,
      "Roboto-Light": Roboto_300Light,
    });

    // Đánh dấu tất cả fonts đã tải thành công
    Object.keys(loadedFonts).forEach((fontName) => {
      loadedFonts[fontName] = true;
    });

    console.log("✅ Tất cả fonts đã tải thành công");
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi tải fonts:", error);
    console.log("⚠️ Chuyển sang sử dụng fonts hệ thống");
    return false;
  }
};

// Định nghĩa type cho weight để sử dụng với TypeScript
type FontWeight = "regular" | "medium" | "bold" | "light";

// Ánh xạ từ weight sang tên font
const weightToFont: Record<FontWeight, string> = {
  regular: "Roboto-Regular",
  medium: "Roboto-Medium",
  bold: "Roboto-Bold",
  light: "Roboto-Light",
};

// Lấy font family phù hợp dựa trên trạng thái tải
export const getFontFamily = (weight: FontWeight = "regular"): string => {
  const fontName = weightToFont[weight];

  // Nếu font đã tải thành công, sử dụng font đó
  if (fontName in loadedFonts && loadedFonts[fontName]) {
    return fontName;
  }

  // Nếu không, sử dụng font hệ thống tương ứng
  return systemFonts[weight];
};
