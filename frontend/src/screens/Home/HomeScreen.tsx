import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useIsFocused,
  CompositeNavigationProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  RootStackParamList,
  HomeStackParamList,
  TabParamList,
} from "../../navigation/types";
import { fetchHomeData, fetchTransactions } from "../../services/homeService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatVND } from "../../utils/formatters";
import { colors } from "../../theme";
import { fetchWallets } from "../../services/walletService";
import { Transaction } from "../../services/transactionService";
import apiClient from "../../services/apiClient";
import { LineChart } from "react-native-chart-kit";
import { fetchMonthlyReport } from "../../services/transactionService";
import { BarChart } from "react-native-chart-kit";

interface TopSpending {
  category: string;
  amount: number;
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

type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, "Home">,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

interface TransactionListProps {
  timeFilter: "week" | "month";
  onTimeFilterChange: (filter: "week" | "month") => void;
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

interface DataPoint {
  x: number;
  y: number;
}

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

type PeriodFilter = "weekly" | "monthly" | "yearly";

const TransactionList: React.FC<TransactionListProps> = ({
  timeFilter,
  onTimeFilterChange,
}) => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleTransactionPress = (transaction: TransactionItem) => {
    // TODO: Implement edit transaction
    console.log("Edit transaction:", transaction._id);
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);

      // Tính toán ngày bắt đầu và kết thúc dựa trên timeFilter
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (timeFilter === "week") {
        // Lấy ngày đầu tuần (Thứ 2)
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(
          now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
        );

        // Lấy ngày cuối tuần (Chủ Nhật)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Lấy ngày đầu tháng
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);

        // Lấy ngày cuối tháng
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      }

      console.log(
        `Fetching transactions for ${timeFilter}: ${startDate.toISOString()} to ${endDate.toISOString()}`
      );

      const response = await apiClient.get("/api/transactions/date-range", {
        params: {
          timeFilter,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      // Xử lý dữ liệu trả về từ API
      let transactionsData = [];
      if (response.data && response.data.transactions) {
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
          transactionsData = flattenedTransactions;
        } else if (Array.isArray(response.data.transactions)) {
          transactionsData = response.data.transactions;
        }
      } else if (Array.isArray(response.data)) {
        transactionsData = response.data;
      }

      setTransactions(transactionsData);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [timeFilter]);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Lỗi: {error}</Text>;
  }

  return (
    <View>
      <View style={styles.timeFilterContainer}>
        <TouchableOpacity
          style={[
            styles.timeFilterButton,
            timeFilter === "week" && styles.timeFilterButtonActive,
          ]}
          onPress={() => onTimeFilterChange("week")}
        >
          <Text
            style={[
              styles.timeFilterText,
              timeFilter === "week" && styles.timeFilterTextActive,
            ]}
          >
            Tuần
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timeFilterButton,
            timeFilter === "month" && styles.timeFilterButtonActive,
          ]}
          onPress={() => onTimeFilterChange("month")}
        >
          <Text
            style={[
              styles.timeFilterText,
              timeFilter === "month" && styles.timeFilterTextActive,
            ]}
          >
            Tháng
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsList}>
        {transactions.length > 0 ? (
          transactions.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.transactionItem}
              onPress={() => handleTransactionPress(item)}
            >
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={item.type === "income" ? "arrow-down" : "arrow-up"}
                  size={24}
                  color={item.type === "income" ? "#00C897" : "#FF6B6B"}
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{item.title}</Text>
                <Text style={styles.transactionCategory}>
                  {item.category.name}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  item.type === "income"
                    ? styles.incomeText
                    : styles.expenseText,
                ]}
              >
                {item.type === "income" ? "+" : "-"}
                {formatVND(item.amount)}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyTransactionsContainer}>
            <Ionicons name="document-text-outline" size={40} color="#CCCCCC" />
            <Text style={styles.emptyText}>Không tìm thấy giao dịch</Text>
            <Text style={styles.emptyDescription}>
              Không có giao dịch nào trong{" "}
              {timeFilter === "week" ? "tuần" : "tháng"} này
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const screenWidth = Dimensions.get("window").width;

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const [hideBalance, setHideBalance] = useState(false);
  const [timeRange, setTimeRange] = useState<"week" | "month">("month");
  const [topSpendingRange, setTopSpendingRange] = useState<"week" | "month">(
    "month"
  );
  const [timeFilter, setTimeFilter] = useState<"week" | "month">("week");
  const [currentReport, setCurrentReport] = useState<"trending" | "spending">(
    "trending"
  );
  const [selectedChartType, setSelectedChartType] = useState<
    "income" | "expense"
  >("expense");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    previousStartDate: new Date(),
    previousEndDate: new Date(),
  });

  const [userData, setUserData] = useState({
    userName: "",
    userAvatar: "",
    totalBalance: 0,
    totalExpense: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    lastMonthExpense: 0,
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [topSpending, setTopSpending] = useState<TopSpending[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  // Thêm Animated Value cho hiệu ứng chuyển đổi báo cáo
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(350)).current; // Chiều cao cố định ban đầu cho khối báo cáo

  // State cho báo cáo
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("monthly");
  const [viewType, setViewType] = useState<"chart" | "summary">("chart");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

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
        setUserData((prevData) => ({
          ...prevData,
          ...homeData,
          totalBalance: calculatedTotalBalance,
          monthlyIncome: income,
          monthlyExpense: expense,
          lastMonthExpense: previousExpense > 0 ? previousExpense : 1,
        }));
      } else {
        setWallets([]);

        // Still update userData even if there are no wallets
        setUserData((prevData) => ({
          ...prevData,
          ...homeData,
          monthlyIncome: income,
          monthlyExpense: expense,
          lastMonthExpense: previousExpense > 0 ? previousExpense : 1,
        }));
      }

      // Update transactions and top spending categories
      setTransactions(transactionsData.slice(0, 5));
      setTopSpending(topCategories);
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Effect để lắng nghe sự kiện focus
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

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.navigate("Login");
  };

  const handleAddTransaction = (type: "income" | "expense") => {
    navigation.navigate("AddTransaction", { preSelectedWalletId: undefined });
  };

  const handleSeeAllTransactions = () => {
    navigation.navigate("TransactionTab", { screen: "Transaction" });
  };

  const handleSeeReports = () => {
    navigation.navigate("IncomeExpenseReportScreen");
  };

  const handleTimeFilterChange = (newFilter: "week" | "month") => {
    setTimeFilter(newFilter);

    // Cần load lại dữ liệu theo filter mới
    const now = new Date();
    let newStartDate: Date;
    let newEndDate: Date;
    let newPreviousStartDate: Date;
    let newPreviousEndDate: Date;

    if (newFilter === "week") {
      // Lấy ngày đầu tuần (Thứ 2)
      newStartDate = new Date(now);
      newStartDate.setHours(0, 0, 0, 0);
      newStartDate.setDate(
        now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
      );

      // Lấy ngày cuối tuần (Chủ Nhật)
      newEndDate = new Date(newStartDate);
      newEndDate.setDate(newStartDate.getDate() + 6);
      newEndDate.setHours(23, 59, 59, 999);

      // Tính thời gian tuần trước
      newPreviousStartDate = new Date(newStartDate);
      newPreviousStartDate.setDate(newStartDate.getDate() - 7);
      newPreviousEndDate = new Date(newEndDate);
      newPreviousEndDate.setDate(newEndDate.getDate() - 7);
    } else {
      // Lấy ngày đầu tháng
      newStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      newStartDate.setHours(0, 0, 0, 0);

      // Lấy ngày cuối tháng
      newEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      newEndDate.setHours(23, 59, 59, 999);

      // Tính thời gian tháng trước
      newPreviousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      newPreviousStartDate.setHours(0, 0, 0, 0);
      newPreviousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
      newPreviousEndDate.setHours(23, 59, 59, 999);
    }

    // Cập nhật ngày trong state
    setDateRange({
      startDate: newStartDate,
      endDate: newEndDate,
      previousStartDate: newPreviousStartDate,
      previousEndDate: newPreviousEndDate,
    });

    // Sau đó tải dữ liệu cho khoảng thời gian mới
    updateSpendingData(
      newFilter,
      newStartDate,
      newEndDate,
      newPreviousStartDate,
      newPreviousEndDate
    );
  };

  // Hàm mới để cập nhật dữ liệu chi tiêu dựa trên filter
  const updateSpendingData = async (
    filter: "week" | "month",
    startDate: Date,
    endDate: Date,
    previousStartDate: Date,
    previousEndDate: Date
  ) => {
    try {
      console.log(`📊 Updating spending data for ${filter}`);
      console.log(
        `📅 Period: ${startDate.toISOString()} to ${endDate.toISOString()}`
      );
      console.log(
        `📅 Previous: ${previousStartDate.toISOString()} to ${previousEndDate.toISOString()}`
      );

      // Lấy dữ liệu cho khoảng thời gian hiện tại
      const currentTransactions = await fetchTransactions(
        filter,
        startDate,
        endDate
      );

      // Lấy dữ liệu cho khoảng thời gian trước đó để so sánh
      const previousTransactions = await fetchTransactions(
        filter,
        previousStartDate,
        previousEndDate
      );

      // Tính toán chi tiêu và thu nhập cho khoảng thời gian hiện tại
      const currentExpense = currentTransactions.reduce(
        (sum: number, transaction: TransactionItem) =>
          transaction.type === "expense" ? sum + transaction.amount : sum,
        0
      );

      // Tính toán thu nhập cho khoảng thời gian hiện tại
      const currentIncome = currentTransactions.reduce(
        (sum: number, transaction: TransactionItem) =>
          transaction.type === "income" ? sum + transaction.amount : sum,
        0
      );

      // Tính toán chi tiêu cho khoảng thời gian trước đó
      const previousExpense = previousTransactions.reduce(
        (sum: number, transaction: TransactionItem) =>
          transaction.type === "expense" ? sum + transaction.amount : sum,
        0
      );

      console.log(`💰 Current ${filter} expense: ${currentExpense}`);
      console.log(`💰 Current ${filter} income: ${currentIncome}`);
      console.log(`💰 Previous ${filter} expense: ${previousExpense}`);

      // Cập nhật userData với dữ liệu mới
      setUserData((prevData) => ({
        ...prevData,
        monthlyIncome: currentIncome,
        monthlyExpense: currentExpense,
        lastMonthExpense: previousExpense > 0 ? previousExpense : 1, // Tránh chia cho 0
      }));
    } catch (error) {
      console.error("Error updating spending data:", error);
    }
  };

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

  // Hàm để chuyển đổi giữa các báo cáo với hiệu ứng
  const handleNavigateReport = (direction: "next" | "prev") => {
    // Bắt đầu hiệu ứng fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false, // Để có thể animate layout properties
    }).start(() => {
      // Sau khi mờ đi, cập nhật loại báo cáo
      if (direction === "next") {
        setCurrentReport("spending");
      } else {
        setCurrentReport("trending");
      }

      // Reset vị trí slide cho hiệu ứng tiếp theo
      slideAnim.setValue(direction === "next" ? -20 : 20);

      // Chạy hiệu ứng fade in và slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    });
  };

  // Updated percentage change calculation with max cap
  const calculateChangePercentage = () => {
    // Handle case where there is no previous data
    if (!userData.lastMonthExpense || userData.lastMonthExpense <= 0) {
      // If no expenses in previous period, but there are in current => 100% increase
      return userData.monthlyExpense > 0 ? 100 : 0;
    }

    // Calculate percentage change and return integer value
    const change = Math.round(
      ((userData.monthlyExpense - userData.lastMonthExpense) /
        userData.lastMonthExpense) *
        100
    );

    // Cap the maximum percentage at 100%
    return Math.min(Math.abs(change), 100) * (change < 0 ? -1 : 1);
  };

  // Phần trăm thay đổi
  const changePercentage = calculateChangePercentage();
  // Xác định nếu chi tiêu tăng hay giảm
  const isDecreased = changePercentage < 0;

  // Thêm hàm để tạo dữ liệu cho biểu đồ - sửa lại phần xử lý dữ liệu
  const generateChartData = (
    transactions: TransactionItem[],
    dateRange: any,
    selectedChartType: "income" | "expense"
  ) => {
    // Lấy ngày đầu tháng và ngày hiện tại
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Đảm bảo có giao dịch để xử lý
    if (!transactions || transactions.length === 0) {
      // Trả về dữ liệu mẫu nếu không có giao dịch
      return {
        labels: ["", "", "", ""],
        datasets: [
          {
            data: [0, 0, 0, 0],
            color: (opacity = 1) =>
              selectedChartType === "income"
                ? `rgba(0, 200, 151, ${opacity})`
                : `rgba(255, 107, 107, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    }

    // Lọc giao dịch theo loại và trong tháng hiện tại
    const filteredTransactions = transactions.filter((t) => {
      const transDate = new Date(t.date);
      return (
        t.type === selectedChartType &&
        transDate >= startOfMonth &&
        transDate <= today
      );
    });

    // Sắp xếp theo thứ tự thời gian
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Tạo các điểm dữ liệu cho biểu đồ
    let dataPoints: DataPoint[] = [];
    let cumulativeAmount = 0;

    // Luôn bắt đầu từ 0 vào đầu tháng
    dataPoints.push({
      x: startOfMonth.getTime(),
      y: 0,
    });

    // Thêm mỗi giao dịch vào dữ liệu tích lũy
    for (const transaction of sortedTransactions) {
      cumulativeAmount += transaction.amount;
      dataPoints.push({
        x: new Date(transaction.date).getTime(),
        y: cumulativeAmount,
      });
    }

    // Đảm bảo biểu đồ có đủ điểm để vẽ đẹp
    if (dataPoints.length < 2) {
      if (dataPoints.length === 0) {
        // Nếu không có điểm nào, tạo điểm bắt đầu và kết thúc
        dataPoints = [
          { x: startOfMonth.getTime(), y: 0 },
          { x: today.getTime(), y: 0 },
        ];
      } else {
        // Nếu chỉ có một điểm, thêm điểm kết thúc
        dataPoints.push({
          x: today.getTime(),
          y: dataPoints[dataPoints.length - 1].y,
        });
      }
    }

    // Thêm điểm cuối cùng nếu điểm cuối chưa phải là hôm nay
    const lastPoint = dataPoints[dataPoints.length - 1];
    if (lastPoint.x < today.getTime()) {
      dataPoints.push({
        x: today.getTime(),
        y: lastPoint.y,
      });
    }

    // Đảm bảo có đủ điểm để vẽ đường đẹp (tối thiểu 4 điểm)
    while (dataPoints.length < 4) {
      // Tạo thêm các điểm trung gian
      const totalDuration = today.getTime() - startOfMonth.getTime();
      const step = totalDuration / (4 - 1);

      const newDataPoints: DataPoint[] = [dataPoints[0]]; // Giữ lại điểm đầu tiên

      for (let i = 1; i < 4 - 1; i++) {
        const timestamp = startOfMonth.getTime() + i * step;

        // Tìm giá trị y phù hợp cho timestamp này
        let yValue = 0;
        for (let j = 0; j < dataPoints.length - 1; j++) {
          if (
            timestamp >= dataPoints[j].x &&
            timestamp <= dataPoints[j + 1].x
          ) {
            // Nội suy tuyến tính để có đường mượt
            const ratio =
              (timestamp - dataPoints[j].x) /
              (dataPoints[j + 1].x - dataPoints[j].x);
            yValue =
              dataPoints[j].y + ratio * (dataPoints[j + 1].y - dataPoints[j].y);
            break;
          }
        }

        newDataPoints.push({ x: timestamp, y: yValue });
      }

      newDataPoints.push(dataPoints[dataPoints.length - 1]); // Giữ lại điểm cuối cùng
      dataPoints = newDataPoints;
    }

    // Tối ưu hóa số lượng điểm (chọn tối đa 6 điểm)
    if (dataPoints.length > 6) {
      const step = Math.ceil(dataPoints.length / 6);
      const optimizedPoints = [];

      for (let i = 0; i < dataPoints.length; i += step) {
        if (optimizedPoints.length < 5) {
          optimizedPoints.push(dataPoints[i]);
        }
      }

      // Luôn giữ lại điểm cuối cùng
      if (
        optimizedPoints[optimizedPoints.length - 1] !==
        dataPoints[dataPoints.length - 1]
      ) {
        optimizedPoints.push(dataPoints[dataPoints.length - 1]);
      }

      dataPoints = optimizedPoints;
    }

    // Chuyển đổi thành định dạng cho LineChart
    const values = dataPoints.map((point: DataPoint) => point.y);

    // Tạo mảng labels trống (không hiển thị ngày)
    const labels = dataPoints.map(() => "");

    return {
      labels: labels,
      datasets: [
        {
          data: values,
          color: (opacity = 1) =>
            selectedChartType === "income"
              ? `rgba(0, 200, 151, ${opacity})`
              : `rgba(255, 107, 107, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  // Add a compact formatter for chart axis values
  const formatCompact = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // Add a simple formatter for currency display with only one đ symbol
  const formatSimpleCurrency = (value: number): string => {
    // Format number with thousands separators
    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0,
    }).format(value);
  };

  // 1. Thêm hàm fetchTopSpending
  const fetchTopSpending = async (range: "week" | "month") => {
    try {
      // Lấy ngày bắt đầu và kết thúc cho tuần/tháng hiện tại
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
      if (range === "week") {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(
          now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
        );
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      }
      // Gọi API lấy transactions cho khoảng thời gian này
      const transactionsData = await fetchTransactions(
        range,
        startDate,
        endDate
      );
      // Tính toán top spending
      const categorySpending = calculateCategorySpending(transactionsData);
      const topCategories = Object.entries(categorySpending)
        .map(([category, amount]) => ({ category, amount: Number(amount) }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);
      setTopSpending(topCategories);
    } catch (error) {
      setTopSpending([]);
      console.error("Error fetching top spending:", error);
    }
  };

  // 3. useEffect: khi HomeScreen mount, gọi fetchTopSpending(timeRange) để load mặc định
  useEffect(() => {
    fetchTopSpending(topSpendingRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topSpendingRange]);

  // Hàm load báo cáo
  const loadReportData = useCallback(async () => {
    try {
      setReportLoading(true);
      setReportError(null);

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
      setReportError(error.message || "Failed to load report data");
    } finally {
      setReportLoading(false);
    }
  }, [periodFilter]);

  useEffect(() => {
    loadReportData();
  }, [periodFilter, loadReportData]);

  // Hàm renderChart và renderSummary lấy từ IncomeExpenseReportScreen
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
        <View style={styles.emptyTransactionsContainer}>
          <Ionicons name="analytics-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            Không có dữ liệu cho khoảng thời gian này
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
      reportData.periods.forEach((period) => {
        const parts = period.key.split("-");
        const monthIdx = parseInt(parts[0], 10) - 1;

        if (monthIdx >= 0 && monthIdx < 12) {
          incomeArr[monthIdx] += period.income;
          expenseArr[monthIdx] += period.expense;
        }
      });
      incomeData = incomeArr;
      expenseData = expenseArr;
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
              periodFilter === "yearly" ? screenWidth - 40 : screenWidth - 60
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
              marginLeft: -20, // Lệch qua trái
              paddingBottom: 16,
              alignSelf: "flex-start", // Căn lề trái thay vì center
            }}
          />
        </View>
      </View>
    );
  };

  const renderSummary = () => {
    if (reportLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (!reportData || !reportData.periods || reportData.periods.length === 0) {
      return (
        <View style={styles.emptyTransactionsContainer}>
          <Ionicons name="analytics-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            Không có dữ liệu cho khoảng thời gian này
          </Text>
        </View>
      );
    }
    return (
      <View style={{ width: "100%" }}>
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Text style={styles.summaryLabel}>Tổng Thu Nhập</Text>
          <Text style={[styles.summaryAmount, styles.incomeAmount]}>
            {formatVND(reportData.summary.totalIncome)}
          </Text>
        </View>
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Text style={styles.summaryLabel}>Tổng Chi Tiêu</Text>
          <Text style={[styles.summaryAmount, styles.expenseAmount]}>
            {formatVND(reportData.summary.totalExpense)}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Xin chào, {userData.userName}</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>
              {hideBalance ? "••••••••" : formatVND(userData.totalBalance)}
            </Text>
            <TouchableOpacity
              onPress={() => setHideBalance(!hideBalance)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={hideBalance ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#000000"
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Xóa icon chuông notification */}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Wallets Overview */}
        <View style={[styles.section, styles.firstSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ví Của Tôi</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("WalletScreen" as never)}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.walletsCard}>
            {wallets.length > 0 ? (
              wallets.map((wallet) => (
                <View key={wallet._id} style={styles.walletItem}>
                  <View style={styles.walletIconContainer}>
                    <View
                      style={[
                        styles.walletIcon,
                        { backgroundColor: wallet.color || "#FF9500" },
                      ]}
                    >
                      <Ionicons
                        name={(wallet.icon as any) || "wallet-outline"}
                        size={20}
                        color="#FFF"
                      />
                    </View>
                    <Text style={styles.walletName}>
                      {wallet.name || "Tiền mặt"}
                    </Text>
                  </View>
                  <Text style={styles.walletBalance}>
                    {formatVND(wallet.balance)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyWalletContainer}>
                <Ionicons name="wallet-outline" size={40} color="#CCCCCC" />
                <Text style={styles.emptyText}>Không tìm thấy ví</Text>
                <Text style={styles.emptyDescription}>
                  Thêm ví để bắt đầu theo dõi tài chính của bạn
                </Text>
                <TouchableOpacity
                  style={styles.addWalletButton}
                  onPress={() => {
                    const parent = navigation.getParent();
                    if (parent) {
                      (parent.navigate as any)("CreateWalletScreen");
                    }
                  }}
                >
                  <Text style={styles.addWalletButtonText}>Thêm Ví</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Monthly Report */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Báo cáo tháng này</Text>
          </View>
          <View style={styles.reportCard}>
            {/* TẤT CẢ NỘI DUNG BÊN TRONG CARD */}
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
                    color={viewType === "chart" ? "#fff" : "#000"}
                  />
                  <Text
                    style={[
                      styles.viewTypeText,
                      viewType === "chart" && styles.activeViewTypeText,
                    ]}
                  >
                    Biểu đồ
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
                    color={viewType === "summary" ? "#fff" : "#000"}
                  />
                  <Text
                    style={[
                      styles.viewTypeText,
                      viewType === "summary" && styles.activeViewTypeText,
                    ]}
                  >
                    Tóm tắt
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Chart or Summary */}
              <View style={{ flex: 1 }}>
                {viewType === "chart" ? renderChart() : renderSummary()}
              </View>
            </View>
          </View>
        </View>

        {/* Top Spending */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chi Tiêu Hàng Đầu</Text>
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
                  topSpendingRange === "month" && styles.timeRangeButtonActive,
                ]}
                onPress={() => setTopSpendingRange("month")}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    topSpendingRange === "month" && styles.timeRangeTextActive,
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
                    <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.spendingDetails}>
                    <Text style={styles.spendingCategory}>{item.category}</Text>
                    <Text style={styles.spendingAmount}>
                      {formatVND(item.amount)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Không có dữ liệu chi tiêu</Text>
            )}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Giao Dịch Gần Đây</Text>
            <TouchableOpacity onPress={handleSeeAllTransactions}>
              <Text style={styles.seeAllText}>Xem Tất Cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsCard}>
            <TransactionList
              timeFilter={timeFilter}
              onTimeFilterChange={handleTimeFilterChange}
            />
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddTransaction("expense")}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  balanceText: {
    fontSize: 18,
    color: "#000000",
    opacity: 1,
    fontWeight: "700",
    marginRight: 8,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  contentContainer: {
    paddingTop: 15,
  },
  section: {
    marginBottom: 20,
  },
  firstSection: {
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 14,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  reportContentContainer: {
    width: "100%",
    padding: 12,
    height: 320,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 4,
    marginBottom: 12,
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  viewTypeContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
    alignSelf: "center",
  },
  chartContainer: {
    minHeight: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  chartWrapper: {
    width: "100%",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666666",
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  expenseAmount: {
    color: "#FF6B6B",
  },
  incomeAmount: {
    color: "#00C897",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 2,
    minWidth: 90,
  },
  filterText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  activeFilterText: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  viewTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal: 4,
    minWidth: 130,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  viewTypeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  activeViewTypeButton: {
    backgroundColor: colors.primary,
  },
  activeViewTypeText: {
    color: "#FFFFFF",
  },
  timeFilterContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 4,
    marginBottom: 15,
    alignSelf: "center",
  },
  timeFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 2,
    minWidth: 90,
  },
  timeFilterButtonActive: {
    backgroundColor: colors.primary,
  },
  timeFilterText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  timeFilterTextActive: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  topSpendingCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  timeRangeSelector: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 4,
    marginBottom: 15,
    alignSelf: "center",
  },
  timeRangeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal: 4,
    minWidth: 130,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeRangeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  timeRangeTextActive: {
    color: "#FFFFFF",
  },
  noDataText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  transactionsList: {
    maxHeight: 400,
  },
  walletsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  walletItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  walletIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF9500",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  walletName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  emptyWalletContainer: {
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
    marginTop: 10,
    marginBottom: 5,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#888888",
    marginBottom: 15,
    textAlign: "center",
  },
  addWalletButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  addWalletButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
  transactionsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  transactionCategory: {
    fontSize: 14,
    color: "#666666",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  incomeText: {
    color: "#00C897",
  },
  expenseText: {
    color: "#FF6B6B",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIcon: {
    padding: 5,
  },
  spendingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
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
    fontWeight: "bold",
    color: "#333333",
  },
  spendingAmount: {
    fontSize: 14,
    color: "#FF6B6B",
  },
  spendingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
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
});

export default HomeScreen;
