import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatVND } from "../utils/formatters";

interface BalanceOverviewProps {
  totalBalance: number;
  totalExpense: number;
  expensePercentage: number;
}

const BalanceOverview: React.FC<BalanceOverviewProps> = ({
  totalBalance = 0,
  totalExpense = 0,
  expensePercentage = 0,
}) => {
  // Ensure all values are numbers
  const safeTotalBalance = Number(totalBalance) || 0;
  const safeTotalExpense = Number(totalExpense) || 0;
  const safeExpensePercentage = Number(expensePercentage) || 0;

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>
            <Ionicons name="wallet-outline" size={14} color="#444" /> Total
            Income
          </Text>
          <Text style={styles.balanceValue}>{formatVND(safeTotalBalance)}</Text>
        </View>

        <View style={styles.balanceDivider} />

        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>
            <Ionicons name="trending-down-outline" size={14} color="#444" />{" "}
            Total Expense
          </Text>
          <Text style={[styles.balanceValue, { color: "#e74c3c" }]}>
            {formatVND(safeTotalExpense)}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${safeExpensePercentage}%` },
            ]}
          />
        </View>
      </View>

      <Text style={[styles.budgetInfoText, { textAlign: "left" }]}>
        <Ionicons name="information-circle-outline" size={14} color="#00D09E" />{" "}
        {safeExpensePercentage}% Of Your Income
        {safeExpensePercentage < 50
          ? ", Looks Good!"
          : safeExpensePercentage < 80
            ? ", Be Careful!"
            : ", Too High!"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    margin: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  balanceItem: {
    flex: 1,
  },
  balanceDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 15,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00D09E",
  },
  progressLabels: {
    flexDirection: "row",
    marginTop: 5,
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
  },
  budgetInfoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default BalanceOverview;
