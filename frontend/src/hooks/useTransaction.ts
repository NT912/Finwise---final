import { useState } from "react";
import apiClient from "../services/apiClient";
import { Transaction as TransactionType } from "../types";

export type Transaction = TransactionType;

export const useTransaction = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearTransactions = () => {
    console.log("🧹 Clearing transaction data cache");
    setTransactions([]);
  };

  const getTransactions = async (params?: {
    startDate?: string;
    endDate?: string;
    walletId?: string;
    timeFilter?: "week" | "month" | "year" | "custom";
  }) => {
    setLoading(true);
    setError(null);
    try {
      let response;

      // Nếu đã cung cấp startDate và endDate, sử dụng endpoint date-range
      if (params?.startDate && params?.endDate) {
        console.log(`🔄 Calling API: /api/transactions/date-range`);
        console.log(`📅 Start date: ${params.startDate}`);
        console.log(`📅 End date: ${params.endDate}`);
        if (params.walletId) {
          console.log(`👛 Filtering by wallet ID: ${params.walletId}`);
        } else {
          console.log(`👛 No wallet filter applied (showing all wallets)`);
        }

        response = await apiClient.get("/api/transactions/date-range", {
          params,
        });

        // Log information về cấu trúc response
        console.log("🧾 Transaction response data structure:", {
          count: Array.isArray(response.data)
            ? response.data.length
            : "not applicable",
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          dataKeys:
            typeof response.data === "object" && response.data
              ? Object.keys(response.data)
              : [],
          hasData: !!response.data,
          hasTransactionsByDate: !!(
            response.data && response.data.transactionsByDate
          ),
          sample: "no sample available",
        });

        // Parse the transactions from the response structure
        if (response.data && response.data.transactions) {
          // Kiểm tra xem transactions có phải là object với key là ngày không
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

            setTransactions(flattenedTransactions);
            return flattenedTransactions;
          } else if (Array.isArray(response.data.transactions)) {
            console.log(
              `✅ Received ${response.data.transactions.length} transactions in array format`
            );

            setTransactions(response.data.transactions);
            return response.data.transactions;
          }
        } else if (response.data && response.data.transactionsByDate) {
          // Legacy format
          const allTransactions = response.data.transactionsByDate.flatMap(
            (dateGroup: any) => dateGroup.transactions
          );
          console.log(
            `✅ Received ${allTransactions.length} transactions from date-range API (legacy format)`
          );

          setTransactions(allTransactions);
          return allTransactions;
        } else {
          console.log(`ℹ️ No transactions found for the given date range`);
          setTransactions([]);
          return [];
        }
      } else {
        // Use the regular transactions endpoint if no specific dates
        console.log(`🔄 Calling API: /api/transactions`);
        if (params?.walletId) {
          console.log(`👛 Filtering by wallet ID: ${params.walletId}`);
        }
        response = await apiClient.get("/api/transactions", { params });

        // Log information về cấu trúc response
        console.log("🧾 Transaction response data structure:", {
          count: Array.isArray(response.data) ? response.data.length : 0,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          dataKeys:
            typeof response.data === "object" && response.data
              ? Object.keys(response.data)
              : [],
          hasData: !!response.data,
          hasTransactionsByDate: !!(
            response.data && response.data.transactionsByDate
          ),
          sample: "no sample available",
        });

        // Check if the response is in the new format with transactions property
        if (response.data && response.data.transactions) {
          console.log(
            `✅ Received ${response.data.transactions.length} transactions`
          );
          setTransactions(response.data.transactions);
          return response.data.transactions;
        }
        // Check legacy format with transactionsByDate
        else if (response.data && response.data.transactionsByDate) {
          const allTransactions = response.data.transactionsByDate.flatMap(
            (dateGroup: any) => dateGroup.transactions
          );
          console.log(
            `✅ Received ${allTransactions.length} transactions from regular API (legacy format)`
          );
          setTransactions(allTransactions);
          return allTransactions;
        } else if (Array.isArray(response.data)) {
          // Plain array format
          console.log(
            `✅ Received ${response.data.length} transactions in direct array format`
          );
          setTransactions(response.data);
          return response.data;
        } else {
          // Fallback case
          console.log(
            `⚠️ Unexpected response format, defaulting to empty array`
          );
          setTransactions([]);
          return [];
        }
      }
    } catch (err: any) {
      setError("Failed to fetch transactions");
      console.error("🚨 Error fetching transactions:", err.message);
      console.error("🚨 Error details:", err.response?.data || err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTransactionById = async (id: string) => {
    try {
      const response = await apiClient.get(`/api/transactions/${id}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching transaction:", err);
      throw err;
    }
  };

  const updateTransaction = async (
    id: string,
    data: {
      amount: number;
      description?: string;
      type: "income" | "expense";
      category: string;
      walletId: string;
      date: Date;
      note?: string;
    }
  ) => {
    try {
      const response = await apiClient.put(`/api/transactions/${id}`, data);
      return response.data;
    } catch (err) {
      console.error("Error updating transaction:", err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      // 1. Lấy thông tin transaction trước khi xóa để biết số tiền và category
      const transactionToDelete = await getTransactionById(id);

      // 2. Xóa transaction
      await apiClient.delete(`/api/transactions/${id}`);

      // 3. Nếu transaction là expense và có category, cập nhật lại budget
      if (
        transactionToDelete.type === "expense" &&
        transactionToDelete.category
      ) {
        try {
          // Lấy thông tin budget hiện tại
          const budgetResponse = await apiClient.get(
            `/api/budgets/${transactionToDelete.category}`
          );
          const currentBudget = budgetResponse.data;

          // Cập nhật lại số tiền đã chi tiêu
          const updatedSpent = Math.max(
            0,
            currentBudget.currentAmount - transactionToDelete.amount
          );

          // Gửi request cập nhật budget
          await apiClient.put(`/api/budgets/${transactionToDelete.category}`, {
            ...currentBudget,
            currentAmount: updatedSpent,
          });

          console.log(
            `✅ Updated budget spent amount after deleting transaction: ${updatedSpent}`
          );
        } catch (budgetError) {
          console.error(
            "Error updating budget after transaction deletion:",
            budgetError
          );
        }
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    clearTransactions,
  };
};
