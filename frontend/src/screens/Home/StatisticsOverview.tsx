import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { formatVND } from "../../utils/formatters";
import { colors } from "../../theme";

type StatisticsOverviewProps = {
  savingsOnGoals?: number;
  revenueLostWeek?: number;
  expenseLastWeek?: number;
  isLoading?: boolean;
  goalPercentage?: number;
};

const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({
  savingsOnGoals = 0,
  revenueLostWeek = 0,
  expenseLastWeek = 0,
  isLoading = false,
  goalPercentage = 0,
}) => {
  // Circular progress calculations
  const size = 50;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(goalPercentage, 0), 100) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  // Determine if we should show the progress circle
  const shouldShowProgress = !isLoading && goalPercentage > 0;

  return (
    <View style={styles.container}>
      <View style={styles.statisticsCard}>
        <View style={styles.leftSection}>
          <View style={styles.circularProgressContainer}>
            {shouldShowProgress && (
              <Svg width={size} height={size} style={styles.circularProgress}>
                {/* Background Circle */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(0, 0, 0, 0.1)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Progress Circle */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#000000"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  transform={`rotate(-90, ${size / 2}, ${size / 2})`}
                />
              </Svg>
            )}
            <View style={styles.iconContainer}>
              <Ionicons name="save-outline" size={24} color="#000000" />
            </View>
          </View>
          <Text style={styles.label}>Savings</Text>
          <Text style={styles.sublabel}>On Goals</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={styles.savingsAmount}>
              {formatVND(savingsOnGoals)}
            </Text>
          )}
          {shouldShowProgress && (
            <Text style={styles.percentageText}>
              {Math.round(goalPercentage)}% achieved
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.rightSection}>
          <View style={styles.statisticsItem}>
            <View style={styles.itemIconContainer}>
              <Ionicons name="cash-outline" size={24} color="#000000" />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemLabel}>Revenue Last Week</Text>
              {isLoading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text style={styles.amount}>{formatVND(revenueLostWeek)}</Text>
              )}
            </View>
          </View>

          <View style={styles.horizontalDivider} />

          <View style={styles.statisticsItem}>
            <View style={styles.itemIconContainer}>
              <Ionicons
                name="trending-down-outline"
                size={24}
                color="#000000"
              />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemLabel}>Expense Last Week</Text>
              {isLoading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text style={styles.expenseAmount}>
                  -{formatVND(expenseLastWeek)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  statisticsCard: {
    backgroundColor: colors.primary,
    padding: 5,
    borderRadius: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  leftSection: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  rightSection: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "center",
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 4,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 6,
  },
  circularProgressContainer: {
    width: 50,
    height: 50,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  circularProgress: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  label: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "700",
    textAlign: "center",
  },
  sublabel: {
    fontSize: 10,
    color: "#000000",
    opacity: 0.8,
    textAlign: "center",
  },
  savingsAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginVertical: 4,
  },
  percentageText: {
    fontSize: 12,
    color: "#000000",
    marginTop: 2,
    opacity: 0.7,
  },
  statisticsItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 12,
    color: "#000000",
    opacity: 0.7,
    marginBottom: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
    opacity: 0.9,
  },
});

export default StatisticsOverview;
