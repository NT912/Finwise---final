import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const ChartsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Financial Charts</Text>

      {/* Biểu đồ đường: Xu hướng chi tiêu */}
      <Text style={styles.chartTitle}>Spending Trends</Text>
      <LineChart
        data={{
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [{ data: [500, 700, 400, 600, 800, 650] }],
        }}
        width={screenWidth - 20}
        height={220}
        yAxisLabel="$"
        yAxisSuffix="" // ✅ Fix lỗi này nếu cần
        chartConfig={chartConfig}
        bezier
      />

      {/* Biểu đồ cột: Thu nhập & Chi tiêu hàng tháng */}
      <Text style={styles.chartTitle}>Income & Expenses</Text>
      <BarChart
        data={{
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            { data: [2000, 2500, 2200, 2700, 2900, 3100] }, // Thu nhập
            { data: [1200, 1500, 1400, 1600, 1800, 2000] }, // Chi tiêu
          ],
        }}
        width={screenWidth - 20}
        height={220}
        yAxisLabel="$"
        yAxisSuffix="" // ✅ Fix lỗi
        chartConfig={chartConfig}
        fromZero
        showBarTops
      />

      {/* Biểu đồ tròn: Phân bổ chi tiêu */}
      <Text style={styles.chartTitle}>Expense Distribution</Text>
      <PieChart
        data={[
          {
            name: "Food",
            amount: 600,
            color: "#ff6384",
            legendFontColor: "#000",
            legendFontSize: 14,
          },
          {
            name: "Transport",
            amount: 300,
            color: "#36a2eb",
            legendFontColor: "#000",
            legendFontSize: 14,
          },
          {
            name: "Rent",
            amount: 800,
            color: "#ffce56",
            legendFontColor: "#000",
            legendFontSize: 14,
          },
        ]}
        width={screenWidth - 20}
        height={220}
        chartConfig={chartConfig}
        accessor={"amount"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
      />
    </SafeAreaView>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 200, 151, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#00D09E" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
});

export default ChartsScreen;
