import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import Budget from "../../models/new-models/Budget";

/**
 * Lấy danh sách ngân sách
 * Money Lover tính năng:
 * - Lọc ngân sách theo trạng thái (đang diễn ra, đã hoàn thành, v.v.)
 * - Lọc theo loại (theo tháng, tùy chỉnh)
 * - Lọc theo thời gian
 */
export const getBudgets = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Lọc ngân sách
    const { status, isRecurring, walletId, startDate, endDate } = req.query;

    // Xây dựng query filter
    const filter: any = { userId };

    // Lọc theo trạng thái
    if (status) {
      filter.status = status;
    }

    // Lọc theo loại (định kỳ hoặc một lần)
    if (isRecurring !== undefined) {
      filter.isRecurring = isRecurring === "true";
    }

    // Lọc theo ví
    if (walletId && walletId !== "all") {
      filter.walletId = walletId;
    }

    // Lọc theo ngày bắt đầu
    if (startDate) {
      filter.startDate = { $gte: new Date(startDate as string) };
    }

    // Lọc theo ngày kết thúc
    if (endDate) {
      filter.endDate = { $lte: new Date(endDate as string) };
    }

    // Lấy danh sách ngân sách từ database
    const budgets = await Budget.find(filter)
      .populate("categories", "name icon color")
      .sort({ createdAt: -1 });

    // Tính toán số liệu tổng hợp
    const totalBudgeted = budgets.reduce(
      (sum, budget) => sum + budget.amount,
      0
    );
    const totalSpent = budgets.reduce(
      (sum, budget) => sum + budget.currentAmount,
      0
    );
    const averageUsagePercentage =
      totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

    // Phân loại theo trạng thái
    const budgetsSummary = {
      totalBudgeted,
      totalSpent,
      averageUsagePercentage,
      totalBudgets: budgets.length,
      inProgressBudgets: budgets.filter((b) => b.status === "active").length,
      completedBudgets: budgets.filter((b) => b.status === "completed").length,
      exceededBudgets: budgets.filter((b) => b.currentAmount > b.amount).length,
    };

    // Trả về luôn mảng budgets đã populate
    res.json({
      budgets,
      summary: budgetsSummary,
    });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ message: "Error fetching budgets" });
  }
};

/**
 * Lấy chi tiết ngân sách
 */
export const getBudgetById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const budgetId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!budgetId) {
      res.status(400).json({ message: "Budget ID is required" });
      return;
    }

    // Lấy ngân sách từ database, KHÔNG populate categories
    const budget = await Budget.findOne({ _id: budgetId, userId });

    if (!budget) {
      res.status(404).json({ message: "Budget not found" });
      return;
    }

    // Tính toán thêm chi tiết
    const usagePercentage = Math.round(
      (budget.currentAmount / budget.amount) * 100
    );
    const remainingAmount = budget.amount - budget.currentAmount;
    const isExceeded = budget.currentAmount > budget.amount;
    const daysLeft = Math.max(
      0,
      Math.ceil(
        (budget.endDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    // Trả về thông tin chi tiết kèm phân tích, categories là mảng id
    const budgetObj = budget.toObject();
    budgetObj.categories = budgetObj.categories
      .map((cat: any) =>
        typeof cat === "object" && cat !== null && cat._id
          ? cat._id.toString()
          : cat
      )
      .filter((id: any) => typeof id === "string" && id && id !== "undefined");
    res.json({
      ...budgetObj,
      analytics: {
        usagePercentage,
        remainingAmount,
        isExceeded,
        daysLeft,
        dailyBudget: daysLeft > 0 ? remainingAmount / daysLeft : 0,
        warningLevel:
          usagePercentage >= budget.notificationThreshold
            ? "warning"
            : "normal",
      },
    });
  } catch (error) {
    console.error("Error fetching budget:", error);
    res.status(500).json({ message: "Error fetching budget" });
  }
};

/**
 * Tạo ngân sách mới
 * Money Lover tính năng:
 * - Tạo ngân sách theo một hoặc nhiều danh mục
 * - Ngân sách có thể định kỳ (hàng tháng) hoặc một lần
 * - Thiết lập ngưỡng cảnh báo
 */
export const createBudget = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const {
      name,
      amount,
      startDate,
      endDate,
      categories,
      walletId,
      isRecurring,
      recurringFrequency,
      notificationThreshold,
      notes,
    } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (
      !name ||
      !amount ||
      !startDate ||
      !endDate ||
      !categories ||
      !walletId
    ) {
      res.status(400).json({
        message: "Missing required fields",
        requiredFields: [
          "name",
          "amount",
          "startDate",
          "endDate",
          "categories",
          "walletId",
        ],
      });
      return;
    }

    // Kiểm tra xác thực đầu vào
    if (amount <= 0) {
      res.status(400).json({
        message: "Budget amount must be greater than zero",
      });
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      res.status(400).json({
        message: "End date must be after start date",
      });
      return;
    }

    // Làm sạch mảng categories
    let cleanedCategories = Array.isArray(categories)
      ? categories.filter(
          (id) => typeof id === "string" && id && id !== "undefined"
        )
      : [];

    if (!Array.isArray(cleanedCategories) || cleanedCategories.length === 0) {
      res.status(400).json({
        message: "At least one valid category must be selected",
      });
      return;
    }

    // Tạo ngân sách mới
    const newBudget = new Budget({
      name,
      amount: Number(amount),
      currentAmount: 0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      categories: cleanedCategories,
      userId,
      walletId,
      isRecurring: Boolean(isRecurring),
      recurringFrequency: recurringFrequency || "monthly",
      status: "active",
      notificationThreshold: notificationThreshold || 80,
      notes: notes || "",
    });

    // Lưu vào database
    await newBudget.save();

    res.status(201).json({
      message: "Budget created successfully",
      budget: newBudget,
    });
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ message: "Error creating budget" });
  }
};

/**
 * Cập nhật ngân sách
 * Money Lover tính năng:
 * - Chỉnh sửa thông tin ngân sách
 * - Chỉnh sửa danh mục thuộc ngân sách
 */
export const updateBudget = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const budgetId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!budgetId) {
      res.status(400).json({ message: "Budget ID is required" });
      return;
    }

    // Lấy ngân sách từ database
    const budget = await Budget.findOne({ _id: budgetId, userId });
    if (!budget) {
      res.status(404).json({ message: "Budget not found" });
      return;
    }

    const {
      name,
      amount,
      startDate,
      endDate,
      categories,
      walletId,
      isRecurring,
      recurringFrequency,
      notificationThreshold,
      notes,
    } = req.body;

    // Làm sạch mảng categories nếu có
    let updatedCategories = Array.isArray(categories)
      ? categories.filter(
          (id) => typeof id === "string" && id && id !== "undefined"
        )
      : budget.categories;

    // Cập nhật ngân sách
    budget.name = name || budget.name;
    budget.amount = amount ? Number(amount) : budget.amount;
    budget.startDate = startDate ? new Date(startDate) : budget.startDate;
    budget.endDate = endDate ? new Date(endDate) : budget.endDate;
    budget.categories = updatedCategories;
    budget.walletId = walletId || budget.walletId;
    budget.isRecurring =
      isRecurring !== undefined ? Boolean(isRecurring) : budget.isRecurring;
    budget.recurringFrequency = recurringFrequency || budget.recurringFrequency;
    budget.notificationThreshold =
      notificationThreshold || budget.notificationThreshold;
    budget.notes = notes !== undefined ? notes : budget.notes;
    budget.updatedAt = new Date();

    // Kiểm tra logic ngày tháng
    if (budget.startDate >= budget.endDate) {
      res.status(400).json({
        message: "End date must be after start date",
      });
      return;
    }

    await budget.save();

    res.json({
      message: "Budget updated successfully",
      budget,
    });
  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({ message: "Error updating budget" });
  }
};

/**
 * Xóa ngân sách
 */
export const deleteBudget = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const budgetId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!budgetId) {
      res.status(400).json({ message: "Budget ID is required" });
      return;
    }

    // Xóa ngân sách từ database
    const result = await Budget.deleteOne({ _id: budgetId, userId });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Budget not found" });
      return;
    }

    res.json({
      message: "Budget deleted successfully",
      budgetId,
    });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ message: "Error deleting budget" });
  }
};

/**
 * Lấy báo cáo ngân sách
 * Money Lover tính năng:
 * - Tạo báo cáo tổng quan về tất cả ngân sách
 * - Phân tích chi tiết theo từng danh mục
 */
export const getBudgetReport = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { month, year, walletId } = req.query;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Kiểm tra tham số
    if (!month || !year) {
      res.status(400).json({
        message: "Month and year are required for report generation",
      });
      return;
    }

    const reportMonth = parseInt(month as string);
    const reportYear = parseInt(year as string);

    if (
      isNaN(reportMonth) ||
      reportMonth < 1 ||
      reportMonth > 12 ||
      isNaN(reportYear)
    ) {
      res.status(400).json({
        message: "Invalid month or year format",
      });
      return;
    }

    // Lọc ngân sách theo tháng/năm từ MongoDB
    const startOfMonth = new Date(reportYear, reportMonth - 1, 1);
    const endOfMonth = new Date(reportYear, reportMonth, 0, 23, 59, 59, 999);
    let filter: any = {
      userId,
      startDate: { $lte: endOfMonth },
      endDate: { $gte: startOfMonth },
    };
    if (walletId) {
      filter.walletId = walletId;
    }
    let relevantBudgets = await Budget.find(filter);

    // Tính toán số liệu tổng hợp
    const totalBudgeted = relevantBudgets.reduce(
      (sum, budget) => sum + budget.amount,
      0
    );
    const totalSpent = relevantBudgets.reduce(
      (sum, budget) => sum + budget.currentAmount,
      0
    );
    const totalRemaining = totalBudgeted - totalSpent;
    const overallProgress = Math.round((totalSpent / totalBudgeted) * 100);

    // Phân tích theo từng danh mục
    const categoryAnalysis = [
      {
        categoryId: "cat-001",
        categoryName: "Food & Drink",
        budgeted: 300000,
        spent: 200000,
        remaining: 100000,
        progress: 67,
      },
      {
        categoryId: "cat-004",
        categoryName: "Groceries",
        budgeted: 200000,
        spent: 50000,
        remaining: 150000,
        progress: 25,
      },
      {
        categoryId: "cat-002",
        categoryName: "Transport",
        budgeted: 300000,
        spent: 200000,
        remaining: 100000,
        progress: 67,
      },
    ];

    // Xu hướng chi tiêu theo thời gian
    const dailySpending = [
      { date: "2023-06-01", amount: 0 },
      { date: "2023-06-02", amount: 0 },
      { date: "2023-06-03", amount: 0 },
      { date: "2023-06-04", amount: 0 },
      { date: "2023-06-05", amount: 50000 },
      { date: "2023-06-06", amount: 0 },
      { date: "2023-06-07", amount: 0 },
      { date: "2023-06-08", amount: 0 },
      { date: "2023-06-09", amount: 0 },
      { date: "2023-06-10", amount: 100000 },
      { date: "2023-06-11", amount: 0 },
      { date: "2023-06-12", amount: 80000 },
      { date: "2023-06-13", amount: 0 },
      { date: "2023-06-14", amount: 0 },
      { date: "2023-06-15", amount: 0 },
    ];

    // Trạng thái ngân sách
    const budgetStatuses = {
      healthy: relevantBudgets.filter(
        (b) => (b.currentAmount / b.amount) * 100 < 75
      ).length,
      warning: relevantBudgets.filter(
        (b) =>
          (b.currentAmount / b.amount) * 100 >= 75 &&
          (b.currentAmount / b.amount) * 100 < 100
      ).length,
      exceeded: relevantBudgets.filter((b) => b.currentAmount > b.amount)
        .length,
    };

    res.json({
      month: reportMonth,
      year: reportYear,
      totalBudgets: relevantBudgets.length,
      summary: {
        totalBudgeted,
        totalSpent,
        totalRemaining,
        overallProgress,
        budgetStatuses,
      },
      categoryAnalysis,
      dailySpending,
      budgets: relevantBudgets.map((budget) => ({
        id: budget.id,
        name: budget.name,
        amount: budget.amount,
        spent: budget.currentAmount,
        remaining: budget.amount - budget.currentAmount,
        progress: Math.round((budget.currentAmount / budget.amount) * 100),
        status:
          budget.currentAmount > budget.amount
            ? "exceeded"
            : (budget.currentAmount / budget.amount) * 100 >=
              budget.notificationThreshold
            ? "warning"
            : "healthy",
      })),
    });
  } catch (error) {
    console.error("Error generating budget report:", error);
    res.status(500).json({ message: "Error generating budget report" });
  }
};
