import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import Transaction from "../../models/new-models/Transaction";
import mongoose from "mongoose";
import { FilterQuery } from "mongoose";
import Budget from "../../models/new-models/Budget";

// Dữ liệu mẫu cho các giao dịch
const sampleTransactions = [
  {
    id: "trans-001",
    amount: 100000,
    title: "Tiền nước",
    description: "Hóa đơn tiền nước tháng 4",
    date: new Date("2025-04-18T12:00:00"),
    type: "expense",
    category: "Bills",
    categoryIcon: "water-outline",
    categoryColor: "#2196F3",
    icon: "water-outline",
    color: "#2196F3",
    walletId: "wallet-001",
    walletName: "Tiền mặt",
    location: "Nhà",
    paymentMethod: "Cash",
    tags: ["Hóa đơn", "Tiện ích"],
    attachments: [],
    isRecurring: false,
    recurringDetails: null,
    createdAt: new Date("2025-04-18T12:30:00"),
    updatedAt: new Date("2025-04-18T12:30:00"),
  },
  {
    id: "trans-002",
    amount: 200000,
    title: "Lương",
    description: "Lương tháng 4/2025",
    date: new Date("2025-04-18T09:00:00"),
    type: "income",
    category: "Salary",
    categoryIcon: "cash-outline",
    categoryColor: "#4CAF50",
    icon: "cash-outline",
    color: "#4CAF50",
    walletId: "wallet-001",
    walletName: "Tiền mặt",
    paymentMethod: "Bank Transfer",
    tags: ["Lương", "Thu nhập"],
    attachments: [],
    isRecurring: true,
    recurringDetails: {
      frequency: "monthly",
      interval: 1,
      endDate: new Date("2026-04-18"),
    },
    createdAt: new Date("2025-04-18T09:15:00"),
    updatedAt: new Date("2025-04-18T09:15:00"),
  },
  {
    id: "trans-003",
    amount: 7000000,
    description: "Lương tháng 11",
    date: new Date("2023-11-10T00:00:00"),
    type: "income",
    category: "Salary",
    categoryIcon: "wallet",
    categoryColor: "#F44336",
    walletId: "wallet-003",
    walletName: "Tài khoản ngân hàng",
    paymentMethod: "Bank Transfer",
    tags: ["Lương"],
    attachments: [],
    isRecurring: true,
    recurringDetails: {
      frequency: "monthly",
      interval: 1,
      endDate: new Date("2024-11-10"),
    },
    createdAt: new Date("2023-11-10T10:00:00"),
    updatedAt: new Date("2023-11-10T10:00:00"),
  },
  {
    id: "trans-004",
    amount: 1500000,
    description: "Chuyển tiền từ ví tiền mặt sang tài khoản ngân hàng",
    date: new Date("2023-11-12T14:00:00"),
    type: "transfer",
    category: "Transfer",
    categoryIcon: "swap",
    categoryColor: "#9C27B0",
    walletId: "wallet-001",
    walletName: "Tiền mặt",
    toWalletId: "wallet-003",
    toWalletName: "Tài khoản ngân hàng",
    tags: ["Chuyển khoản"],
    attachments: [],
    isRecurring: false,
    recurringDetails: null,
    createdAt: new Date("2023-11-12T14:15:00"),
    updatedAt: new Date("2023-11-12T14:15:00"),
  },
  {
    id: "trans-005",
    amount: 300000,
    description: "Mua đồ ăn tại siêu thị",
    date: new Date("2023-11-13T18:00:00"),
    type: "expense",
    category: "Groceries",
    categoryIcon: "cart",
    categoryColor: "#8BC34A",
    walletId: "wallet-001",
    walletName: "Tiền mặt",
    location: "Siêu thị XYZ",
    paymentMethod: "Cash",
    tags: ["Mua sắm", "Thực phẩm"],
    attachments: [],
    isRecurring: false,
    recurringDetails: null,
    createdAt: new Date("2023-11-13T18:30:00"),
    updatedAt: new Date("2023-11-13T18:30:00"),
  },
];

/**
 * Lấy danh sách giao dịch
 */
export const getTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Extract query parameters with defaults
    const {
      startDate,
      endDate,
      type,
      category,
      walletId,
      page = "1",
      limit = "10",
    } = req.query as Record<string, string>;

    // Initialize query filter with userId
    const filter: FilterQuery<any> = { userId };

    // Add date range filter if provided
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Add type filter if provided
    if (type) {
      filter.type = type;
    }

    // Add category filter if provided
    if (category) {
      filter.category = category;
    }

    // Add wallet filter if provided
    if (walletId) {
      filter.walletId = walletId;
    }

    // Parse pagination parameters
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Query transactions with pagination
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate({
        path: "category",
        select: "name icon color",
      })
      .populate({
        path: "walletId",
        select: "name icon color balance currency",
      });

    // Get total count for pagination
    const total = await Transaction.countDocuments(filter);

    // Send paginated response
    res.json({
      transactions,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      message: "Error fetching transactions",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Lấy giao dịch theo ID
 */
export const getTransactionById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid transaction ID" });
      return;
    }

    const transaction = await Transaction.findOne({
      _id: id,
      userId,
    });

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({
      message: "Error fetching transaction",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Tạo giao dịch mới
 */
export const createTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { amount, description, type, category, walletId, date } = req.body;

    // Validate required fields
    if (!amount || !type || !category || !walletId) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Create transaction
    const newTransaction = new Transaction({
      userId,
      amount,
      description,
      type,
      category,
      walletId,
      date: date || new Date(),
      ...req.body, // Include any other optional fields
    });

    await newTransaction.save();

    // Đồng bộ với budget nếu là expense
    if (type === "expense") {
      await Budget.updateMany(
        {
          userId,
          categories: category,
          walletId,
          status: "active",
          startDate: { $lte: date || new Date() },
          endDate: { $gte: date || new Date() },
        },
        { $inc: { currentAmount: amount } }
      );
    }

    // Fetch the transaction with populated fields
    const populatedTransaction = await Transaction.findById(newTransaction._id)
      .populate({
        path: "category",
        select: "name icon color",
      })
      .populate({
        path: "walletId",
        select: "name icon color balance currency",
      });

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: populatedTransaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({
      message: "Error creating transaction",
      error: (error as Error).message,
    });
  }
};

/**
 * Cập nhật một giao dịch
 */
export const updateTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    // Validate transaction ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid transaction ID" });
      return;
    }

    // Find the transaction to update
    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    // Update transaction fields from request body
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        transaction[key] = req.body[key];
      }
    });

    // Save the updated transaction
    await transaction.save();

    // Return the updated transaction with populated fields
    const updatedTransaction = await Transaction.findById(id)
      .populate({
        path: "category",
        select: "name icon color",
      })
      .populate({
        path: "walletId",
        select: "name icon color balance currency",
      });

    res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({
      message: "Error updating transaction",
      error: (error as Error).message,
    });
  }
};

/**
 * Xóa một giao dịch
 */
export const deleteTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const id = req.params.id;

    // Validate transaction ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid transaction ID format" });
      return;
    }

    // Find and delete transaction
    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deletedTransaction) {
      res
        .status(404)
        .json({ message: "Transaction not found or not authorized to delete" });
      return;
    }

    res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({
      message: "Error deleting transaction",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Lấy thống kê chi tiêu
 */
export const getTransactionStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { period = "monthly" } = req.query;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Xác định khoảng thời gian dựa vào period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "weekly":
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "yearly":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
        startDate = new Date(0); // Bắt đầu từ timestamp 0 (1970-01-01)
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Mặc định là monthly
    }

    // Tính tổng thu nhập, chi tiêu và số dư
    const [incomeResult, expenseResult] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: "income",
            date: { $gte: startDate, $lte: now },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: "expense",
            date: { $gte: startDate, $lte: now },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
    const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;
    const balance = totalIncome - totalExpense;

    // Phân tích chi tiêu theo danh mục
    const categoryStats = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
      {
        $project: {
          _id: 1,
          total: 1,
          count: 1,
          name: "$categoryDetails.name",
          icon: "$categoryDetails.icon",
          color: "$categoryDetails.color",
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    res.json({
      period,
      totalIncome,
      totalExpense,
      balance,
      categories: categoryStats,
      timeRange: {
        start: startDate,
        end: now,
      },
    });
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    res.status(500).json({
      message: "Error fetching transaction statistics",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Lấy giao dịch theo khoảng thời gian
 */
export const getTransactionsByDateRange = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { startDate, endDate, walletId } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ message: "Start date and end date are required" });
      return;
    }

    // Validate date format
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    // Build query filter
    const filter: any = {
      userId,
      date: {
        $gte: start,
        $lte: end,
      },
    };

    // Add wallet filter if provided
    if (walletId) {
      filter.walletId = walletId;
    }

    console.log("Filter for transactions:", filter);

    // Get transactions for the date range
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .populate({
        path: "category",
        select: "name icon color",
      })
      .populate({
        path: "walletId",
        select: "name icon color balance currency",
      });

    // Group transactions by date
    const groupedTransactions = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date).toISOString().split("T")[0];

      if (!groupedTransactions[date]) {
        groupedTransactions[date] = [];
      }

      groupedTransactions[date].push(transaction);
    });

    res.json({
      startDate: start,
      endDate: end,
      transactions: groupedTransactions,
    });
  } catch (error) {
    console.error("Error fetching transactions by date range:", error);
    res.status(500).json({
      message: "Error fetching transactions by date range",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Lấy báo cáo chi tiết hàng tháng cho màn hình báo cáo
 */
export const getMonthlyReport = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("[getMonthlyReport] API called");
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { period = "monthly", walletId } = req.query;
    console.log(
      `[getMonthlyReport] Generating report for period: ${period}, walletId: ${walletId}`
    );

    // Xác định khoảng thời gian dựa vào period
    const now = new Date();
    let startDate = new Date();
    let dateFormat: string;
    let groupByFormat: string;
    let numberOfPeriods: number = 6; // Mặc định số lượng khoảng thời gian hiển thị

    switch (period) {
      case "weekly": {
        // Lấy ngày đầu tuần (thứ 2) và cuối tuần (chủ nhật) của tuần hiện tại
        const dayOfWeek = now.getDay(); // 0 (CN) -> 6 (T7)
        // Tính offset để ra thứ 2
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate = new Date(now);
        startDate.setDate(now.getDate() + diffToMonday);
        startDate.setHours(0, 0, 0, 0);
        // Ngày cuối tuần (chủ nhật)
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        dateFormat = "%Y-%m-%d";
        groupByFormat = "$dateStr";
        numberOfPeriods = 7;
        // Ghi đè biến now để dùng cho filter và periodsData
        now.setTime(endDate.getTime());
        break;
      }
      case "monthly":
        // Lấy 6 tháng gần nhất
        startDate.setMonth(now.getMonth() - 5);
        startDate.setDate(1); // Ngày đầu tiên của tháng
        dateFormat = "%Y-%m";
        groupByFormat = "$monthYear";
        numberOfPeriods = 6;
        break;
      case "yearly":
        // Lấy 5 năm gần nhất
        startDate.setFullYear(now.getFullYear() - 4);
        startDate.setMonth(0, 1); // Ngày 1 tháng 1
        dateFormat = "%Y";
        groupByFormat = "$year";
        numberOfPeriods = 5;
        break;
      default:
        // Mặc định là monthly
        startDate.setMonth(now.getMonth() - 5);
        startDate.setDate(1);
        dateFormat = "%Y-%m";
        groupByFormat = "$monthYear";
        numberOfPeriods = 6;
    }

    // Set start date to beginning of day
    startDate.setHours(0, 0, 0, 0);
    console.log(
      `[getMonthlyReport] Date range: ${startDate.toISOString()} to ${now.toISOString()}`
    );

    // Build filter
    const matchFilter: any = {
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: now },
    };

    // Add wallet filter if provided
    if (walletId && walletId !== "all") {
      matchFilter.walletId = new mongoose.Types.ObjectId(walletId as string);
    }
    console.log(
      `[getMonthlyReport] Match filter:`,
      JSON.stringify(matchFilter, null, 2)
    );

    // Tạo các pipeline aggregation tổng hợp
    const pipeline = [
      { $match: matchFilter },
      {
        $addFields: {
          dateStr: { $dateToString: { format: dateFormat, date: "$date" } },
          monthYear: {
            $dateToString: {
              format: "%m-%Y",
              date: "$date",
            },
          },
          year: {
            $dateToString: {
              format: "%Y",
              date: "$date",
            },
          },
        },
      },
      {
        $group: {
          _id: {
            period: groupByFormat,
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.period": 1 }, // Sắp xếp tăng dần theo thời gian
      },
    ] as any[];

    // Aggregation cho phân tích danh mục chi tiêu và thu nhập
    const categoryPipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: {
            category: "$category",
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
      {
        $project: {
          _id: 0,
          categoryId: "$_id.category",
          type: "$_id.type",
          total: 1,
          count: 1,
          name: "$categoryDetails.name",
          icon: "$categoryDetails.icon",
          color: "$categoryDetails.color",
        },
      },
      {
        $sort: { total: -1 },
      },
    ] as any[];

    // Thêm index cho các trường thường xuyên query
    await Transaction.collection.createIndex({ userId: 1, date: 1 });
    await Transaction.collection.createIndex({ userId: 1, type: 1 });
    await Transaction.collection.createIndex({ userId: 1, category: 1 });

    const startTime = Date.now();
    // Thực hiện các aggregation với timeout
    const aggStart = Date.now();
    const [periodResults, categoryResults] = await Promise.all([
      Transaction.aggregate(pipeline, { allowDiskUse: true }),
      Transaction.aggregate(categoryPipeline, { allowDiskUse: true }),
    ]);
    const aggEnd = Date.now();
    console.log(`[getMonthlyReport] Aggregation time: ${aggEnd - aggStart}ms`);

    console.log(
      `[getMonthlyReport] Period results:`,
      JSON.stringify(periodResults, null, 2)
    );
    console.log(
      `[getMonthlyReport] Category results:`,
      JSON.stringify(categoryResults, null, 2)
    );

    // Xử lý dữ liệu theo khoảng thời gian để đảm bảo có đủ data cho biểu đồ
    const periodsData: {
      [key: string]: { income: number; expense: number; balance: number };
    } = {};

    // Tạo các khoảng thời gian trống trước
    if (period === "weekly") {
      // Tạo mảng 7 ngày trong tuần hiện tại (thứ 2 -> CN)
      for (let i = 0; i < numberOfPeriods; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toISOString().split("T")[0];
        periodsData[dateStr] = { income: 0, expense: 0, balance: 0 };
      }
    } else if (period === "monthly") {
      // Tạo mảng 6 tháng gần nhất
      for (let i = 0; i < numberOfPeriods; i++) {
        const date = new Date();
        date.setMonth(now.getMonth() - (numberOfPeriods - 1 - i));
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        const monthStr = date.toISOString().split("T")[0].substring(0, 7);
        periodsData[monthStr] = { income: 0, expense: 0, balance: 0 };
      }
    } else if (period === "yearly") {
      // Tạo mảng 5 năm gần nhất
      for (let i = 0; i < numberOfPeriods; i++) {
        const year = now.getFullYear() - (numberOfPeriods - 1 - i);
        periodsData[year.toString()] = { income: 0, expense: 0, balance: 0 };
      }
    }

    console.log(
      `[getMonthlyReport] Initial periods data:`,
      JSON.stringify(periodsData, null, 2)
    );

    // Điền dữ liệu từ kết quả aggregation
    periodResults.forEach((item) => {
      const periodKey = item._id.period;
      const type = item._id.type;

      // Đảm bảo có khóa trong object
      if (!periodsData[periodKey]) {
        periodsData[periodKey] = { income: 0, expense: 0, balance: 0 };
      }

      // Cập nhật dữ liệu
      if (type === "income") {
        periodsData[periodKey].income = item.total;
      } else if (type === "expense") {
        periodsData[periodKey].expense = item.total;
      }

      // Tính balance
      periodsData[periodKey].balance =
        periodsData[periodKey].income - periodsData[periodKey].expense;
    });

    console.log(
      `[getMonthlyReport] Final periods data:`,
      JSON.stringify(periodsData, null, 2)
    );

    // Phân loại danh mục theo loại
    const categories: {
      income: Array<{
        categoryId: string;
        type: string;
        total: number;
        count: number;
        name: string;
        icon: string;
        color: string;
      }>;
      expense: Array<{
        categoryId: string;
        type: string;
        total: number;
        count: number;
        name: string;
        icon: string;
        color: string;
      }>;
    } = {
      income: categoryResults.filter((c) => c.type === "income"),
      expense: categoryResults.filter((c) => c.type === "expense"),
    };

    // Tính tổng thu nhập và chi tiêu
    let totalIncome = 0;
    let totalExpense = 0;

    Object.values(periodsData).forEach((data) => {
      totalIncome += data.income;
      totalExpense += data.expense;
    });

    const balance = totalIncome - totalExpense;

    // Tạo format hiển thị cho nhãn thời gian
    const formattedPeriods: Array<{
      key: string;
      label: string;
      income: number;
      expense: number;
      balance: number;
    }> = Object.keys(periodsData).map((key) => {
      let label: string;

      if (period === "weekly") {
        // Hiển thị tên thứ trong tuần
        const date = new Date(key);
        label = date.toLocaleDateString("en-US", { weekday: "short" });
      } else if (period === "monthly") {
        // Hiển thị tên tháng
        const [year, month] = key.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        label = date.toLocaleDateString("en-US", { month: "short" });
      } else {
        // Hiển thị năm
        label = key;
      }

      return {
        key,
        label,
        ...periodsData[key],
      };
    });

    res.json({
      period,
      totalIncome,
      totalExpense,
      balance,
      categories,
      periods: formattedPeriods,
    });
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    res.status(500).json({
      message: "Error fetching monthly report",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
