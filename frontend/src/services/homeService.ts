import AsyncStorage from "@react-native-async-storage/async-storage";
import * as savingService from "./savingService";
import * as walletService from "./walletService";
import apiClient from "./apiClient";

// Hàm utility để lấy năm và tháng hiện tại
export const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // getMonth() trả về 0-11, nên +1 để được 1-12
  };
};

// Tạo chuỗi năm-tháng cho API
export const getCurrentMonthString = () => {
  const { year, month } = getCurrentYearMonth();
  return `${year}-${month}`;
};

// 🏠 Lấy dữ liệu trang Home (Số dư, tổng chi tiêu) và tổng ngân sách của tháng hiện tại
export const fetchHomeData = async (filter = "monthly") => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    // Get user data - using a more resilient approach
    let userName = "User";
    let userAvatar = "";

    try {
      // Try to get user data, but don't let it block the whole function if it fails
      const userResponse = await apiClient.get("/api/user/profile");
      console.log("✅ User response:", userResponse.data);

      userName = userResponse.data.fullName || userResponse.data.name || "User";
      userAvatar = userResponse.data.avatar || "";
      console.log("✅ User data retrieved successfully:", userName);
    } catch (error: any) {
      console.warn(
        "⚠️ Failed to get user profile, continuing with defaults:",
        error.message
      );
      // Continue with default values
    }

    // Get total balance from wallets service - this will handle fallbacks internally
    const totalBalance = await walletService.fetchTotalBalance();

    return {
      userName,
      userAvatar,
      totalBalance,
      totalExpense: 0, // This will be calculated from transactions in HomeScreen
      monthlyIncome: 0, // This will be calculated from transactions in HomeScreen
      monthlyExpense: 0, // This will be calculated from transactions in HomeScreen
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      userName: "User",
      userAvatar: "",
      totalBalance: 0,
      totalExpense: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
    };
  }
};

// 📝 Lấy dữ liệu giao dịch gần đây
export const fetchTransactions = async (
  filter = "monthly",
  startDate?: Date,
  endDate?: Date
) => {
  try {
    console.log("🔄 Fetching transactions with filter:", filter);
    console.log("📅 Start date:", startDate?.toISOString());
    console.log("📅 End date:", endDate?.toISOString());

    // Tạo query params
    const params = new URLSearchParams();
    params.append("timeFilter", filter);
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    console.log(
      `🔄 Calling API: /api/transactions/date-range?${params.toString()}`
    );

    const response = await apiClient.get(
      `/api/transactions/date-range?${params.toString()}`
    );
    console.log("✅ API transactions response:", response.data);

    // Kiểm tra định dạng dữ liệu trả về
    if (response.data && response.data.transactions) {
      // Phát hiện cấu trúc dữ liệu mới: response.data.transactions là object với key là ngày
      if (
        typeof response.data.transactions === "object" &&
        !Array.isArray(response.data.transactions)
      ) {
        // Chuyển đổi từ {date: transaction[]} sang mảng phẳng
        const flattenedTransactions = [];
        for (const date in response.data.transactions) {
          if (
            Object.prototype.hasOwnProperty.call(
              response.data.transactions,
              date
            )
          ) {
            const transactionsForDate = response.data.transactions[date];
            if (Array.isArray(transactionsForDate)) {
              flattenedTransactions.push(...transactionsForDate);
            }
          }
        }
        console.log(
          `✅ Flattened ${flattenedTransactions.length} transactions from date-grouped format`
        );
        return flattenedTransactions;
      } else if (Array.isArray(response.data.transactions)) {
        return response.data.transactions;
      }
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn("⚠️ Unexpected transaction data format:", response.data);
      return [];
    }
  } catch (error: any) {
    console.error("🚨 Error fetching transactions:", error.message);

    if (error.response) {
      console.error("🚨 Error details:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
      });
    }

    // Trả về mảng rỗng thay vì throw error
    return [];
  }
};
