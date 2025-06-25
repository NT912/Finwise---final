import mongoose from "mongoose";
import Transaction from "../models/new-models/Transaction";
import Wallet from "../models/Wallet";
import Category from "../models/Category";
import { ApiError as AppError } from "../utils/ApiError";
import Budget from "../models/new-models/Budget";
console.log(
  "Budget model path:",
  require.resolve("../models/new-models/Budget")
);
// Create a simple logger since the import is missing
const logger = {
  info: (message: string, ...args: any[]) =>
    console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) =>
    console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(`[WARN] ${message}`, ...args),
  debug: (message: string, ...args: any[]) =>
    console.debug(`[DEBUG] ${message}`, ...args),
};

interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type?: "income" | "expense" | "transfer";
  categoryId?: string;
  walletId?: string;
  minAmount?: number;
  maxAmount?: number;
  searchText?: string;
  isRecurring?: boolean;
}

interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

interface PaginationOptions {
  page: number;
  limit: number;
}

// Helper function to group transactions by date
const groupTransactionsByDate = (transactions: any[]) => {
  const grouped = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date).toISOString().split("T")[0];

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(transaction);
    return acc;
  }, {});

  // Convert to array format
  return Object.keys(grouped)
    .map((date) => ({
      date,
      transactions: grouped[date],
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Get all transactions with filtering, sorting and pagination
export const getTransactions = async (
  userId: string,
  filters: TransactionFilters = {},
  sortOptions: SortOptions = { field: "date", direction: "desc" },
  paginationOptions: PaginationOptions = { page: 1, limit: 20 }
) => {
  try {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };

    // Apply filters
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    } else if (filters.startDate) {
      query.date = { $gte: new Date(filters.startDate) };
    } else if (filters.endDate) {
      query.date = { $lte: new Date(filters.endDate) };
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.categoryId) {
      query.category = new mongoose.Types.ObjectId(filters.categoryId);
    }

    if (filters.walletId) {
      query.walletId = new mongoose.Types.ObjectId(filters.walletId);
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      query.amount = {};
      if (filters.minAmount !== undefined) {
        query.amount.$gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        query.amount.$lte = filters.maxAmount;
      }
    }

    if (filters.searchText) {
      query.$text = { $search: filters.searchText };
    }

    if (filters.isRecurring !== undefined) {
      query.isRecurring = filters.isRecurring;
    }

    // Calculate pagination
    const skip = (paginationOptions.page - 1) * paginationOptions.limit;
    const limit = paginationOptions.limit;

    // Apply sorting
    const sortField = sortOptions.field || "date";
    const sortDirection = sortOptions.direction === "asc" ? 1 : -1;
    const sort: any = {};
    sort[sortField] = sortDirection;

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .populate("category", "name icon color")
      .populate("walletId", "name icon color balance currency")
      .populate("toWalletId", "name icon color balance currency")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Group transactions by date
    const groupedTransactions = groupTransactionsByDate(transactions);

    return {
      data: groupedTransactions,
      pagination: {
        total,
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        totalPages,
      },
    };
  } catch (error) {
    logger.error("Error getting transactions:", error);
    throw new AppError(500, "Failed to get transactions");
  }
};

// Get a single transaction by ID
export const getTransactionById = async (
  transactionId: string,
  userId: string
) => {
  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: new mongoose.Types.ObjectId(userId),
    })
      .populate("category", "name icon color")
      .populate("walletId", "name icon color balance currency")
      .populate("toWalletId", "name icon color balance currency")
      .lean();

    if (!transaction) {
      throw new AppError(404, "Transaction not found");
    }

    return transaction;
  } catch (error) {
    logger.error(`Error getting transaction ${transactionId}:`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "Failed to get transaction");
  }
};

// Create a new transaction
export const createTransaction = async (
  userId: string,
  transactionData: {
    amount: number;
    description: string;
    date: Date;
    type: "income" | "expense" | "transfer";
    category: string;
    walletId: string;
    toWalletId?: string;
    paymentMethod?: string;
    location?: string;
    tags?: string[];
    attachments?: string[];
    isRecurring?: boolean;
    recurringDetails?: {
      frequency: "daily" | "weekly" | "monthly" | "yearly";
      interval: number;
      endDate?: Date;
    };
  }
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate required fields
    if (
      !transactionData.amount ||
      !transactionData.description ||
      !transactionData.type ||
      !transactionData.category ||
      !transactionData.walletId
    ) {
      throw new AppError(400, "Missing required transaction fields");
    }

    // For transfer transactions, validate destination wallet
    if (transactionData.type === "transfer" && !transactionData.toWalletId) {
      throw new AppError(
        400,
        "Destination wallet is required for transfer transactions"
      );
    }

    // Get source wallet to update balance
    const sourceWallet = await Wallet.findOne({
      _id: transactionData.walletId,
      userId: new mongoose.Types.ObjectId(userId),
    }).session(session);

    if (!sourceWallet) {
      throw new AppError(404, "Source wallet not found");
    }

    // Get destination wallet for transfers
    let destWallet = null;
    if (transactionData.type === "transfer" && transactionData.toWalletId) {
      destWallet = await Wallet.findOne({
        _id: transactionData.toWalletId,
        userId: new mongoose.Types.ObjectId(userId),
      }).session(session);

      if (!destWallet) {
        throw new AppError(404, "Destination wallet not found");
      }
    }

    // Verify the category exists
    const category = await Category.findOne({
      _id: transactionData.category,
      userId: new mongoose.Types.ObjectId(userId),
    }).session(session);

    if (!category) {
      throw new AppError(404, "Category not found");
    }

    // Create new transaction
    const newTransaction = new Transaction({
      ...transactionData,
      userId: new mongoose.Types.ObjectId(userId),
      category: new mongoose.Types.ObjectId(transactionData.category),
      walletId: new mongoose.Types.ObjectId(transactionData.walletId),
      toWalletId: transactionData.toWalletId
        ? new mongoose.Types.ObjectId(transactionData.toWalletId)
        : undefined,
    });

    await newTransaction.save({ session });

    // Update wallet balances based on transaction type
    if (transactionData.type === "income") {
      sourceWallet.balance += transactionData.amount;
      await sourceWallet.save({ session });
    } else if (transactionData.type === "expense") {
      sourceWallet.balance -= transactionData.amount;
      await sourceWallet.save({ session });
    } else if (transactionData.type === "transfer") {
      sourceWallet.balance -= transactionData.amount;
      if (destWallet) {
        destWallet.balance += transactionData.amount;
        await sourceWallet.save({ session });
        await destWallet.save({ session });
      } else {
        await sourceWallet.save({ session });
        throw new AppError(404, "Destination wallet not found for transfer");
      }
    }

    await session.commitTransaction();

    // Populate the created transaction with references
    const populatedTransaction = await Transaction.findById(newTransaction._id)
      .populate("category", "name icon color")
      .populate("walletId", "name icon color balance currency")
      .populate("toWalletId", "name icon color balance currency");

    return populatedTransaction;
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error creating transaction:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "Failed to create transaction");
  } finally {
    session.endSession();
  }
};

// Update an existing transaction
export const updateTransaction = async (
  transactionId: string,
  userId: string,
  updates: any
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the transaction to update
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: new mongoose.Types.ObjectId(userId),
    }).session(session);

    if (!transaction) {
      throw new AppError(404, "Transaction not found");
    }

    // Get the original wallet and amount values before updating
    const originalType = transaction.type;
    const originalAmount = transaction.amount;
    const originalWalletId = transaction.walletId;
    const originalToWalletId = transaction.toWalletId;

    // If walletId is being updated, verify the new wallet exists
    let sourceWallet = null;
    if (updates.walletId && updates.walletId !== originalWalletId.toString()) {
      sourceWallet = await Wallet.findOne({
        _id: updates.walletId,
        userId: new mongoose.Types.ObjectId(userId),
      }).session(session);

      if (!sourceWallet) {
        throw new AppError(404, "Source wallet not found");
      }
    } else {
      sourceWallet = await Wallet.findById(originalWalletId).session(session);
    }

    // If category is being updated, verify the new category exists
    if (updates.category) {
      const category = await Category.findOne({
        _id: updates.category,
        userId: new mongoose.Types.ObjectId(userId),
      }).session(session);

      if (!category) {
        throw new AppError(404, "Category not found");
      }
    }

    // If toWalletId is being updated for a transfer, verify the destination wallet
    let destWallet = null;
    if (
      (originalType === "transfer" || updates.type === "transfer") &&
      (updates.toWalletId || originalToWalletId)
    ) {
      const toWalletId = updates.toWalletId || originalToWalletId;
      destWallet = await Wallet.findOne({
        _id: toWalletId,
        userId: new mongoose.Types.ObjectId(userId),
      }).session(session);

      if (
        !destWallet &&
        (originalType === "transfer" || updates.type === "transfer")
      ) {
        throw new AppError(404, "Destination wallet not found");
      }
    }

    // Revert the effects of the original transaction
    if (!sourceWallet) {
      throw new AppError(404, "Source wallet not found");
    }

    if (originalType === "income") {
      sourceWallet.balance -= originalAmount;
    } else if (originalType === "expense") {
      sourceWallet.balance += originalAmount;
    } else if (originalType === "transfer" && originalToWalletId) {
      sourceWallet.balance += originalAmount;
      const originalDestWallet = await Wallet.findById(
        originalToWalletId
      ).session(session);
      if (originalDestWallet) {
        originalDestWallet.balance -= originalAmount;
        await originalDestWallet.save({ session });
      }
    }

    // Update the transaction with new values
    const allowedUpdates = [
      "amount",
      "description",
      "date",
      "type",
      "category",
      "walletId",
      "toWalletId",
      "paymentMethod",
      "location",
      "tags",
      "attachments",
      "isRecurring",
      "recurringDetails",
    ];

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        if (key === "category" || key === "walletId" || key === "toWalletId") {
          transaction.set(key, new mongoose.Types.ObjectId(updates[key]));
        } else {
          transaction.set(key, updates[key]);
        }
      }
    });

    await transaction.save({ session });

    // Apply the effects of the updated transaction
    const updatedType = updates.type || originalType;
    const updatedAmount = updates.amount || originalAmount;

    if (updatedType === "income") {
      sourceWallet.balance += updatedAmount;
    } else if (updatedType === "expense") {
      sourceWallet.balance -= updatedAmount;
    } else if (updatedType === "transfer") {
      sourceWallet.balance -= updatedAmount;

      const updatedToWalletId = updates.toWalletId || originalToWalletId;
      const updatedDestWallet =
        destWallet ||
        (await Wallet.findById(updatedToWalletId).session(session));

      if (updatedDestWallet) {
        updatedDestWallet.balance += updatedAmount;
        await updatedDestWallet.save({ session });
      }
    }

    await sourceWallet.save({ session });
    await session.commitTransaction();

    // Return the updated transaction with populated references
    const updatedTransaction = await Transaction.findById(transactionId)
      .populate("category", "name icon color")
      .populate("walletId", "name icon color balance currency")
      .populate("toWalletId", "name icon color balance currency");

    return updatedTransaction;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error updating transaction ${transactionId}:`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "Failed to update transaction");
  } finally {
    session.endSession();
  }
};

// Delete a transaction
export const deleteTransaction = async (
  transactionId: string,
  userId: string
) => {
  console.log(
    ">>> [DEBUG] Đã gọi vào deleteTransaction với transactionId:",
    transactionId,
    "userId:",
    userId
  );
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the transaction to delete
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: new mongoose.Types.ObjectId(userId),
    }).session(session);

    if (!transaction) {
      throw new AppError(404, "Transaction not found");
    }

    // Revert the effects of the transaction on wallet balances
    const sourceWallet = await Wallet.findById(transaction.walletId).session(
      session
    );

    if (sourceWallet) {
      if (transaction.type === "income") {
        sourceWallet.balance -= transaction.amount;
      } else if (transaction.type === "expense") {
        sourceWallet.balance += transaction.amount;
      } else if (transaction.type === "transfer" && transaction.toWalletId) {
        sourceWallet.balance += transaction.amount;

        const destWallet = await Wallet.findById(
          transaction.toWalletId
        ).session(session);
        if (destWallet) {
          destWallet.balance -= transaction.amount;
          await destWallet.save({ session });
        }
      }

      await sourceWallet.save({ session });
    }

    // Delete the transaction
    await Transaction.findByIdAndDelete(transactionId).session(session);

    // Cập nhật lại số liệu budget
    await recalculateBudgetsForUser(userId);

    await session.commitTransaction();
    return { success: true, message: "Transaction deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error deleting transaction ${transactionId}:`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "Failed to delete transaction");
  } finally {
    session.endSession();
  }
};

// Get transaction statistics
export const getTransactionStats = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  walletId?: string
) => {
  try {
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (walletId) {
      query.walletId = new mongoose.Types.ObjectId(walletId);
    }

    // Get all transactions for the period
    const transactions = await Transaction.find(query)
      .populate("category", "name icon color")
      .lean();

    // Calculate income, expense, and balance
    let totalIncome = 0;
    let totalExpense = 0;

    const incomeTransactions = transactions.filter((t) => t.type === "income");
    const expenseTransactions = transactions.filter(
      (t) => t.type === "expense"
    );

    incomeTransactions.forEach((t) => {
      totalIncome += t.amount;
    });

    expenseTransactions.forEach((t) => {
      totalExpense += t.amount;
    });

    const netBalance = totalIncome - totalExpense;

    // Group by category
    const categoryStats = await getCategoryStats(
      expenseTransactions,
      "expense"
    );
    const incomeCategoryStats = await getCategoryStats(
      incomeTransactions,
      "income"
    );

    // Daily stats
    const dailyStats = await getDailyTransactionStats(
      transactions,
      startDate,
      endDate
    );

    return {
      totalIncome,
      totalExpense,
      netBalance,
      categoryStats,
      incomeCategoryStats,
      dailyStats,
    };
  } catch (error) {
    logger.error("Error getting transaction statistics:", error);
    throw new AppError(500, "Failed to get transaction statistics");
  }
};

// Helper function to get category statistics
const getCategoryStats = async (
  transactions: any[],
  type: "income" | "expense"
) => {
  const categoryMap = new Map();

  transactions.forEach((transaction) => {
    const categoryId = transaction.category._id.toString();
    const categoryName = transaction.category.name;
    const categoryIcon = transaction.category.icon;
    const categoryColor = transaction.category.color;
    const amount = transaction.amount;

    if (categoryMap.has(categoryId)) {
      const category = categoryMap.get(categoryId);
      category.amount += amount;
      category.count += 1;
    } else {
      categoryMap.set(categoryId, {
        _id: categoryId,
        name: categoryName,
        icon: categoryIcon,
        color: categoryColor,
        amount,
        count: 1,
        type,
      });
    }
  });

  // Convert map to array and sort by amount
  const categoryStats = Array.from(categoryMap.values()).sort(
    (a, b) => b.amount - a.amount
  );

  // Calculate percentages
  const total = categoryStats.reduce(
    (sum, category) => sum + category.amount,
    0
  );

  categoryStats.forEach((category) => {
    category.percentage = total > 0 ? (category.amount / total) * 100 : 0;
  });

  return categoryStats;
};

// Helper function to get daily transaction statistics
const getDailyTransactionStats = async (
  transactions: any[],
  startDate: Date,
  endDate: Date
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dailyData: any = {};

  // Initialize daily data with zero values
  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    const dateStr = day.toISOString().split("T")[0];
    dailyData[dateStr] = {
      date: dateStr,
      income: 0,
      expense: 0,
      balance: 0,
    };
  }

  // Populate with actual transaction data
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date).toISOString().split("T")[0];

    if (dailyData[date]) {
      if (transaction.type === "income") {
        dailyData[date].income += transaction.amount;
      } else if (transaction.type === "expense") {
        dailyData[date].expense += transaction.amount;
      }

      dailyData[date].balance =
        dailyData[date].income - dailyData[date].expense;
    }
  });

  // Convert to array and sort by date
  return Object.values(dailyData).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

// Get transactions by category
export const getTransactionsByCategory = async (
  userId: string,
  categoryId: string,
  startDate?: Date,
  endDate?: Date,
  paginationOptions: PaginationOptions = { page: 1, limit: 20 }
) => {
  try {
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
      category: new mongoose.Types.ObjectId(categoryId),
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Calculate pagination
    const skip = (paginationOptions.page - 1) * paginationOptions.limit;
    const limit = paginationOptions.limit;

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .populate("category", "name icon color")
      .populate("walletId", "name icon color balance currency")
      .populate("toWalletId", "name icon color balance currency")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Group transactions by date
    const groupedTransactions = groupTransactionsByDate(transactions);

    return {
      data: groupedTransactions,
      pagination: {
        total,
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        totalPages,
      },
    };
  } catch (error) {
    logger.error(
      `Error getting transactions for category ${categoryId}:`,
      error
    );
    throw new AppError(500, "Failed to get transactions by category");
  }
};

export const recalculateBudgetsForUser = async (userId: string) => {
  console.log("[DEBUG] Gọi recalculateBudgetsForUser cho user:", userId);
  const budgets = await Budget.find({ userId });
  console.log(
    "Recalculating budgets for user:",
    userId,
    "Total budgets:",
    budgets.length
  );

  for (const budget of budgets) {
    console.log("Budget categories:", budget.categories);
    const filter = {
      userId: new mongoose.Types.ObjectId(userId),
      walletId: new mongoose.Types.ObjectId(budget.walletId),
      date: { $gte: budget.startDate, $lte: budget.endDate },
      type: "expense",
      category: {
        $in: budget.categories.map((cat) => new mongoose.Types.ObjectId(cat)),
      },
    };
    console.log("Transaction filter:", filter);

    const totalSpent = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const spent = totalSpent[0]?.total || 0;
    console.log("Budget:", budget._id, "Spent:", spent);

    budget.currentAmount = spent;
    await budget.save();
  }
};
