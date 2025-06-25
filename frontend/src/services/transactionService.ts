import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/config";

// Transaction Interface
export interface Transaction {
  _id: string;
  title: string;
  amount: number;
  date: string;
  category:
    | string
    | {
        _id: string;
        name: string;
        icon: string;
        color: string;
        type: string;
      };
  type: "income" | "expense";
  note?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Lấy tất cả giao dịch với bộ lọc thời gian
export const fetchTransactionsTime = async (timeFilter = "monthly") => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(
      `${API_URL}/api/transactions?timeFilter=${timeFilter}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return Array.isArray(response.data)
      ? response.data
      : response.data.transactions || [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

// Lấy chi tiết một giao dịch
export const getTransactionById = async (transactionId: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(
      `${API_URL}/api/transactions/${transactionId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Nếu trả về object có _id thì là transaction hợp lệ
    if (response.data && response.data._id) {
      return response.data;
    } else {
      // Nếu trả về message hoặc không có _id thì coi như không tìm thấy
      return null;
    }
  } catch (error) {
    console.error(`Error fetching transaction ${transactionId}:`, error);
    return null; // Để UI hiện lỗi rõ ràng
  }
};

// Tạo một giao dịch mới
export const createTransaction = async (transactionData: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `${API_URL}/api/transactions`,
      transactionData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};

// Cập nhật một giao dịch
export const updateTransaction = async (
  transactionId: string,
  transactionData: any
) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.put(
      `${API_URL}/api/transactions/${transactionId}`,
      transactionData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error updating transaction ${transactionId}:`, error);
    throw error;
  }
};

// Xóa một giao dịch
export const deleteTransaction = async (transactionId: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.delete(
      `${API_URL}/api/transactions/${transactionId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error deleting transaction ${transactionId}:`, error);
    throw error;
  }
};

// Lấy thống kê cho biểu đồ
export const getTransactionStats = async (period = "monthly") => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(
      `${API_URL}/api/transactions/stats?period=${period}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      categories: [],
    };
  }
};

// Lấy báo cáo chi tiết cho màn hình báo cáo
export const fetchMonthlyReport = async (
  period: string = "monthly",
  walletId?: string
) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    let url = `${API_URL}/api/transactions/report?period=${period}`;
    if (walletId && walletId !== "all") {
      url += `&walletId=${walletId}`;
    }

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    throw error; // Throw error để frontend có thể xử lý
  }
};
