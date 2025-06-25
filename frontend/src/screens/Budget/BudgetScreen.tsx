import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
import { formatCurrency } from "../../utils/formatters";
import { Budget } from "../../types/budget";
import { BudgetSummary } from "../../services/budgetService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BudgetStackParamList } from "../../navigation/types";
import Svg, { Path, Circle } from "react-native-svg";
import { useIsFocused } from "@react-navigation/native";
import apiClient from "../../services/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "../../config/config";

type BudgetScreenNavigationProp =
  NativeStackNavigationProp<BudgetStackParamList>;

interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
}

export interface BudgetWithCategories extends Omit<Budget, "categories"> {
  categories: Category[];
}

const BudgetScreen = () => {
  const navigation = useNavigation<BudgetScreenNavigationProp>();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<string>("all");
  const [budgets, setBudgets] = useState<BudgetWithCategories[]>([]);
  const [summary, setSummary] = useState<BudgetSummary>({
    totalBudgeted: 0,
    totalSpent: 0,
    averageUsagePercentage: 0,
    totalBudgets: 0,
    inProgressBudgets: 0,
    completedBudgets: 0,
    exceededBudgets: 0,
  });

  useEffect(() => {
    if (isFocused) {
      loadBudgets();
    }
  }, [isFocused, selectedWallet]);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem(config.auth.tokenKey);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const params = new URLSearchParams();
      if (selectedWallet) {
        params.append("walletId", selectedWallet);
      } else {
        params.append("walletId", "all");
      }
      params.append("_t", String(Date.now())); // Thêm timestamp để tránh cache

      const response = await apiClient.get(
        `/api/budgets?${params.toString()}`,
        {
          headers: {
            ...headers,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      setBudgets(response.data.budgets);
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error loading budgets:", error);
      Alert.alert("Lỗi", "Không thể tải ngân sách. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditBudget = (budget: BudgetWithCategories) => {
    navigation.navigate("EditBudget", {
      budgetId: budget._id,
    });
  };

  const handleCreateBudget = () => {
    navigation.navigate("CreateBudget");
  };

  const renderSemiCircleProgress = () => {
    const radius = 120;
    const strokeWidth = 20;
    const center = radius + strokeWidth;
    const percentage =
      summary.totalBudgeted > 0
        ? (summary.totalSpent / summary.totalBudgeted) * 100
        : 0;

    // Calculate the path for the semi-circle
    const startAngle = -180;
    const endAngle = 0;
    const startPoint = polarToCartesian(center, center, radius, endAngle);
    const endPoint = polarToCartesian(center, center, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
      "M",
      startPoint.x,
      startPoint.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      endPoint.x,
      endPoint.y,
    ].join(" ");

    return (
      <View key="progress-container" style={styles.progressContainer}>
        <View key="progress-circle" style={styles.progressCircle}>
          <Svg
            key="progress-svg"
            width={center * 2}
            height={center + radius}
            viewBox={`0 0 ${center * 2} ${center + radius}`}
          >
            {/* Background semi-circle */}
            <Path
              key="background-path"
              d={d}
              fill="none"
              stroke="#E8E8E8"
              strokeWidth={strokeWidth}
            />
            {/* Progress semi-circle */}
            <Path
              key="progress-path"
              d={d}
              fill="none"
              stroke="#00D09E"
              strokeWidth={strokeWidth}
              strokeDasharray={`${(percentage * Math.PI * radius) / 100} ${
                Math.PI * radius
              }`}
            />
          </Svg>
          <View
            key="progress-text-container"
            style={styles.progressTextContainer}
          >
            <Text key="progress-label" style={styles.progressLabel}>
              Số tiền bạn có thể chi tiêu
            </Text>
            <Text key="progress-amount" style={styles.progressAmount}>
              {formatCurrency(summary.totalBudgeted - summary.totalSpent)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBudgetStats = () => (
    <View style={styles.statsContainer}>
      <View key="total" style={styles.statItem}>
        <Text style={styles.statValue}>{summary.totalBudgets}</Text>
        <Text style={styles.statLabel}>Tổng</Text>
      </View>
      <View key="active" style={styles.statItem}>
        <Text style={styles.statValue}>{summary.inProgressBudgets}</Text>
        <Text style={styles.statLabel}>Đang hoạt động</Text>
      </View>
      <View key="completed" style={styles.statItem}>
        <Text style={styles.statValue}>{summary.completedBudgets}</Text>
        <Text style={styles.statLabel}>Hoàn thành</Text>
      </View>
      <View key="exceeded" style={styles.statItem}>
        <Text style={styles.statValue}>{summary.exceededBudgets}</Text>
        <Text style={styles.statLabel}>Vượt quá</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00D09E" />
      {/* Header */}
      <View style={styles.header}>
        <View key="header-left" style={styles.headerLeft} />
        <View key="header-center" style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Ngân Sách</Text>
        </View>
        <View key="header-right" style={styles.headerRight}>
          <TouchableOpacity
            style={styles.walletButton}
            onPress={() =>
              navigation.navigate("SelectWallet", {
                selectedWalletId: selectedWallet,
                onSelectWallet: (wallet) => setSelectedWallet(wallet._id),
              })
            }
          >
            <Ionicons name="wallet-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Budget Overview Card */}
          <View style={styles.overviewCard}>
            {renderSemiCircleProgress()}

            <View style={styles.statsRow}>
              <View key="budget" style={styles.statItem}>
                <Text style={styles.statValue}>
                  {(summary.totalBudgeted / 1000000).toFixed(1)}M
                </Text>
                <Text style={styles.statLabel}>Tổng ngân sách</Text>
              </View>
              <View key="divider1" style={styles.divider} />
              <View key="spent" style={styles.statItem}>
                <Text style={styles.statValue}>
                  {(summary.totalSpent / 1000000).toFixed(1)}M
                </Text>
                <Text style={styles.statLabel}>Tổng chi tiêu</Text>
              </View>
              <View key="divider2" style={styles.divider} />
              <View key="usage" style={styles.statItem}>
                <Text style={styles.statValue}>
                  {summary.averageUsagePercentage}%
                </Text>
                <Text style={styles.statLabel}>Sử dụng</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateBudget}
            >
              <Text style={styles.createButtonText}>Tạo Ngân Sách</Text>
            </TouchableOpacity>
          </View>

          {/* Budget List */}
          <View style={styles.budgetListContainer}>
            <View style={styles.budgetListHeader}>
              <Text style={styles.sectionTitle}>Ngân Sách Của Bạn</Text>
            </View>

            {budgets.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="wallet-outline" size={64} color="#DDD" />
                <Text style={styles.emptyStateTitle}>
                  Chưa có ngân sách nào
                </Text>
                <Text style={styles.emptyStateText}>
                  Tạo ngân sách để theo dõi chi tiêu và tiết kiệm tiền
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={handleCreateBudget}
                >
                  <Text style={styles.emptyStateButtonText}>Tạo Ngân Sách</Text>
                </TouchableOpacity>
              </View>
            ) : (
              budgets.map((budget) => (
                <TouchableOpacity
                  key={budget._id}
                  style={styles.budgetCard}
                  onPress={() => handleEditBudget(budget)}
                >
                  <View style={styles.budgetHeader}>
                    <View
                      key={`icon-${budget._id}`}
                      style={[
                        styles.budgetIcon,
                        typeof budget.categories[0] === "object" &&
                        budget.categories[0] !== null &&
                        budget.categories[0].color
                          ? { backgroundColor: budget.categories[0].color }
                          : { backgroundColor: "#E8E8E8" },
                      ]}
                    >
                      <Ionicons
                        key={`icon-icon-${budget._id}`}
                        name={
                          typeof budget.categories[0] === "object" &&
                          budget.categories[0] !== null &&
                          budget.categories[0].icon
                            ? (budget.categories[0].icon as any)
                            : "document-text-outline"
                        }
                        size={24}
                        color="#FFF"
                      />
                    </View>
                    <View key={`info-${budget._id}`} style={styles.budgetInfo}>
                      <Text
                        key={`name-${budget._id}`}
                        style={styles.budgetName}
                      >
                        {budget.name}
                      </Text>
                      <Text
                        key={`dates-${budget._id}`}
                        style={styles.budgetDates}
                      >
                        {new Date(budget.startDate).toLocaleDateString()} -{" "}
                        {new Date(budget.endDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View
                      key={`status-${budget._id}`}
                      style={styles.budgetStatus}
                    >
                      <Text
                        key={`status-text-${budget._id}`}
                        style={[
                          styles.statusText,
                          budget.currentAmount > budget.amount
                            ? styles.statusExceeded
                            : (budget.currentAmount / budget.amount) * 100 >= 80
                            ? styles.statusWarning
                            : styles.statusHealthy,
                        ]}
                      >
                        {budget.currentAmount > budget.amount
                          ? "Vượt quá"
                          : (budget.currentAmount / budget.amount) * 100 >= 80
                          ? "Cảnh báo"
                          : "Tốt"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.budgetBody}>
                    <View style={styles.budgetAmounts}>
                      {[
                        {
                          key: "budget-amount",
                          label: "Ngân sách",
                          value: formatCurrency(budget.amount),
                          style: null,
                        },
                        {
                          key: "spent-amount",
                          label: "Đã chi",
                          value: formatCurrency(budget.currentAmount),
                          style:
                            budget.currentAmount > budget.amount
                              ? styles.exceededAmount
                              : null,
                        },
                        {
                          key: "remaining-amount",
                          label: "Còn lại",
                          value: formatCurrency(
                            budget.amount - budget.currentAmount
                          ),
                          style:
                            budget.amount - budget.currentAmount < 0
                              ? styles.negativeAmount
                              : styles.positiveAmount,
                        },
                      ].map((item) => (
                        <View key={item.key} style={styles.amountItem}>
                          <Text
                            key={`${item.key}-label`}
                            style={styles.amountLabel}
                          >
                            {item.label}
                          </Text>
                          <Text
                            key={`${item.key}-value`}
                            style={[styles.amountValue, item.style]}
                          >
                            {item.value}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.progressContainer}>
                      <View key="progress-bar" style={styles.progressBarModern}>
                        <View
                          key="progress-fill"
                          style={[
                            styles.progressFillModern,
                            {
                              width: `${Math.min(
                                (budget.currentAmount / budget.amount) * 100,
                                100
                              )}%`,
                              backgroundColor:
                                budget.currentAmount > budget.amount
                                  ? "#FF6B6B"
                                  : (budget.currentAmount / budget.amount) *
                                      100 >=
                                    80
                                  ? "#FFB946"
                                  : "#00D09E",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.progressLabelModern,
                              (budget.currentAmount / budget.amount) * 100 > 50
                                ? { color: "#FFF" }
                                : { color: "#222" },
                            ]}
                          >
                            {Math.round(
                              (budget.currentAmount / budget.amount) * 100
                            )}
                            %
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View
                      key="categories-container"
                      style={styles.categoriesContainer}
                    >
                      {budget.categories.map((category: Category) => (
                        <View
                          key={`${budget._id}-${category._id}`}
                          style={styles.categoryTag}
                        >
                          <Text
                            key={`${budget._id}-${category._id}-text`}
                            style={styles.categoryText}
                          >
                            {category.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Helper function to calculate points on the semi-circle
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
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
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  overviewCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    margin: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 0,
    marginTop: -8,
  },
  budgetListContainer: {
    padding: 12,
  },
  budgetListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginVertical: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyStateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  budgetCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  budgetDates: {
    fontSize: 11,
    color: "#666",
  },
  budgetStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusHealthy: {
    color: "#00D09E",
  },
  statusWarning: {
    color: "#FFB946",
  },
  statusExceeded: {
    color: "#FF6B6B",
  },
  budgetBody: {
    gap: 12,
  },
  budgetAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  amountItem: {
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
  exceededAmount: {
    color: "#FF6B6B",
  },
  negativeAmount: {
    color: "#FF6B6B",
  },
  positiveAmount: {
    color: "#00D09E",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingVertical: 0,
    marginBottom: -16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E8E8E8",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#666",
    width: 36,
    textAlign: "right",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  categoryTag: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  } as ViewStyle,
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
  },
  progressCircle: {
    position: "relative",
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  progressTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: "60%",
    left: "50%",
    transform: [{ translateX: -90 }, { translateY: -50 }],
    width: 180,
  },
  progressLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
    textAlign: "center",
  },
  progressAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 2,
    textAlign: "center",
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 6,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarModern: {
    width: "100%",
    height: 22,
    backgroundColor: "#E8E8E8",
    borderRadius: 11,
    overflow: "hidden",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  progressFillModern: {
    height: "100%",
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  progressLabelModern: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
  },
});

export default BudgetScreen;
