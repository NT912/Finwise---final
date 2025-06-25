import { StyleSheet } from "react-native";

const homeStyles = StyleSheet.create({
  // 🔄 Loading Spinner
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#00D09E",
  },

  listContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },

  // 🏠 Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  userName: {
    fontSize: 16,
    color: "gray",
    marginTop: 2,
  },

  // 💰 Balance Overview
  balanceCard: {
    backgroundColor: "#00D09E",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 20,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceLabel: {
    color: "white",
    fontSize: 14,
  },
  balanceAmount: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  expenseAmount: {
    color: "#FFD700",
    fontSize: 22,
    fontWeight: "bold",
  },
  progressBar: {
    alignSelf: "center",
    marginTop: 10,
  },

  // 🎯 Savings on Goals
  savingsCard: {
    backgroundColor: "#00D09E",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  savingsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  savingsGoalItem: {
    marginBottom: 15,
  },
  savingsTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  goalAmount: {
    fontSize: 14,
    color: "#555",
  },
  savingsProgressBar: {
    alignSelf: "center",
  },
  noGoalsText: {
    textAlign: "center",
    color: "gray",
    fontSize: 14,
  },

  // 📅 Filter Buttons
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    width: "100%",
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: "#00D09E",
    shadowColor: "#00D09E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    color: "#555555",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "white",
    fontWeight: "700",
  },
});

export default homeStyles;
