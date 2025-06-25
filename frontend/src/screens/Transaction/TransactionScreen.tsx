import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  CompositeNavigationProp,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  RootStackParamList,
  TabParamList,
  TransactionStackParamList,
} from "../../navigation/types";
import { formatVND } from "../../utils/formatters";
import apiClient from "../../services/apiClient";
import { colors } from "../../theme";
import { format, subMonths, getMonth, getYear } from "date-fns";
import { useWallet } from "../../hooks/useWallet";
import { useTransaction, Transaction } from "../../hooks/useTransaction";
import { formatCurrency } from "../../utils/currency";

// Update the Period type to include specific month options
type Period = "THIS_MONTH" | "LAST_MONTH" | "FUTURE" | string; // For month-specific periods like "12/2024"

// Define a more specific navigation type
type TransactionScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<TransactionStackParamList, "Transaction">,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

const TransactionScreen = () => {
  const navigation = useNavigation<TransactionScreenNavigationProp>();
  const route = useRoute<RouteProp<TransactionStackParamList, "Transaction">>();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("THIS_MONTH");
  const [availableMonths, setAvailableMonths] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [endingBalance, setEndingBalance] = useState(0);
  const { wallets, getWallets } = useWallet();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const {
    transactions: transactionData,
    getTransactions,
    clearTransactions,
  } = useTransaction();
  const [error, setError] = useState<string | null>(null);
  const periodScrollRef = useRef<ScrollView>(null);
  const [monthButtonWidths, setMonthButtonWidths] = useState<{
    [key: string]: number;
  }>({});
  const [containerWidth, setContainerWidth] = useState(0);

  // Generate the list of available months when component mounts
  useEffect(() => {
    generateAvailableMonths();
  }, []);

  // Update selectedWalletId when it's passed from AddTransactionScreen
  useEffect(() => {
    if (
      route.params &&
      "selectedWalletId" in route.params &&
      route.params.selectedWalletId
    ) {
      setSelectedWalletId(route.params.selectedWalletId);
    }
  }, [route.params]);

  // Set default wallet ID when wallets are loaded (only if not already set)
  useEffect(() => {
    if (wallets && wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0]?._id || null);
    }
  }, [wallets]);

  // Scroll to THIS_MONTH after months are loaded
  useEffect(() => {
    if (
      availableMonths.length > 0 &&
      periodScrollRef.current &&
      containerWidth > 0 &&
      Object.keys(monthButtonWidths).length === availableMonths.length
    ) {
      // Small delay to ensure the scroll view has rendered
      setTimeout(() => {
        scrollToSelectedPeriod("THIS_MONTH");
      }, 100);
    }
  }, [availableMonths, containerWidth, monthButtonWidths]);

  // Function to generate the list of available months
  const generateAvailableMonths = () => {
    const months = [];
    const now = new Date();

    // Add 6 previous months with more readable format (oldest first)
    for (let i = 7; i >= 2; i--) {
      const date = subMonths(now, i);
      const monthName = format(date, "MMM yyyy"); // Using MMM for shorter month name (Jan, Feb, etc.)
      const monthValue = format(date, "MM/yyyy");
      months.push({
        label: monthName,
        value: monthValue,
      });
    }

    // Add "LAST_MONTH"
    months.push({
      label: "THÁNG TRƯỚC",
      value: "LAST_MONTH",
    });

    // Add "THIS_MONTH"
    months.push({
      label: "THÁNG NÀY",
      value: "THIS_MONTH",
    });

    // Add "FUTURE"
    months.push({
      label: "TƯƠNG LAI",
      value: "FUTURE",
    });

    setAvailableMonths(months);
  };

  const getStartDate = (period: Period): Date => {
    const now = new Date();
    switch (period) {
      case "LAST_MONTH":
        return new Date(now.getFullYear(), now.getMonth() - 1, 1);
      case "THIS_MONTH":
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case "FUTURE":
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  };

  const getEndDate = (period: Period): Date => {
    const now = new Date();
    switch (period) {
      case "LAST_MONTH":
        return new Date(now.getFullYear(), now.getMonth(), 0);
      case "THIS_MONTH":
        return new Date(now.getFullYear(), now.getMonth() + 1, 0);
      case "FUTURE":
        return new Date(now.getFullYear(), now.getMonth() + 2, 0);
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
  };

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    // Return empty array if no transactions
    if (!transactions || transactions.length === 0) return [];

    console.log("🔄 Grouping transactions by date...");

    // Sort by date (newest first)
    const sorted = transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Group by date (using YYYY-MM-DD format as key)
    const grouped: { [key: string]: Transaction[] } = {};
    sorted.forEach((transaction) => {
      const dateKey = new Date(transaction.date).toISOString().split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });

    const result = Object.entries(grouped).map(([dateKey, transactions]) => {
      const totalAmount = transactions.reduce((sum, t) => {
        return t.type === "income" ? sum + t.amount : sum - t.amount;
      }, 0);

      const group = {
        date: dateKey,
        transactions,
        totalAmount,
      };

      return group;
    });

    return result;
  };

  const calculateBalances = (transactions: Transaction[]) => {
    if (!transactions || transactions.length === 0) {
      setOpeningBalance(0);
      setEndingBalance(0);
      return;
    }

    console.log("🔄 Calculating balances...");
    let ending = 0;

    transactions.forEach((transaction) => {
      const prevEnding = ending;
      // Kiểm tra xem transaction có category không và category đó có type không
      const categoryType =
        transaction.category &&
        typeof transaction.category === "object" &&
        transaction.category.type;

      // Sử dụng loại giao dịch chính xác từ transaction hoặc từ category của nó nếu có sẵn
      const effectiveType = categoryType || transaction.type;

      if (effectiveType === "income") {
        ending += transaction.amount;
      } else if (effectiveType === "expense") {
        ending -= transaction.amount;
      } else {
        console.log(
          `Unknown transaction type: ${effectiveType} for transaction ${transaction._id}`
        );
      }
    });

    console.log(`Final balance calculation: ${ending}`);
    setOpeningBalance(0); // For now, set opening balance to 0
    setEndingBalance(ending);
  };

  // Hàm tính tổng số dư của tất cả ví
  const totalBalance = () => {
    return wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  };

  // Define loadData with useCallback - after all the required functions are defined
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = getStartDate(selectedPeriod);
      const endDate = getEndDate(selectedPeriod);

      console.log("🔄 TransactionScreen: Loading data with parameters:", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        walletId:
          selectedWalletId === "all" || selectedWalletId === null
            ? "all wallets"
            : selectedWalletId,
        selectedPeriod,
      });

      // Xác định params để gửi đến API
      let params: any = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      // Chỉ thêm walletId vào params nếu không phải "all" và không phải null
      if (selectedWalletId !== "all" && selectedWalletId !== null) {
        params.walletId = selectedWalletId;
      }

      console.log(
        "📊 Calling getTransactions with params:",
        JSON.stringify(params, null, 2)
      );
      const result = await getTransactions(params);

      console.log(
        `✅ TransactionScreen: Loaded ${
          result.length
        } transactions for wallet: ${selectedWalletId || "all"}`
      );

      if (result.length > 0) {
        console.log(
          "📊 First transaction sample:",
          JSON.stringify(
            {
              _id: result[0]._id,
              amount: result[0].amount,
              type: result[0].type,
              date: result[0].date,
              walletId: result[0].wallet,
              categoryId:
                typeof result[0].category === "object"
                  ? result[0].category?._id
                  : result[0].category,
            },
            null,
            2
          )
        );
      }

      calculateBalances(result);

      if (result.length === 0) {
        console.log(
          "❕ No transactions found for the selected period and wallet"
        );
      }
    } catch (err) {
      console.error("❌ Error loading transaction data:", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    selectedPeriod,
    selectedWalletId,
    getStartDate,
    getEndDate,
    calculateBalances,
    getTransactions,
  ]);

  // Add a listener for screen focus to reload data when tab is clicked
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("TransactionScreen focused - reloading data");
      console.log("Current wallet and period when focused:", {
        walletId: selectedWalletId,
        period: selectedPeriod,
      });

      // Clear existing transactions before loading new ones
      clearTransactions();

      // Fetch fresh wallet data when screen is focused
      getWallets().then(() => {
        // Ngay sau khi lấy dữ liệu ví, tải dữ liệu giao dịch với tham số hiện tại
        loadData();
      });
    });

    // Clean up the listener when the component is unmounted
    return unsubscribe;
  }, [navigation, loadData, clearTransactions]);

  // Load initial data
  useEffect(() => {
    // Load wallets and transactions when component mounts or when period/wallet selection changes
    const loadInitialData = async () => {
      await getWallets();
      loadData();
    };

    loadInitialData();
  }, [selectedPeriod, selectedWalletId]); // Loại bỏ các dependency gây lặp vô hạn

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: format(date, "d"),
      weekday: format(date, "EEEE"),
      month: format(date, "MMMM"),
      year: format(date, "yyyy"),
    };
  };

  const handleAddTransaction = () => {
    // Pass the currently selected wallet ID to the AddTransaction screen
    navigation.navigate("AddTransaction", {
      preSelectedWalletId: selectedWalletId || undefined,
    });
  };

  const handleWalletPress = () => {
    // Thêm option "All Wallets" để xem tất cả giao dịch
    navigation.navigate("WalletScreen", {
      onSelectWallet: (walletId: string) => {
        console.log("Selected wallet ID:", walletId);
        setSelectedWalletId(walletId === "all" ? "all" : walletId);
      },
      selectedWalletId,
      showAllWalletsOption: true,
    });
  };

  // Function to center the selected period in the scroll view
  const scrollToSelectedPeriod = (period: string) => {
    if (!periodScrollRef.current || !containerWidth) return;

    // Calculate the position to scroll to
    let scrollToPosition = 0;
    let currentPosition = 0;

    // Loop through month buttons to find position of selected one
    for (const month of availableMonths) {
      const buttonWidth = monthButtonWidths[month.value] || 0;

      if (month.value === period) {
        // Found the selected month - calculate center position
        scrollToPosition =
          currentPosition - containerWidth / 2 + buttonWidth / 2;
        break;
      }

      // Add button width plus margin (8px on each side)
      currentPosition += buttonWidth + 8;
    }

    // Make sure we don't scroll to negative position
    scrollToPosition = Math.max(0, scrollToPosition);

    // Scroll to the calculated position
    periodScrollRef.current.scrollTo({ x: scrollToPosition, animated: true });
  };

  // Update scrollToSelectedPeriod to be called when selectedPeriod changes
  useEffect(() => {
    if (
      availableMonths.length > 0 &&
      containerWidth > 0 &&
      Object.keys(monthButtonWidths).length === availableMonths.length
    ) {
      scrollToSelectedPeriod(selectedPeriod);
    }
  }, [selectedPeriod, availableMonths, containerWidth, monthButtonWidths]);

  // Handle month selection
  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
  };

  // Render wallet icon based on icon type (Ionicons name or URL)
  const renderWalletIcon = (icon?: string) => {
    if (!icon || typeof icon !== "string") {
      return (
        <Ionicons name="wallet-outline" size={24} color={colors.primary} />
      );
    }

    // Check if it's an Ionicons name
    if (icon.includes("outline") || icon.includes("-")) {
      try {
        return <Ionicons name={icon as any} size={24} color={colors.primary} />;
      } catch (error) {
        return (
          <Ionicons name="wallet-outline" size={24} color={colors.primary} />
        );
      }
    }

    // If it's a URL, display as an image
    return (
      <Image
        source={{ uri: icon }}
        style={styles.walletIcon}
        defaultSource={{ uri: "https://example.com/default-wallet-icon.png" }}
        onError={() => console.error("Error loading wallet icon:", icon)}
      />
    );
  };

  const renderHeader = () => {
    // Find the currently selected wallet
    const selectedWallet =
      selectedWalletId === "all"
        ? {
            name: "Tất Cả Ví",
            balance: totalBalance(),
            icon: "wallet-outline", // Use Ionicons name for All Wallets
          }
        : wallets.find((wallet) => wallet._id === selectedWalletId) ||
          wallets[0];

    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.balanceLabel}>Số Dư</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(selectedWallet?.balance || 0)}
          </Text>
          <TouchableOpacity
            style={[
              styles.walletSelector,
              { borderColor: colors.primary, borderWidth: 1 },
            ]}
            onPress={handleWalletPress}
          >
            {renderWalletIcon(selectedWallet?.icon)}
            <Text
              style={[
                styles.walletName,
                { color: colors.primary, fontWeight: "600" },
              ]}
            >
              {selectedWallet?.name || "Tiền mặt"}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPeriodSelector = () => (
    <ScrollView
      ref={periodScrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.periodSelectorContent}
      style={styles.periodSelector}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      {availableMonths.map((month) => (
        <TouchableOpacity
          key={month.value}
          style={[
            styles.periodButton,
            selectedPeriod === month.value && styles.selectedPeriodButton,
          ]}
          onPress={() => handlePeriodSelect(month.value)}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setMonthButtonWidths((prev) => ({
              ...prev,
              [month.value]: width,
            }));
          }}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === month.value && styles.selectedPeriodButtonText,
            ]}
          >
            {month.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderBalanceSummary = () => (
    <View style={styles.balanceSummary}>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>Số dư đầu kỳ</Text>
        <Text style={styles.balanceValue}>
          {formatCurrency(openingBalance)}
        </Text>
      </View>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>Số dư cuối kỳ</Text>
        <Text style={styles.balanceValue}>{formatCurrency(endingBalance)}</Text>
      </View>
      <View style={styles.balanceRow}>
        <Text style={styles.totalLabel}>Tổng</Text>
        <Text style={styles.totalValue}>
          {formatCurrency(endingBalance - openingBalance)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => navigation.navigate("ReportPeriod" as any)}
      >
        <Text style={styles.reportButtonText}>
          Xem báo cáo cho khoảng thời gian này
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={80} color="#666" />
      <Text style={styles.emptyStateText}>Không có giao dịch</Text>
    </View>
  );

  const handleTransactionPress = (transaction: Transaction) => {
    navigation.navigate("EditTransaction", {
      transactionId: transaction._id,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Group transactions by date
  const groupedTransactions = groupTransactionsByDate(transactionData);

  return (
    <SafeAreaView style={styles.container} edges={["right", "left"]}>
      {renderHeader()}
      <View style={styles.mainContent}>
        <View style={styles.innerContent}>
          {renderPeriodSelector()}
          {renderBalanceSummary()}
        </View>
        <ScrollView
          style={styles.transactionsList}
          contentContainerStyle={styles.transactionsListContent}
          showsVerticalScrollIndicator={false}
        >
          {groupedTransactions.length === 0
            ? renderEmptyState()
            : groupedTransactions.map((group) => (
                <View key={group.date} style={styles.transactionBlock}>
                  <View style={styles.dateHeader}>
                    <View style={styles.dateInfo}>
                      <Text style={styles.dateNumber}>
                        {formatDate(group.date).day}
                      </Text>
                      <View style={styles.dateTextContainer}>
                        <Text style={styles.dateWeekday}>
                          {formatDate(group.date).weekday}
                        </Text>
                        <Text style={styles.dateMonthYear}>
                          {formatDate(group.date).month}{" "}
                          {formatDate(group.date).year}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.dayTotalAmount,
                        group.totalAmount >= 0
                          ? styles.incomeAmount
                          : styles.expenseAmount,
                      ]}
                    >
                      {group.totalAmount >= 0 ? "+" : "-"}
                      {formatCurrency(Math.abs(group.totalAmount))}
                    </Text>
                  </View>
                  <View style={styles.transactionsContainer}>
                    {group.transactions.map((transaction, index) => (
                      <TouchableOpacity
                        key={transaction._id || Math.random().toString()}
                        style={[
                          styles.transactionRow,
                          index < group.transactions.length - 1
                            ? { marginBottom: 16 }
                            : {},
                        ]}
                        onPress={() => handleTransactionPress(transaction)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.transactionInfo}>
                          <View
                            style={[
                              styles.categoryIcon,
                              {
                                backgroundColor:
                                  transaction.category &&
                                  typeof transaction.category === "object" &&
                                  transaction.category.color
                                    ? transaction.category.color
                                    : "#AAAAAA",
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                transaction.category &&
                                typeof transaction.category === "object" &&
                                transaction.category.icon
                                  ? (transaction.category.icon as any)
                                  : ("ellipsis-horizontal-outline" as any)
                              }
                              size={24}
                              color="#fff"
                            />
                          </View>
                          <Text style={styles.transactionName}>
                            {transaction.description ||
                              (transaction.category &&
                              typeof transaction.category === "object"
                                ? transaction.category.name
                                : "Không xác định")}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.transactionAmount,
                            transaction.type === "income"
                              ? styles.incomeAmount
                              : styles.expenseAmount,
                          ]}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddTransaction}>
        <Ionicons name="add" size={30} color="#FFF" />
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
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 45,
    paddingBottom: 25,
  },
  headerContent: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  walletSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 8,
    borderRadius: 20,
  },
  walletIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  walletName: {
    fontSize: 16,
    marginRight: 8,
  },
  periodSelector: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0,
    borderBottomColor: "#EEE",
    height: 40,
    marginBottom: 0,
    paddingBottom: 0,
  },
  periodSelectorContent: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
  },
  periodButton: {
    paddingVertical: 0,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedPeriodButton: {
    borderBottomWidth: 0,
    backgroundColor: `${colors.primary}20`,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  periodButtonText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  selectedPeriodButtonText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  transactionsList: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  transactionsListContent: {
    paddingBottom: 140,
  },
  balanceSummary: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 0,
    marginBottom: 8,
    borderTopWidth: 0,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 16,
    color: "#000",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  reportButton: {
    alignItems: "center",
    marginTop: 12,
  },
  reportButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  transactionBlock: {
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  dateHeader: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTextContainer: {
    marginLeft: 12,
  },
  dateNumber: {
    fontSize: 32,
    fontWeight: "bold",
  },
  dateWeekday: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  dateMonthYear: {
    fontSize: 14,
    color: "#666",
  },
  transactionsContainer: {
    padding: 12,
  },
  dayTotalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "500",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "500",
  },
  incomeAmount: {
    color: "#00C897",
  },
  expenseAmount: {
    color: "#FF6B6B",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
    paddingBottom: 0,
  },
  innerContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});

export default TransactionScreen;
