import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
import { BarChart } from "react-native-chart-kit";
import { formatVND } from "../../utils/formatters";
import apiClient from "../../services/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { fetchHomeData, fetchTransactions } from "../../services/homeService";
import { fetchWallets } from "../../services/walletService";

interface Period {
  key: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
}

interface Category {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  count: number;
}

interface ReportData {
  period: "weekly" | "monthly" | "yearly";
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  timeRange: {
    start: string;
    end: string;
  };
  periods: Period[];
  categories: {
    income: Category[];
    expense: Category[];
  };
}

interface TopSpending {
  category: string;
  amount: number;
}

interface TransactionItem {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: {
    name: string;
    color: string;
    icon: string;
  };
  date: string;
}

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isIncludedInTotal: boolean;
  isDefault: boolean;
  userId: string;
}

type PeriodFilter = "weekly" | "monthly" | "yearly";

const screenWidth = Dimensions.get("window").width;

export const ReportPeriod: React.FC<any> = () => {
  const navigation = useNavigation<any>();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("monthly");
  const [viewType, setViewType] = useState<"chart" | "summary">("chart");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [topSpendingRange, setTopSpendingRange] = useState<"week" | "month">(
    "month"
  );
  const [topSpending, setTopSpending] = useState<TopSpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month">("month");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    previousStartDate: new Date(),
    previousEndDate: new Date(),
  });
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const calculateCategorySpending = (transactions: TransactionItem[]) => {
    return transactions.reduce((acc: Record<string, number>, transaction) => {
      if (transaction.type === "expense") {
        const categoryName =
          typeof transaction.category === "string"
            ? transaction.category
            : transaction.category.name;
        acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
      }
      return acc;
    }, {});
  };

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      // Tính toán ngày bắt đầu và kết thúc dựa trên timeRange
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
      let previousStartDate: Date;
      let previousEndDate: Date;

      if (timeRange === "week") {
        // Lấy ngày đầu tuần (Thứ 2) theo múi giờ Việt Nam
        startDate = new Date(now);
        // Điều chỉnh theo múi giờ Việt Nam (UTC+7)
        startDate.setUTCHours(0, 0, 0, 0);
        startDate.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));

        // Lấy ngày cuối tuần (Chủ Nhật) theo múi giờ Việt Nam
        endDate = new Date(startDate);
        endDate.setUTCDate(startDate.getUTCDate() + 6);
        endDate.setUTCHours(23, 59, 59, 999);

        // Tính thời gian tuần trước
        previousStartDate = new Date(startDate);
        previousStartDate.setUTCDate(startDate.getUTCDate() - 7);
        previousEndDate = new Date(endDate);
        previousEndDate.setUTCDate(endDate.getUTCDate() - 7);
      } else {
        // Lấy ngày đầu tháng theo múi giờ Việt Nam
        startDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
        startDate.setUTCHours(0, 0, 0, 0);

        // Lấy ngày cuối tháng theo múi giờ Việt Nam
        endDate = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0);
        endDate.setUTCHours(23, 59, 59, 999);

        // Tính thời gian tháng trước
        previousStartDate = new Date(
          now.getUTCFullYear(),
          now.getUTCMonth() - 1,
          1
        );
        previousStartDate.setUTCHours(0, 0, 0, 0);
        previousEndDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), 0);
        previousEndDate.setUTCHours(23, 59, 59, 999);
      }

      // Save date ranges in state
      setDateRange({
        startDate,
        endDate,
        previousStartDate,
        previousEndDate,
      });

      console.log("📅 Start date (UTC):", startDate.toISOString());
      console.log("📅 End date (UTC):", endDate.toISOString());
      console.log(
        "📅 Previous start date (UTC):",
        previousStartDate.toISOString()
      );
      console.log("📅 Previous end date (UTC):", previousEndDate.toISOString());

      // Lấy dữ liệu hiện tại
      const [homeData, transactionsData, walletsData] = await Promise.all([
        fetchHomeData(timeRange),
        fetchTransactions(timeRange, startDate, endDate),
        fetchWallets(),
      ]);

      // Lấy dữ liệu kỳ trước để so sánh
      const previousTransactions = await fetchTransactions(
        timeRange,
        previousStartDate,
        previousEndDate
      );

      console.log("🔄 Current transactions:", transactionsData.length);
      console.log("🔄 Previous transactions:", previousTransactions.length);

      // Calculate totals based on actual transactions
      const income = transactionsData.reduce(
        (sum: number, transaction: TransactionItem) => {
          return transaction.type === "income" ? sum + transaction.amount : sum;
        },
        0
      );

      const expense = transactionsData.reduce(
        (sum: number, transaction: TransactionItem) => {
          return transaction.type === "expense"
            ? sum + transaction.amount
            : sum;
        },
        0
      );

      // Tính chính xác tổng chi tiêu kỳ trước
      const previousExpense = previousTransactions.reduce(
        (sum: number, transaction: TransactionItem) => {
          return transaction.type === "expense"
            ? sum + transaction.amount
            : sum;
        },
        0
      );

      console.log("💰 Current expense total:", expense);
      console.log("💰 Previous expense total:", previousExpense);

      // Calculate top spending categories from actual transactions data
      const categorySpending = calculateCategorySpending(transactionsData);

      const topCategories: TopSpending[] = Object.entries(categorySpending)
        .map(
          ([category, amount]): TopSpending => ({
            category,
            amount: Number(amount),
          })
        )
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      // Log top spending categories for verification
      console.log("🔝 Top spending categories:", topCategories);

      // Ensure wallets are properly processed before setting state
      if (walletsData && Array.isArray(walletsData)) {
        const processedWallets = walletsData.map((wallet) => ({
          ...wallet,
          _id: wallet._id || `temp-${Date.now()}`,
          name: wallet.name || "Unnamed Wallet",
          balance: typeof wallet.balance === "number" ? wallet.balance : 0,
          color: wallet.color || "#4CAF50",
          icon: wallet.icon || "wallet-outline",
        }));
        setWallets(processedWallets);

        // Calculate total balance from wallets
        const calculatedTotalBalance = processedWallets.reduce(
          (sum, wallet) => {
            // Only include wallets marked to be included in total
            if (wallet.isIncludedInTotal !== false) {
              return sum + (wallet.balance || 0);
            }
            return sum;
          },
          0
        );

        console.log(`💰 Calculated total balance: ${calculatedTotalBalance}`);

        // Update userData with calculated total balance
      } else {
      }

      setTopSpending(topCategories);
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadReportData = useCallback(async () => {
    try {
      setReportLoading(true);
      // Get current date in UTC
      const now = new Date();
      const startOfMonth = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
      const endOfMonth = new Date(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        0
      );

      // Format dates to ISO string
      const startDate = startOfMonth.toISOString();
      const endDate = endOfMonth.toISOString();

      console.log("[HomeScreen] Fetching report data with params:", {
        periodFilter,
        startDate,
        endDate,
      });

      // Call API with proper parameters
      const response = await apiClient.get("/api/transactions/report", {
        params: {
          period: periodFilter,
          startDate,
          endDate,
          walletId: "all",
        },
      });

      console.log("[HomeScreen] API Response:", response.data);

      if (!response.data) {
        throw new Error("No data received from API");
      }

      // Process the data
      const data = response.data;

      // Ensure periods are sorted correctly
      if (data.periods && data.periods.length > 0) {
        data.periods.sort((a: Period, b: Period) => {
          if (periodFilter === "weekly") {
            return new Date(a.key).getTime() - new Date(b.key).getTime();
          } else if (periodFilter === "monthly") {
            const [yearA, monthA] = a.key.split("-").map(Number);
            const [yearB, monthB] = b.key.split("-").map(Number);
            return yearA === yearB ? monthA - monthB : yearA - yearB;
          } else {
            return Number(a.key) - Number(b.key);
          }
        });
      }

      // Calculate summary if not provided
      if (!data.summary) {
        data.summary = {
          totalIncome: data.periods.reduce(
            (sum: number, period: Period) => sum + period.income,
            0
          ),
          totalExpense: data.periods.reduce(
            (sum: number, period: Period) => sum + period.expense,
            0
          ),
          balance: 0,
        };
        data.summary.balance =
          data.summary.totalIncome - data.summary.totalExpense;
      }

      console.log("[HomeScreen] Processed report data:", data);
      setReportData(data);
    } catch (error: any) {
      console.error("[HomeScreen] Error loading report data:", error);
      if (error.response) {
        console.error("[HomeScreen] Error response:", error.response.data);
      }
    } finally {
      setReportLoading(false);
    }
  }, [periodFilter]);

  const renderChart = () => {
    if (reportLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (!reportData || !reportData.periods || reportData.periods.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={48} color="#CCCCCC" />
          <Text style={styles.emptyText}>Không có dữ liệu cho kỳ này</Text>
          <Text style={styles.emptyDescription}>
            Hãy thêm giao dịch để xem biểu đồ
          </Text>
        </View>
      );
    }
    // Xử lý labels và dữ liệu theo periodFilter
    let labels: string[] = [];
    let incomeData: number[] = [];
    let expenseData: number[] = [];

    if (periodFilter === "weekly") {
      labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
      let incomeArr = Array(7).fill(0);
      let expenseArr = Array(7).fill(0);

      reportData.periods.forEach((period) => {
        // KIỂM TRA ĐIỀU KIỆN Ở ĐÂY
        if (period && typeof period === "object") {
          let date = new Date(period.key);
          let day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
          let idx = day === 0 ? 6 : day - 1; // Chuyển Chủ Nhật về cuối tuần (index 6)

          if (idx >= 0 && idx < 7) {
            incomeArr[idx] = period.income;
            expenseArr[idx] = period.expense;
          }
        }
      });

      incomeData = incomeArr;
      expenseData = expenseArr;
    } else if (periodFilter === "monthly") {
      // Hiển thị các tháng trong năm bằng tiếng Việt
      labels = [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
        "T10",
        "T11",
        "T12",
      ];
      let incomeArr = Array(12).fill(0);
      let expenseArr = Array(12).fill(0);

      console.log("reportData.periods", reportData.periods);

      reportData.periods.forEach((period) => {
        console.log("period", period);
        const parts = period.key.split("-");
        const monthIdx = parseInt(parts[0], 10) - 1;

        console.log("monthIdx", monthIdx);

        if (monthIdx >= 0 && monthIdx < 12) {
          incomeArr[monthIdx] += period.income;
          expenseArr[monthIdx] += period.expense;
        }
      });
      incomeData = incomeArr;
      expenseData = expenseArr;
      console.log("expenseData,incomeData", expenseArr, incomeArr);
    } else if (periodFilter === "yearly") {
      // Hiển thị 5 năm gần nhất (bao gồm năm hiện tại)
      const currentYear = new Date().getFullYear();
      labels = [
        (currentYear - 4).toString(),
        (currentYear - 3).toString(),
        (currentYear - 2).toString(),
        (currentYear - 1).toString(),
        currentYear.toString(),
      ];
      const incomeArr = Array(5).fill(0);
      const expenseArr = Array(5).fill(0);
      reportData.periods.forEach((period) => {
        const yearIdx = labels.indexOf(period.key);
        if (yearIdx !== -1) {
          incomeArr[yearIdx] = period.income;
          expenseArr[yearIdx] = period.expense;
        }
      });
      incomeData = incomeArr;
      expenseData = expenseArr;
    }

    const handleDATA = (rawData: number[]) => {
      let aggregatedData =
        periodFilter === "weekly"
          ? Array(7).fill(0)
          : periodFilter === "monthly"
          ? Array(12).fill(0)
          : Array(5).fill(0);

      if (periodFilter === "weekly") {
        for (let i = 0; i < 7; i++) {
          aggregatedData[i] = rawData[i] + rawData[i + 7];
        }
      } else if (periodFilter === "monthly") {
        for (let i = 0; i < 12; i++) {
          aggregatedData[i] = rawData[i] + rawData[i + 12];
        }
      } else {
        for (let i = 0; i < 5; i++) {
          aggregatedData[i] = rawData[i] + rawData[i + 5];
        }
      }

      console.log("aggregatedData", aggregatedData);

      return aggregatedData;
    };

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartWrapper}>
          <BarChart
            data={{
              labels,
              datasets: [
                {
                  data: handleDATA(incomeData.concat(expenseData)),
                  color: () => "rgba(0, 200, 151, 1)",
                },
              ],
            }}
            width={
              periodFilter === "yearly" ? screenWidth - 80 : screenWidth - 100
            }
            height={180}
            yAxisLabel={""}
            yAxisSuffix={""}
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              barPercentage: 0.3,
              propsForLabels: {
                fontSize: 12,
                fontWeight: "600",
              },
              style: {
                borderRadius: 16,
              },
              formatYLabel: (y) => {
                const num = Number(y);
                if (num >= 1000000) {
                  return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
                } else if (num >= 1000) {
                  return (num / 1000).toFixed(0) + "K";
                }
                return num.toLocaleString("vi-VN");
              },
            }}
            fromZero
            showBarTops
            withVerticalLabels={true}
            style={{
              marginVertical: 8,
              borderRadius: 16,
              marginLeft: -10,
              paddingBottom: 16,
              alignSelf: "flex-start",
            }}
          />
        </View>
      </View>
    );
  };

  const renderSummary = () => {
    if (!reportData) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color="#CCCCCC" />
          <Text style={styles.emptyText}>Không có dữ liệu báo cáo</Text>
          <Text style={styles.emptyDescription}>
            Hãy thêm giao dịch để xem báo cáo tóm tắt
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng Thu Nhập</Text>
          <Text style={[styles.summaryAmount, styles.incomeAmount]}>
            {formatVND(reportData.summary.totalIncome)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng Chi Tiêu</Text>
          <Text style={[styles.summaryAmount, styles.expenseAmount]}>
            {formatVND(reportData.summary.totalExpense)}
          </Text>
        </View>
        <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.summaryLabel}>Số Dư</Text>
          <Text
            style={[
              styles.summaryAmount,
              reportData.summary.balance >= 0
                ? styles.incomeAmount
                : styles.expenseAmount,
            ]}
          >
            {formatVND(Math.abs(reportData.summary.balance))}
          </Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    loadReportData();
  }, [periodFilter, loadReportData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("🔄 HomeScreen focused - Reloading data...");
      loadHomeData();
    });

    return unsubscribe;
  }, [navigation, loadHomeData]);

  // Effect để xử lý isFocused
  useEffect(() => {
    if (isFocused) {
      loadHomeData();
    }
  }, [isFocused]);

  // Thêm effect để load lại dữ liệu khi timeRange thay đổi
  useEffect(() => {
    loadHomeData();
  }, [timeRange]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHomeData().finally(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      {/* Header với background xanh và title trắng */}
      <View style={styles.greenBackground}>
        <SafeAreaView style={styles.topSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Báo Cáo Theo Kỳ</Text>
            </View>
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </View>

      {/* Content container với background trắng */}
      <View style={styles.whiteContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Main Report Card */}
          <View style={styles.reportCard}>
            <View style={styles.reportContentContainer}>
              {/* Period Filter */}
              <View style={styles.filterContainer}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    periodFilter === "weekly" && styles.activeFilterButton,
                  ]}
                  onPress={() => setPeriodFilter("weekly")}
                >
                  <Text
                    style={[
                      styles.filterText,
                      periodFilter === "weekly" && styles.activeFilterText,
                    ]}
                  >
                    Tuần
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    periodFilter === "monthly" && styles.activeFilterButton,
                  ]}
                  onPress={() => setPeriodFilter("monthly")}
                >
                  <Text
                    style={[
                      styles.filterText,
                      periodFilter === "monthly" && styles.activeFilterText,
                    ]}
                  >
                    Tháng
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    periodFilter === "yearly" && styles.activeFilterButton,
                  ]}
                  onPress={() => setPeriodFilter("yearly")}
                >
                  <Text
                    style={[
                      styles.filterText,
                      periodFilter === "yearly" && styles.activeFilterText,
                    ]}
                  >
                    Năm
                  </Text>
                </TouchableOpacity>
              </View>

              {/* View Type Selector */}
              <View style={styles.viewTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.viewTypeButton,
                    viewType === "chart" && styles.activeViewTypeButton,
                  ]}
                  onPress={() => setViewType("chart")}
                >
                  <Ionicons
                    name="bar-chart-outline"
                    size={20}
                    color={viewType === "chart" ? "#FFFFFF" : "#666666"}
                  />
                  <Text
                    style={[
                      styles.viewTypeText,
                      viewType === "chart" && styles.activeViewTypeText,
                    ]}
                  >
                    Biểu Đồ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.viewTypeButton,
                    viewType === "summary" && styles.activeViewTypeButton,
                  ]}
                  onPress={() => setViewType("summary")}
                >
                  <Ionicons
                    name="list-outline"
                    size={20}
                    color={viewType === "summary" ? "#FFFFFF" : "#666666"}
                  />
                  <Text
                    style={[
                      styles.viewTypeText,
                      viewType === "summary" && styles.activeViewTypeText,
                    ]}
                  >
                    Tóm Tắt
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Chart or Summary Content */}
              <View style={styles.contentContainer}>
                {viewType === "chart" ? renderChart() : renderSummary()}
              </View>
            </View>
          </View>

          {/* Top Spending Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Chi Tiêu Cao Nhất</Text>
            </View>
            <View style={styles.topSpendingCard}>
              <View style={styles.timeRangeSelector}>
                <TouchableOpacity
                  style={[
                    styles.timeRangeButton,
                    topSpendingRange === "week" && styles.timeRangeButtonActive,
                  ]}
                  onPress={() => setTopSpendingRange("week")}
                >
                  <Text
                    style={[
                      styles.timeRangeText,
                      topSpendingRange === "week" && styles.timeRangeTextActive,
                    ]}
                  >
                    Tuần
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.timeRangeButton,
                    topSpendingRange === "month" &&
                      styles.timeRangeButtonActive,
                  ]}
                  onPress={() => setTopSpendingRange("month")}
                >
                  <Text
                    style={[
                      styles.timeRangeText,
                      topSpendingRange === "month" &&
                        styles.timeRangeTextActive,
                    ]}
                  >
                    Tháng
                  </Text>
                </TouchableOpacity>
              </View>

              {topSpending.length > 0 ? (
                topSpending.map((item, index) => (
                  <View key={index} style={styles.spendingItem}>
                    <View style={styles.spendingIcon}>
                      <Ionicons
                        name="wallet-outline"
                        size={24}
                        color="#FFFFFF"
                      />
                    </View>
                    <View style={styles.spendingDetails}>
                      <Text style={styles.spendingCategory}>
                        {item.category}
                      </Text>
                      <Text style={styles.spendingAmount}>
                        {formatVND(item.amount)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={48}
                    color="#CCCCCC"
                  />
                  <Text style={styles.emptyText}>
                    Không có dữ liệu chi tiêu
                  </Text>
                  <Text style={styles.emptyDescription}>
                    Hãy thêm giao dịch để xem báo cáo chi tiêu
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  greenBackground: {
    backgroundColor: colors.primary,
    height: 150,
  },
  topSafeArea: {
    flex: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerRight: {
    width: 40,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: -50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  reportContentContainer: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  activeFilterText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  viewTypeContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  viewTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  viewTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    marginLeft: 8,
  },
  activeViewTypeButton: {
    backgroundColor: colors.primary,
  },
  activeViewTypeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    minHeight: 300,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  topSpendingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  timeRangeSelector: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  timeRangeTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  spendingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  spendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  spendingDetails: {
    flex: 1,
  },
  spendingCategory: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 4,
  },
  spendingAmount: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
    marginTop: 15,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    lineHeight: 20,
  },
  chartContainer: {
    marginVertical: 15,
    paddingVertical: 5,
  },
  chartWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  summaryContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  incomeAmount: {
    color: "#00C897",
  },
  expenseAmount: {
    color: "#FF6B6B",
  },
  noDataText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  spendingReportContainer: {
    marginTop: 15,
  },
  spendingHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginHorizontal: 15,
  },
  spendingReportAmountText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  spendingTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  spendingTitleText: {
    fontSize: 12,
    color: "#888888",
  },
  changePercentageWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  percentageChangeText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 3,
  },
  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  barChartColumn: {
    flex: 1,
  },
  barChartBarContainer: {
    height: 120,
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    marginBottom: 5,
    justifyContent: "flex-end",
  },
  barChartBar: {
    backgroundColor: "#FF6B6B",
    borderRadius: 5,
    width: "70%",
    alignSelf: "center",
  },
  barChartPrevBar: {
    backgroundColor: "#FFCDD2",
    borderRadius: 5,
    width: "70%",
    alignSelf: "center",
  },
  barChartCurrBar: {
    backgroundColor: "#FF6B6B",
    borderRadius: 5,
    width: "70%",
    alignSelf: "center",
  },
  barChartBarInactive: {
    backgroundColor: "#cccccc",
  },
  barChartLabel: {
    marginTop: 10,
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
  },
  barChartValue: {
    color: "#555555",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
    fontWeight: "500",
  },
  helpIcon: {
    padding: 5,
  },
  chartContainerWithMax: {
    marginVertical: 15,
    paddingVertical: 5,
  },
  maxValueContainer: {
    position: "absolute",
    top: 2,
    right: -10,
    alignItems: "flex-end",
    paddingRight: 5,
    backgroundColor: "white",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  maxValueLabelText: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  chartContentContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chartDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingHorizontal: 10,
  },
  chartDateLabel: {
    fontSize: 8,
    color: "#888888",
  },
  barChartMainContainer: {
    height: 250,
    marginTop: 30,
    marginHorizontal: 15,
    position: "relative",
  },
  barChartMaxValue: {
    position: "absolute",
    top: 0,
    right: -15,
    fontSize: 11,
    color: "#555555",
    backgroundColor: "white",
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  barChartZeroValue: {
    position: "absolute",
    bottom: 45,
    right: -15,
    fontSize: 11,
    color: "#555555",
    backgroundColor: "white",
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  barChartContent: {
    height: 200,
    paddingBottom: 30,
    position: "relative",
  },
  barChartHorizontalLine: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  barChartColumns: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: "100%",
  },
  barChartColumnWrapper: {
    width: "35%",
    height: 160,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barChartPrevious: {
    backgroundColor: "#FFCDD2",
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  barChartCurrent: {
    backgroundColor: "#FF6B6B",
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  emptyTransactionsContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
  },
});
