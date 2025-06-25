import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatVND } from "../../utils/formatters";
import { NavigationProp } from "@react-navigation/native";
import {
  HomeStackParamList,
  RootStackParamList,
} from "../../navigation/AppNavigator";
import { colors } from "../../theme";
import moment from "moment";
import { Transaction } from "../../types";

interface TransactionGroup {
  date: string;
  transactions: Transaction[];
}

interface TransactionListProps {
  transactions: Transaction[] | TransactionGroup[];
  title?: string;
  loading?: boolean;
  onRefresh?: () => void;
  navigation: any;
}

const EmptyTransactions = () => (
  <View style={styles.emptyContainer}>
    <Ionicons
      name="receipt-outline"
      size={40}
      color="#DDDDDD"
      style={{ marginBottom: 10 }}
    />
    <Text style={styles.emptyText}>No transactions found</Text>
    <Text style={styles.emptySubtext}>Your transactions will appear here</Text>
  </View>
);

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  title = "",
  loading = false,
  onRefresh,
  navigation,
}) => {
  // Get the Ionicons name based on category
  const getCategoryIcon = (
    category: string | { name: string; icon?: string }
  ) => {
    if (typeof category === "object" && category !== null && category.icon) {
      // If category is an object with icon property, use that icon with type assertion
      return category.icon as any;
    }

    // Default icons based on category name
    const categoryName =
      typeof category === "object" ? category.name : category;

    switch (categoryName.toLowerCase()) {
      case "salary":
      case "income":
        return "cash-outline";
      case "groceries":
      case "food":
      case "restaurant":
      case "dining":
        return "restaurant-outline";
      case "rent":
      case "housing":
      case "mortgage":
        return "home-outline";
      case "utilities":
      case "bills":
        return "flash-outline";
      case "transport":
      case "transportation":
      case "travel":
        return "car-outline";
      case "entertainment":
      case "leisure":
        return "film-outline";
      case "shopping":
      case "clothes":
        return "cart-outline";
      case "healthcare":
      case "medical":
        return "medkit-outline";
      case "education":
        return "school-outline";
      case "savings":
      case "investment":
        return "trending-up-outline";
      case "debt":
      case "loan":
        return "cash-outline";
      case "other":
      default:
        return "ellipsis-horizontal-outline";
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const isIncome = type.toLowerCase() === "income";
    return {
      text: isIncome ? formatVND(amount) : `-${formatVND(Math.abs(amount))}`,
      color: isIncome ? colors.primary : "#FF6B6B",
    };
  };

  const handleTransactionPress = (transaction: Transaction) => {
    // Read-only mode: No navigation to edit screen
    // Previously: navigation.navigate('EditTransaction', { transaction });
  };

  const getCategoryName = (
    category:
      | string
      | { name: string; _id: string; icon?: string; color?: string }
  ) => {
    if (typeof category === "object" && category !== null) {
      return category.name;
    }
    return category;
  };

  const getCategoryColor = (
    category:
      | string
      | { name: string; _id: string; icon?: string; color?: string },
    type: string
  ) => {
    // If category is an object with color, use that
    if (typeof category === "object" && category !== null && category.color) {
      return category.color;
    }

    // Otherwise use default colors based on transaction type
    return type.toLowerCase() === "income" ? colors.primary : "#FF6B6B";
  };

  const formatDate = (date: string | Date) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        dateObj.getFullYear() !== new Date().getFullYear()
          ? "numeric"
          : undefined,
    });
  };

  const renderTransaction = (transaction: Transaction, index: number) => {
    const isIncome = transaction.type === "income";
    const categoryColor = transaction.category?.color || "#007BFF";
    const iconName = transaction.category?.icon || "cash-outline";
    const formattedAmount = formatAmount(transaction.amount, transaction.type);

    return (
      <View key={transaction._id || index} style={styles.transactionItem}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: categoryColor + "20" },
          ]}
        >
          <Ionicons name={iconName as any} size={24} color={categoryColor} />
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.leftContent}>
            <Text style={styles.title} numberOfLines={1}>
              {transaction.description ||
                transaction.category?.name ||
                "Unknown"}
            </Text>
            <Text style={styles.date}>
              {moment(transaction.date).format("MMM DD, YYYY")}
            </Text>
          </View>
          <View style={styles.rightContent}>
            <Text style={[styles.amount, { color: formattedAmount.color }]}>
              {formattedAmount.text}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTransactionGroup = (group: TransactionGroup) => {
    return (
      <View key={group.date} style={styles.groupContainer}>
        <Text style={styles.dateHeader}>{group.date}</Text>
        {group.transactions.map(renderTransaction)}
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

  if (!transactions || transactions.length === 0) {
    return <EmptyTransactions />;
  }

  // Check if transactions is already grouped
  const isGrouped =
    transactions.length > 0 &&
    "date" in transactions[0] &&
    "transactions" in transactions[0];

  return (
    <View style={styles.container}>
      {isGrouped
        ? // Render grouped transactions
        (transactions as TransactionGroup[]).map(renderTransactionGroup)
        : // Render simple list without title
        (transactions as Transaction[]).map(renderTransaction)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    backgroundColor: "transparent",
  },
  detailsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: "flex-end",
  },
  editIconContainer: {
    marginLeft: 10,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#666666",
  },
  amount: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  type: {
    fontSize: 13,
    color: "#666666",
    textTransform: "capitalize",
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  groupContainer: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
});

export default TransactionList;
