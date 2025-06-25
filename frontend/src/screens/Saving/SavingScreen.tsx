import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import {
  formatVND,
  formatNumberWithCommas,
  parseFormattedNumber,
} from "../../utils/formatters";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as savingService from "../../services/savingService";
import * as categoryService from "../../services/categoryService";
import * as transactionService from "../../services/transactionService";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ProgressBar from "../../components/ProgressBar";
import { Category } from "../../types/category";
import { Transaction } from "../../types";

// Mảng các màu dự phòng đa dạng để đảm bảo đủ màu sắc cho các danh mục
const COLORS = [
  "#FF5733", // đỏ cam
  "#C70039", // đỏ đậm
  "#900C3F", // tím đậm
  "#581845", // tím mận
  "#2E86C1", // xanh dương
  "#138D75", // xanh ngọc
  "#D68910", // cam
  "#9B59B6", // tím
  "#E74C3C", // đỏ
  "#2ECC71", // xanh lá cây
  "#F1C40F", // vàng
  "#1ABC9C", // ngọc
  "#3498DB", // xanh da trời
  "#F39C12", // cam đất
  "#8E44AD", // tím than
  "#27AE60", // xanh lục
  "#D35400", // cam đỏ
  "#00D09E", // xanh lá
  "#4DC0F5", // xanh biển
  "#FFC84E", // vàng
  "#16A085", // xanh lục ngọc
  "#2980B9", // xanh dương đậm
  "#8E44AD", // tím
  "#2C3E50", // xanh đen
  "#F39C12", // cam
  "#E67E22", // cam đất
  "#E74C3C", // đỏ
  "#ECF0F1", // trắng xám
  "#95A5A6", // xám
  "#7F8C8D", // xám đậm
];

// Hàm để lấy màu ngẫu nhiên từ mảng và xóa màu đó khỏi mảng (để không trùng lặp)
const getRandomColor = (availableColors: string[]) => {
  if (availableColors.length === 0) return "#CCCCCC"; // Trả về màu mặc định nếu hết màu
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  const color = availableColors[randomIndex];
  availableColors.splice(randomIndex, 1); // Xóa màu đã sử dụng
  return color;
};

const screenWidth = Dimensions.get("window").width;

interface CategoryData {
  id: string;
  name: string;
  totalAmount: number;
  color: string;
}

interface SavingsData {
  totalSavings: number;
  categories: CategoryData[];
  monthlyData: {
    labels: string[];
    data: number[];
  };
  targetSavingAmount?: number;
  progress?: number;
}

interface CategoryBalance {
  _id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  totalBalance: number;
}

const SavingScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [savingAmount, setSavingAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savingsData, setSavingsData] = useState<SavingsData>({
    totalSavings: 0,
    categories: [],
    monthlyData: {
      labels: [],
      data: [],
    },
    targetSavingAmount: 0,
    progress: 0,
  });
  const [categoryBalances, setCategoryBalances] = useState<CategoryBalance[]>(
    []
  );
  const [currentMonth, setCurrentMonth] = useState("");
  const [currentMonthNumber, setCurrentMonthNumber] = useState(0);
  const [currentYear, setCurrentYear] = useState(0);
  const [formattedSavingAmount, setFormattedSavingAmount] = useState("");
  const [simpleSavingsInfo, setSimpleSavingsInfo] = useState<any>(null);

  useEffect(() => {
    loadSavingsData();
    loadCategoryBalances();
    // Get current month
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const currentDate = new Date();
    setCurrentMonth(monthNames[currentDate.getMonth()]);
    setCurrentMonthNumber(currentDate.getMonth() + 1); // getMonth() returns 0-11
    setCurrentYear(currentDate.getFullYear());
  }, [selectedPeriod]);

  // Add useFocusEffect to reload data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadSavingsData();
      loadCategoryBalances();
    }, [selectedPeriod])
  );

  const getDateRange = (period: string) => {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();

    // Always set start date to the first day of current month
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Always set end date to current date
    endDate.setHours(23, 59, 59, 999);

    return {
      startDate: startDate,
      endDate: endDate,
    };
  };

  const loadSavingsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get date range based on selected period
      const { startDate, endDate } = getDateRange(selectedPeriod);
      console.log(`Loading savings data for period: ${selectedPeriod}`);
      console.log(
        `Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`
      );

      // Get transactions for the selected period
      const transactions = await transactionService.getTransactionsByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      );
      console.log(`Found ${transactions.length} transactions for period`);

      // Calculate total income and expense
      let totalIncome = 0;
      let totalExpense = 0;
      transactions.forEach((transaction) => {
        if (transaction.type === "income") {
          totalIncome += transaction.amount;
        } else {
          totalExpense += transaction.amount;
        }
      });

      console.log(
        `Total income: ${totalIncome}, Total expense: ${totalExpense}`
      );

      // Get monthly data and target amount from API
      const monthlyData = await savingService.getSimpleSavingsInfo();
      console.log("Monthly data from API:", monthlyData);

      // Get current date
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Filter last 6 months including current month
      const last6MonthsData = {
        labels: [] as string[],
        data: [] as number[],
      };

      for (let i = 5; i >= 0; i--) {
        const targetMonth = (currentMonth - i + 12) % 12;
        const targetYear = currentYear - Math.floor((currentMonth - i) / 12);

        const monthName = new Date(targetYear, targetMonth, 1).toLocaleString(
          "default",
          { month: "short" }
        );
        last6MonthsData.labels.push(monthName);

        // Find data for this month
        const monthData = monthlyData.monthlyData?.data[targetMonth] || 0;
        last6MonthsData.data.push(monthData);
      }

      console.log("Last 6 months data:", last6MonthsData);

      // Calculate total savings as totalIncome - totalExpense
      const totalSavings = totalIncome - totalExpense;

      // Update savings data with target amount from API
      setSavingsData((prev) => ({
        ...prev,
        totalSavings: totalSavings,
        monthlyData: last6MonthsData,
        targetSavingAmount: monthlyData.targetSavingAmount || 0,
        progress: monthlyData.progress || 0,
      }));

      // Also update simple savings info
      setSimpleSavingsInfo(monthlyData);
    } catch (error) {
      console.error("Error loading savings data:", error);
      setError("Failed to load savings data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoryBalances = async () => {
    try {
      setIsLoading(true);

      // Get all categories
      const categories = await categoryService.getAllCategories();

      // Get all transactions
      const transactions = await transactionService.getAllTransactions();

      // Get date range based on selected period
      const { startDate, endDate } = getDateRange(selectedPeriod);

      console.log(`Loading data for period: ${selectedPeriod}`);
      console.log(
        `Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`
      );

      // Filter transactions by date range
      const filteredTransactions = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return txDate >= startDate && txDate <= endDate;
      });

      console.log(
        `Filtered transactions count: ${filteredTransactions.length}`
      );

      // Create a copy of colors array
      const availableColors = [...COLORS];

      // Calculate balance for each category
      const balances: CategoryBalance[] = categories.map((category) => {
        const categoryTransactions = filteredTransactions.filter(
          (tx) => tx.category._id === category._id
        );

        const totalIncome = categoryTransactions
          .filter((tx) => tx.type === "income")
          .reduce((sum, tx) => sum + tx.amount, 0);

        const totalExpense = categoryTransactions
          .filter((tx) => tx.type === "expense")
          .reduce((sum, tx) => sum + tx.amount, 0);

        // Calculate balance: income - expense
        const balance = totalIncome - totalExpense;

        console.log(
          `Category ${category.name}: Income=${totalIncome}, Expense=${totalExpense}, Balance=${balance}`
        );

        // Create random color for each category
        const randomColor = getRandomColor(availableColors);

        return {
          _id: category._id,
          name: category.name,
          icon: category.icon,
          color: randomColor,
          type: category.type,
          totalBalance: balance,
        };
      });

      // Sort by balance in descending order
      const filteredBalances = balances.sort(
        (a, b) => b.totalBalance - a.totalBalance
      );

      // Update pie chart data - only categories with positive balance
      const pieChartData = filteredBalances
        .filter((item) => item.totalBalance > 0)
        .map((item) => ({
          id: item._id,
          name: item.name,
          totalAmount: item.totalBalance,
          color: item.color,
        }));

      console.log(`Pie chart data: ${JSON.stringify(pieChartData, null, 2)}`);

      // Update state
      setSavingsData((prev) => ({
        ...prev,
        categories: pieChartData,
      }));

      setCategoryBalances(filteredBalances);
    } catch (error) {
      console.error("Error loading category balances:", error);
      setError("Failed to load category data");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    console.log(`Period changed to: ${period}`);
    setSelectedPeriod(period);
    loadSavingsData();
  };

  // Thêm useEffect để theo dõi thay đổi của selectedPeriod
  useEffect(() => {
    loadCategoryBalances();
  }, [selectedPeriod]);

  const handleAddSaving = () => {
    setIsModalVisible(true);
    setSavingAmount("");
    setError(null);
  };

  const handleSavingAmountChange = (value: string) => {
    // Loại bỏ tất cả các ký tự không phải số
    const numericValue = value.replace(/[^0-9]/g, "");

    // Cập nhật giá trị số thực trong state
    setSavingAmount(numericValue);

    // Định dạng và cập nhật chuỗi hiển thị
    if (numericValue) {
      setFormattedSavingAmount(formatNumberWithCommas(numericValue));
    } else {
      setFormattedSavingAmount("");
    }
  };

  const handleSaveSaving = async () => {
    try {
      setError(null);

      if (!savingAmount || isNaN(Number(savingAmount))) {
        throw new Error("Please enter a valid amount");
      }

      const targetAmountValue = parseInt(savingAmount);

      // Update target amount using API
      const result = await savingService.updateTargetSavingAmount(
        targetAmountValue
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to update target amount");
      }

      // Update state with new target amount
      setSavingsData((prev) => ({
        ...prev,
        targetSavingAmount: targetAmountValue,
        progress: result.data.progress,
      }));

      // Also update simple savings info
      setSimpleSavingsInfo(result.data);

      setIsModalVisible(false);
      setSavingAmount("");
      setFormattedSavingAmount("");
    } catch (error) {
      console.error("Error saving target amount:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update target amount"
      );
    }
  };

  const handleUpdateSaving = () => {
    // Mở modal cập nhật mục tiêu tiết kiệm
    setIsModalVisible(true);
    // Đặt giá trị mặc định là mục tiêu tiết kiệm hiện tại (nếu có)
    if (savingsData.targetSavingAmount) {
      const targetAmount = savingsData.targetSavingAmount.toString();
      setSavingAmount(targetAmount);
      setFormattedSavingAmount(formatNumberWithCommas(targetAmount));
    } else {
      setSavingAmount("");
      setFormattedSavingAmount("");
    }
    setError(null);
  };

  // Category List render function
  const renderCategoryList = () => {
    if (categoryBalances.length === 0) {
      return <Text style={styles.emptyText}>No categories available</Text>;
    }

    // Tính tổng balance thực tế
    const totalBalance = categoryBalances.reduce(
      (sum, cat) => sum + cat.totalBalance,
      0
    );

    return (
      <>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryHeaderText}>Category</Text>
          <Text style={styles.categoryHeaderText}>Total Balance</Text>
        </View>

        {categoryBalances.map((category) => (
          <View key={category._id} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <View
                style={[
                  styles.categoryColor,
                  {
                    backgroundColor:
                      category.totalBalance > 0 ? category.color : "#E2E8F0",
                  },
                ]}
              />
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            <Text
              style={[
                styles.categoryAmount,
                category.totalBalance > 0
                  ? { color: category.color }
                  : { color: "#94A3B8" },
              ]}
            >
              {formatVND(category.totalBalance)}
            </Text>
          </View>
        ))}

        <View style={styles.categoryTotalRow}>
          <Text style={styles.categoryTotalLabel}>Total</Text>
          <Text style={styles.categoryTotal}>{formatVND(totalBalance)}</Text>
        </View>
      </>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#00D09E" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D09E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00D09E" />

      {/* Green Section */}
      <View style={styles.greenSection}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>{/* Xóa nút dấu cộng */}</View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Savings</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Xóa icon chuông notification */}
          </View>
        </View>

        {/* Savings Overview */}
        <View style={styles.savingsCard}>
          <View style={styles.savingsHeaderRow}>
            <Text style={styles.cardTitle}>Total Savings</Text>
            {savingsData.targetSavingAmount &&
            savingsData.targetSavingAmount > 0 ? (
              <View style={styles.updateGoalContainer}>
                <TouchableOpacity
                  style={styles.updateAmountButton}
                  onPress={handleUpdateSaving}
                >
                  <Ionicons name="flag-outline" size={16} color="#00D09E" />
                  <Text style={styles.updateAmountText}>Update Goal</Text>
                </TouchableOpacity>
                <View style={styles.tooltipContainer}>
                  <Text style={styles.tooltipText}>
                    Set your savings target
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
          <Text style={styles.savingsSubtitle}>
            {currentMonth}'s Savings (Auto-calculated)
          </Text>
          <View style={styles.savingsInfo}>
            <Text
              style={[
                styles.savingsAmount,
                savingsData.totalSavings < 0 && styles.negativeAmount,
              ]}
            >
              {formatVND(savingsData.totalSavings)}
            </Text>
            {savingsData.targetSavingAmount &&
            savingsData.targetSavingAmount > 0 ? (
              <Text style={styles.savingsTarget}>
                / {formatVND(savingsData.targetSavingAmount)}
              </Text>
            ) : null}
          </View>

          <View style={styles.savingInfoContainer}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#64748B"
            />
            <Text style={styles.savingInfoText}>
              Savings = Total Income - Total Expenses from the beginning of the
              month to the current date
            </Text>
          </View>

          {/* Progress Bar */}
          {savingsData.targetSavingAmount &&
          savingsData.targetSavingAmount > 0 ? (
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={
                  savingsData.totalSavings < 0
                    ? -100
                    : savingsData.targetSavingAmount > 0
                    ? (savingsData.totalSavings /
                        savingsData.targetSavingAmount) *
                      100
                    : 0
                }
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {savingsData.totalSavings < 0
                  ? "Exceeded"
                  : `${Math.round(
                      (savingsData.totalSavings /
                        savingsData.targetSavingAmount) *
                        100
                    )}% of your goal`}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.setGoalButton}
              onPress={handleAddSaving}
            >
              <Text style={styles.setGoalButtonText}>Set a Savings Goal</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* White Section */}
      <View style={styles.whiteSection}>
        <ScrollView style={styles.content}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Monthly Trend Chart */}
          {savingsData.monthlyData.labels.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Monthly Savings Trend</Text>
              <View style={styles.chartWrapper}>
                <LineChart
                  data={{
                    labels: savingsData.monthlyData.labels,
                    datasets: [{ data: savingsData.monthlyData.data }],
                  }}
                  width={screenWidth - 64}
                  height={200}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                    marginLeft: 5,
                  }}
                  chartConfig={{
                    backgroundColor: "#FFFFFF",
                    backgroundGradientFrom: "#FFFFFF",
                    backgroundGradientTo: "#FFFFFF",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 208, 158, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    formatYLabel: () => "",
                    propsForLabels: {
                      dx: -15,
                    },
                    style: {
                      borderRadius: 16,
                      paddingLeft: -20,
                      paddingRight: 20,
                    },
                    propsForDots: {
                      r: "5",
                      strokeWidth: "2",
                      stroke: "#00D09E",
                    },
                    strokeWidth: 2,
                    barPercentage: 0.5,
                    useShadowColorFromDataset: false,
                  }}
                  fromZero
                  yAxisSuffix=""
                  yAxisLabel=""
                  yLabelsOffset={1000}
                  yAxisInterval={1}
                  verticalLabelRotation={0}
                  withHorizontalLines={true}
                  withInnerLines={true}
                  withOuterLines={false}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  withVerticalLines={true}
                  segments={4}
                  hidePointsAtIndex={[]}
                  getDotColor={(dataPoint, dataPointIndex) => {
                    const maxValue = Math.max(...savingsData.monthlyData.data);
                    const isCurrentMonth =
                      dataPointIndex ===
                      savingsData.monthlyData.labels.length - 1;
                    return isCurrentMonth ? "#FF5722" : "#00D09E";
                  }}
                  decorator={() => {
                    return savingsData.monthlyData.data.map((value, index) => {
                      if (value === 0) return null;

                      const spacing =
                        (screenWidth - 32) /
                        savingsData.monthlyData.labels.length;
                      const x = spacing * (index + 0.5);

                      const maxValue = Math.max(
                        ...savingsData.monthlyData.data
                      );
                      const y = 200 - (value / maxValue) * 150 - 25;

                      const isCurrentMonth =
                        index === savingsData.monthlyData.labels.length - 1;

                      const amount = value.toLocaleString("vi-VN");
                      const formattedValue = `${amount}đ`;

                      return (
                        <View
                          key={index}
                          style={{
                            position: "absolute",
                            left: x - 85,
                            top: y - 30,
                          }}
                        >
                          <Text
                            style={{
                              color: isCurrentMonth ? "#FF5722" : "#00D09E",
                              fontSize: isCurrentMonth ? 14 : 12,
                              fontWeight: isCurrentMonth ? "bold" : "normal",
                              width: 90,
                              textAlign: "center",
                            }}
                          >
                            {formattedValue}
                          </Text>
                        </View>
                      );
                    });
                  }}
                />
              </View>
              <Text style={styles.chartSubtitle}>
                {currentMonth} {currentYear} và 5 tháng trước
              </Text>
            </View>
          )}

          {/* Category Distribution with custom legend */}
          {categoryBalances.filter((cat) => cat.totalBalance > 0).length >
            0 && (
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Category Distribution</Text>

              {/* Period Selector */}
              <View style={styles.periodSelector}>
                {["daily", "weekly", "monthly"].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      selectedPeriod === period && styles.periodButtonActive,
                    ]}
                    onPress={() => handlePeriodChange(period)}
                  >
                    <Text
                      style={[
                        styles.periodButtonText,
                        selectedPeriod === period &&
                          styles.periodButtonTextActive,
                      ]}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.chartContainer, styles.chartCentered]}>
                <PieChart
                  data={categoryBalances
                    .filter((cat) => cat.totalBalance > 0)
                    .map((category) => {
                      return {
                        name: category.name,
                        population: category.totalBalance,
                        color: category.color,
                        legendFontColor: "#7F7F7F",
                        legendFontSize: 12,
                      };
                    })}
                  width={screenWidth - 32}
                  height={220}
                  chartConfig={{
                    backgroundColor: "#FFFFFF",
                    backgroundGradientFrom: "#FFFFFF",
                    backgroundGradientTo: "#FFFFFF",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  absolute
                  style={styles.chart}
                  avoidFalseZero
                  hasLegend={false}
                  center={[screenWidth / 2 - 110, 10]}
                />
              </View>

              {/* Custom legend only showing category names */}
              <View style={styles.customLegend}>
                {categoryBalances
                  .filter((cat) => cat.totalBalance > 0)
                  .map((category, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendColor,
                          { backgroundColor: category.color },
                        ]}
                      />
                      <Text style={styles.legendText}>{category.name}</Text>
                    </View>
                  ))}
              </View>
            </View>
          )}

          {/* Category List */}
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Category Balance</Text>
            {renderCategoryList()}
          </View>
        </ScrollView>
      </View>

      {/* Add Saving Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons
                name="wallet-outline"
                size={28}
                color="#00D09E"
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>Update Saving Goal</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setIsModalVisible(false);
                  setError(null);
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Update your saving target for {currentMonth}
            </Text>
            {error && <Text style={styles.modalErrorText}>{error}</Text>}

            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₫</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={formattedSavingAmount}
                onChangeText={handleSavingAmountChange}
                placeholderTextColor="#AAAAAA"
              />
            </View>

            {formattedSavingAmount ? (
              <Text style={styles.formattedPreview}>
                {formatVND(parseFloat(savingAmount))}
              </Text>
            ) : null}

            <Text style={styles.inputHelper}>
              This will update your saving goal target
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  setError(null);
                  setSavingAmount("");
                  setFormattedSavingAmount("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveSaving}
              >
                <Text style={styles.saveButtonText}>Update Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  greenSection: {
    backgroundColor: "#00D09E",
    paddingBottom: 16,
  },
  whiteSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  notificationButton: {
    padding: 8,
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 6,
  },
  periodButtonActive: {
    backgroundColor: "#00D09E",
  },
  periodButtonText: {
    color: "#64748B",
    fontWeight: "500",
    fontSize: 13,
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  savingsCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    margin: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  savingsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  updateAmountButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FFF8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  updateAmountText: {
    color: "#00D09E",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  savingsSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  savingsInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00D09E",
    marginRight: 8,
  },
  savingsTarget: {
    fontSize: 14,
    color: "#64748B",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    minWidth: 80,
  },
  setGoalButton: {
    backgroundColor: "#00D09E",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  setGoalButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    margin: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartWithMargin: {
    marginVertical: 8,
    borderRadius: 16,
    margin: 16,
  },
  chartContainer: {
    position: "relative",
    marginVertical: 8,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    color: "#1E293B",
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#00D09E",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "85%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  modalIcon: {
    marginRight: 10,
  },
  closeButton: {
    position: "absolute",
    right: 0,
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    flex: 1,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
    textAlign: "center",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  currencySymbol: {
    fontSize: 24,
    color: "#333333",
    marginRight: 8,
    fontWeight: "500",
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: "#333333",
    padding: 0,
    fontWeight: "600",
  },
  formattedPreview: {
    fontSize: 14,
    color: "#00D09E",
    marginBottom: 12,
    textAlign: "right",
    fontWeight: "500",
  },
  inputHelper: {
    fontSize: 13,
    color: "#94A3B8",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
  },
  saveButton: {
    backgroundColor: "#00D09E",
  },
  cancelButtonText: {
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
  },
  saveButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    padding: 16,
  },
  modalErrorText: {
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 12,
  },
  updateSavingButton: {
    padding: 4,
  },
  savingInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
  },
  savingInfoText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
  },
  updateGoalContainer: {
    position: "relative",
  },
  tooltipContainer: {
    position: "absolute",
    top: 30,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    width: 110,
    zIndex: 1000,
    opacity: 0.9,
    display: "none", // Mặc định ẩn, chỉ hiển thị khi hover trong web
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 10,
    textAlign: "center",
  },
  savingDetailsContainer: {
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  savingDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  savingDetailLabel: {
    fontSize: 12,
    color: "#64748B",
    marginRight: 4,
  },
  savingDetailValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  incomeText: {
    color: "#00D09E",
  },
  expenseText: {
    color: "#EF4444",
  },
  negativeAmount: {
    color: "#EF4444",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginBottom: 8,
  },
  categoryHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  categoryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginTop: 8,
  },
  categoryTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00D09E",
  },
  emptyCategory: {
    color: "#94A3B8",
    fontStyle: "italic",
  },
  infoNote: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  customLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#7F7F7F",
  },
  chartCentered: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  chartSubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
  },
  chartWrapper: {
    marginLeft: -30,
    marginRight: 30,
  },
});

export default SavingScreen;
