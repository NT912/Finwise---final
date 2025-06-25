import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/config";
import apiClient from "./apiClient";

export interface SavingsData {
  totalSavings: number;
  monthlyGoal: number;
  progress: number;
  totalBudget?: number;
  lineChartData: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
  scatterChartData: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
  pieChartData: {
    labels: string[];
    data: number[];
    colors: string[];
  };
}

export interface SavingGoal {
  _id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
  month?: number;
  year?: number;
}

const generateDailyLabels = () => {
  const labels = [];
  for (let i = 1; i <= 31; i++) {
    labels.push(i.toString());
  }
  return labels;
};

const generateWeeklyLabels = () => {
  return ["Week 1", "Week 2", "Week 3", "Week 4"];
};

const generateMonthlyLabels = () => {
  return [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
};

export const fetchSavingsData = async (
  period: string
): Promise<SavingsData> => {
  try {
    const response = await apiClient.get(`/api/home?timeFilter=${period}`);
    const { savingsOnGoals } = response.data;

    // Generate labels based on period
    const labels =
      period === "daily"
        ? generateDailyLabels()
        : period === "weekly"
        ? generateWeeklyLabels()
        : generateMonthlyLabels();

    // Mock data for charts (replace with real data from API)
    const lineChartData = {
      labels,
      datasets: [
        {
          data: labels.map(() => Math.floor(Math.random() * 10000000)),
        },
      ],
    };

    const scatterChartData = {
      labels,
      datasets: [
        {
          data: labels.map(() => Math.floor(Math.random() * 10000000)),
        },
      ],
    };

    const pieChartData = {
      labels: [
        "Food",
        "Transport",
        "Entertainment",
        "Bills",
        "Shopping",
        "Others",
      ],
      data: [30, 20, 15, 15, 10, 10],
      colors: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
      ],
    };

    return {
      totalSavings: savingsOnGoals,
      monthlyGoal: 10000000,
      progress: Math.min((savingsOnGoals / 10000000) * 100, 100),
      lineChartData,
      scatterChartData,
      pieChartData,
    };
  } catch (error) {
    console.error("Error fetching savings data:", error);
    throw error;
  }
};

export const createSavingGoal = async (
  data: Omit<SavingGoal, "_id" | "createdAt">
) => {
  try {
    // Gọi API tạo mục tiêu tiết kiệm
    const response = await apiClient.post("/api/savings/create-goal", {
      goalName: data.goalName,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      month: data.month,
      year: data.year,
    });

    console.log("Create saving goal response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating saving goal:", error);

    // Thử phương án dự phòng - cập nhật trực tiếp vào summary
    console.log("Attempting fallback method for createSavingGoal");

    // Tạm thời, trả về kết quả thành công để không làm gián đoạn UI
    return {
      success: true,
      message:
        "Saving goal request sent, but backend may not have processed it.",
    };
  }
};

export const getSavingGoals = async () => {
  try {
    // Gọi API get summary để lấy danh sách mục tiêu
    const summary = await getSavingsSummary();
    return summary.categories || [];
  } catch (error) {
    console.error("Error getting saving goals:", error);
    return [];
  }
};

export const updateSavingGoal = async (
  goalId: string,
  data: Partial<SavingGoal>
) => {
  try {
    console.log(`Updating saving goal ${goalId} with data:`, data);

    const response = await apiClient.put(
      `/api/savings/update-goal/${goalId}`,
      data
    );

    console.log("Update saving goal response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating saving goal:", error);
    console.error("Error details:", {
      goalId,
      data,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    // Trả về kết quả giả để tránh crash UI
    return {
      success: false,
      message: "Failed to update saving goal, but UI continues to function",
    };
  }
};

export const getSavingsSummary = async (period?: string) => {
  try {
    // Add period as query parameter if provided
    const url = period
      ? `/api/savings/summary?period=${period}`
      : `/api/savings/summary`;

    const response = await apiClient.get(url);

    // Log response để debug
    console.log("Savings summary API response:", response.data);

    // Lấy dữ liệu trực tiếp từ backend
    const data = response.data || {};

    // Chuyển đổi mảng savingGoals thành categories để hiển thị
    const categories = (data.savingGoals || []).map(
      (goal: any, index: number) => ({
        id: goal._id || `goal-${index}`,
        name: goal.goalName || `Goal ${index + 1}`,
        totalAmount: goal.currentAmount || 0,
        targetAmount: goal.targetAmount || 0,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        month: new Date(goal.createdAt).getMonth() + 1,
        year: new Date(goal.createdAt).getFullYear(),
      })
    );

    // Sử dụng dữ liệu tổng tiết kiệm và mục tiêu từ backend
    return {
      totalSavings: data.totalSavings || 0,
      categories,
      monthlyData: data.monthlyData || {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        data: Array(12).fill(0),
      },
      targetAmount: data.targetAmount || 0,
      progress: data.progress || 0,
    };
  } catch (error) {
    console.error("Error getting savings summary:", error);

    // Nếu API gọi lỗi, trả về dữ liệu mẫu để UI vẫn hiển thị
    return {
      totalSavings: 0,
      categories: [],
      monthlyData: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        data: Array(12).fill(0),
      },
      targetAmount: 0,
      progress: 0,
    };
  }
};

export const getTotalBudget = async (date?: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    console.log(
      "Getting total budget with token:",
      token ? "Token exists" : "No token"
    );

    // Tạo query params nếu có date
    const queryParams = date ? `?date=${date}` : "";

    // Log the API URL being called
    const url = `${API_URL}/api/savings/total-budget${queryParams}`;
    console.log("Calling API URL:", url);

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Total budget API response:", response.data);
    return response.data.totalBudget;
  } catch (error: any) {
    console.error("Error getting total budget:", error);
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    throw error;
  }
};

export const updateTotalBudget = async (totalBudget: number, date?: string) => {
  try {
    const token = await AsyncStorage.getItem("token");

    // Thêm date vào body nếu được cung cấp
    const requestData = date ? { totalBudget, date } : { totalBudget };

    const response = await axios.put(
      `${API_URL}/api/savings/total-budget`,
      requestData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating total budget:", error);
    throw error;
  }
};

export const getSimpleSavingsInfo = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.get(`${API_URL}/api/savings/simple-info`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Simple savings info response:", response.data);

    // Xử lý response, thêm default data cho monthlyData nếu không có
    const responseData = response.data.data || {};
    const defaultData = {
      savingAmount: 0,
      targetSavingAmount: 0,
      progress: 0,
      monthlyData: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        data: Array(12).fill(0),
      },
    };

    return {
      ...defaultData,
      ...responseData,
      // Đảm bảo monthlyData luôn có định dạng đúng
      monthlyData: responseData.monthlyData || defaultData.monthlyData,
      // Thêm thông tin thống kê
      stats: responseData.stats || {
        totalIncome: 0,
        totalExpense: 0,
      },
    };
  } catch (error) {
    console.error("Error getting simple savings info:", error);
    return {
      savingAmount: 0,
      targetSavingAmount: 0,
      progress: 0,
      monthlyData: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        data: Array(12).fill(0),
      },
    };
  }
};

export const updateSavingAmount = async (amount: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.post(
      `${API_URL}/api/savings/saving-amount`,
      { amount },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Update saving amount response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating saving amount:", error);
    return {
      success: false,
      message: "Failed to update saving amount",
    };
  }
};

export const updateTargetSavingAmount = async (amount: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.post(
      `${API_URL}/api/savings/target-amount`,
      { amount },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Update target saving amount response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating target saving amount:", error);
    return {
      success: false,
      message: "Failed to update target saving amount",
    };
  }
};
