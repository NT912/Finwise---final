import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatVND } from "../../utils/formatters";
import { colors } from "../../theme";

// Define icon name type
type IconName = keyof typeof Ionicons.glyphMap;

// Định nghĩa kiểu dữ liệu cho props
type BalanceOverviewProps = {
  totalBalance: number;
  totalExpense: number;
  monthlyBudget: number;
  budgetPercentage: number;
};

const BalanceOverview: React.FC<BalanceOverviewProps> = ({
  totalBalance,
  totalExpense,
  monthlyBudget,
  budgetPercentage,
}) => {
  // Dynamic message based on expense percentage
  const getStatusMessage = () => {
    if (budgetPercentage >= 100) {
      return "You've exceeded your monthly budget.";
    } else if (budgetPercentage >= 80) {
      return "You're approaching your monthly budget.";
    } else if (budgetPercentage >= 50) {
      return `${budgetPercentage.toFixed(0)}% of your budget spent.`;
    } else {
      return `${budgetPercentage.toFixed(0)}% of your budget, looks good.`;
    }
  };

  const getStatusIcon = () => {
    if (budgetPercentage >= 100) {
      return { name: "alert-circle-outline" as IconName, color: "#FF0000" };
    } else if (budgetPercentage >= 80) {
      return { name: "warning-outline" as IconName, color: "#FFA500" };
    } else {
      return { name: "checkmark-circle-outline" as IconName, color: "#00AA00" };
    }
  };

  const statusIcon = getStatusIcon();

  return (
    <View style={styles.container}>
      <View style={styles.balanceSection}>
        <View style={styles.balanceItem}>
          <View style={styles.balanceHeader}>
            <Ionicons name="wallet-outline" size={16} color="#000000" />
            <Text style={styles.balanceLabel}>Total Income</Text>
          </View>
          <Text style={styles.balanceAmount}>{formatVND(totalBalance)}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.balanceItem}>
          <View style={styles.balanceHeader}>
            <Ionicons name="trending-down-outline" size={16} color="#000000" />
            <Text style={styles.balanceLabel}>Total Expense</Text>
          </View>
          <Text style={styles.expenseAmount}>{formatVND(totalExpense)}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[styles.progressFill, { width: `${budgetPercentage}%` }]}
          >
            <Text style={styles.progressPercentage}>
              {budgetPercentage.toFixed(0)}%
            </Text>
          </View>
          <Text style={styles.progressAmountText}>
            {formatVND(monthlyBudget)}
          </Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Ionicons name={statusIcon.name} size={16} color={statusIcon.color} />
        <Text style={styles.statusText}>{getStatusMessage()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
    margin: 16,
    marginBottom: 18,
  },
  balanceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  balanceItem: {
    flex: 1,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#000000",
    marginLeft: 8,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0068FF",
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBackground: {
    height: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 5,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#A67C52",
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  progressRemaining: {
    height: "100%",
    justifyContent: "center",
    paddingLeft: 10,
  },
  progressPercentage: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
  progressAmountText: {
    position: "absolute",
    right: 12,
    top: 7,
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
  },
  remainingPercentage: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
  progressText: {
    fontSize: 12,
    color: "#000000",
    textAlign: "right",
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    color: "#000000",
    marginLeft: 5,
    opacity: 0.8,
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    marginHorizontal: 20,
  },
});

export default BalanceOverview;
