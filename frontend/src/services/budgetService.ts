import apiClient from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "../config/config";
import axios from "axios";
import { Budget } from "../types/budget";

// Budget types
export interface Budget {
  _id: string;
  name: string;
  amount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  categories: string[];
  userId: string;
  walletId: string;
  isRecurring: boolean;
  recurringFrequency?: "weekly" | "monthly" | "yearly";
  status: "active" | "expired" | "completed" | "overbudget";
  notificationThreshold?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetParams {
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
  categories: string[];
  walletId: string;
  isRecurring?: boolean;
  recurringFrequency?: "weekly" | "monthly" | "yearly";
  notificationThreshold?: number;
  notes?: string;
}

export interface UpdateBudgetParams {
  name?: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  categories?: string[];
  walletId?: string;
  isRecurring?: boolean;
  recurringFrequency?: "weekly" | "monthly" | "yearly";
  notificationThreshold?: number;
  notes?: string;
}

export interface BudgetSummary {
  totalBudgeted: number;
  totalSpent: number;
  averageUsagePercentage: number;
  totalBudgets: number;
  inProgressBudgets: number;
  completedBudgets: number;
  exceededBudgets: number;
}

export interface BudgetResponse {
  budgets: Budget[];
  summary: BudgetSummary;
}

export interface BudgetFilters {
  status?: string;
  isRecurring?: boolean;
  walletId?: string;
  startDate?: string;
  endDate?: string;
  _t?: number;
}

// Helper function to get auth header
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem(config.auth.tokenKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get all budgets with optional filters
 */
export const getBudgets = async (
  filters: BudgetFilters = {}
): Promise<BudgetResponse> => {
  try {
    console.log("[budgetService] getBudgets - Bắt đầu với filters:", filters);
    const authHeader = await getAuthHeader();

    // Build query parameters
    const params = new URLSearchParams();

    // Thêm các filter vào params
    if (filters.status) params.append("status", filters.status);
    if (filters.isRecurring !== undefined)
      params.append("isRecurring", String(filters.isRecurring));

    // Xử lý walletId - giá trị "all" được truyền và xử lý ở backend
    if (filters.walletId) {
      console.log(
        `[budgetService] Truyền walletId lên API: ${filters.walletId}`
      );
      params.append("walletId", filters.walletId);
    } else {
      // Explicitly request all wallets for consistency with forceRefreshBudgets
      params.append("walletId", "all");
      console.log(`[budgetService] Requesting all wallets explicitly`);
    }

    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    // Thêm timestamp để tránh cache
    params.append("_t", String(Date.now()));

    const queryParams = `?${params.toString()}`;
    console.log("[budgetService] URL params cuối cùng:", queryParams);

    // Add no-cache headers
    const headers = {
      ...authHeader,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };

    const url = `/api/budgets${queryParams}`;
    console.log("[budgetService] Full URL:", url);

    const response = await apiClient.get(url, {
      headers,
    });

    console.log("[budgetService] getBudgets - Nhận response:", {
      budgetCount: response.data.budgets?.length || 0,
      summary: response.data.summary,
      status: response.status,
    });

    return response.data;
  } catch (error) {
    console.error("[budgetService] Error fetching budgets:", error);
    throw error;
  }
};

/**
 * Get budget by ID
 */
export const getBudgetById = async (budgetId: string): Promise<any> => {
  try {
    const authHeader = await getAuthHeader();
    const response = await apiClient.get(`/api/budgets/${budgetId}`, {
      headers: { ...authHeader },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching budget ${budgetId}:`, error);
    throw error;
  }
};

/**
 * Create a new budget
 */
export const createBudget = async (
  budgetData: CreateBudgetParams
): Promise<any> => {
  try {
    const authHeader = await getAuthHeader();
    const response = await apiClient.post("/api/budgets", budgetData, {
      headers: { ...authHeader },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating budget:", error);
    throw error;
  }
};

/**
 * Update existing budget
 */
export const updateBudget = async (
  budgetId: string,
  budgetData: CreateBudgetParams
): Promise<any> => {
  try {
    const authHeader = await getAuthHeader();
    const response = await apiClient.put(
      `/api/budgets/${budgetId}`,
      budgetData,
      {
        headers: { ...authHeader },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error updating budget ${budgetId}:`, error);
    throw error;
  }
};

/**
 * Delete a budget
 */
export const deleteBudget = async (
  budgetId: string,
  deleteAllRecurring?: boolean
): Promise<any> => {
  try {
    const authHeader = await getAuthHeader();

    let url = `/api/budgets/${budgetId}`;
    if (deleteAllRecurring) {
      url += `?deleteAllRecurring=true`;
    }

    const response = await apiClient.delete(url, {
      headers: { ...authHeader },
    });

    return response.data;
  } catch (error) {
    console.error(`Error deleting budget ${budgetId}:`, error);
    throw error;
  }
};

/**
 * Get monthly budget report
 */
export const getBudgetReport = async (
  month?: number,
  year?: number
): Promise<any> => {
  try {
    const authHeader = await getAuthHeader();

    // Build query parameters
    let url = "/api/budgets/report";
    if (month !== undefined && year !== undefined) {
      url += `?month=${month}&year=${year}`;
    }

    const response = await apiClient.get(url, {
      headers: { ...authHeader },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching budget report:", error);
    throw error;
  }
};

/**
 * Force refresh budget data
 * (Will pull the latest budget data directly from the database, bypassing any caching)
 */
export const forceRefreshBudgets = async (
  walletId?: string | null
): Promise<BudgetResponse> => {
  try {
    console.log(
      "[budgetService] Forcing budget data refresh...",
      walletId ? `for wallet: ${walletId}` : "for all wallets"
    );

    const authHeader = await getAuthHeader();
    const timestamp = Date.now(); // Add timestamp to prevent caching

    // Use the existing endpoint but add special params to bypass cache
    const params = new URLSearchParams();
    params.append("_t", timestamp.toString()); // Timestamp for cache busting
    params.append("forceRefresh", "true"); // Hint for any middleware to bypass cache
    params.append("status", "active"); // Only active budgets

    // Add wallet filter if provided
    if (walletId) {
      params.append("walletId", walletId);
      console.log(`[budgetService] Adding wallet filter: ${walletId}`);
    } else {
      // Explicitly request all wallets
      params.append("walletId", "all");
      console.log(`[budgetService] Requesting all wallets`);
    }

    const url = `/api/budgets?${params.toString()}`;
    console.log("[budgetService] Direct budget refresh URL:", url);

    const response = await apiClient.get(url, {
      headers: {
        ...authHeader,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    console.log("[budgetService] Budget data refresh completed, received:", {
      budgetCount: response.data.budgets?.length || 0,
      summary: response.data.summary,
    });

    return response.data;
  } catch (error) {
    console.error("[budgetService] Error refreshing budget data:", error);
    throw error;
  }
};

export const budgetService = {
  // Get all budgets
  getBudgets: async (
    walletId?: string
  ): Promise<{ budgets: Budget[]; summary: BudgetSummary }> => {
    try {
      const params = walletId ? { walletId } : {};
      const response = await axios.get("/budgets", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get budget by ID
  getBudgetById: async (budgetId: string): Promise<Budget> => {
    try {
      const response = await axios.get(`/budgets/${budgetId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new budget
  createBudget: async (budgetData: Partial<Budget>): Promise<Budget> => {
    try {
      const response = await axios.post("/budgets", budgetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update budget
  updateBudget: async (
    budgetId: string,
    budgetData: Partial<Budget>
  ): Promise<Budget> => {
    try {
      const response = await axios.put(`/budgets/${budgetId}`, budgetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete budget
  deleteBudget: async (budgetId: string): Promise<void> => {
    try {
      await axios.delete(`/budgets/${budgetId}`);
    } catch (error) {
      throw error;
    }
  },
};
