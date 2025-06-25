import { Request, Response } from "express";
import { getHomeDataService } from "../services/homeService";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

// Định nghĩa kiểu dữ liệu cho giao dịch
interface HomeTransaction {
  id?: string;
  amount: number;
  description: string;
  date: Date;
  type: "income" | "expense" | "transfer";
  category: string;
  walletId?: string;
}

export const getHomeData = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const timeFilter = (req.query.timeFilter as string) || "monthly";

    if (!userId) {
      console.warn(
        "🚨 [homeController] Unauthorized request - User ID missing"
      );
      res.status(401).json({ message: "Unauthorized - User ID is missing" });
      return;
    }

    console.log(
      `✅ [homeController] Nhận request lấy dữ liệu Home với userId: ${userId}, timeFilter: ${timeFilter}`
    );

    const homeData = await getHomeDataService(userId, timeFilter);

    console.log(`✅ [homeController] Trả về dữ liệu Home`);

    res.json(homeData);
  } catch (error) {
    console.error("🚨 [homeController] Lỗi lấy dữ liệu Home:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get transactions for home page based on time filter
export const getHomeTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const timeFilter = (req.query.timeFilter as string) || "monthly";

    if (!userId) {
      console.warn(
        "🚨 [homeController] Unauthorized request - User ID missing"
      );
      res.status(401).json({ message: "Unauthorized - User ID is missing" });
      return;
    }

    // Calculate date range based on time filter
    const now = new Date();
    let startDate = new Date();

    switch (timeFilter.toLowerCase()) {
      case "daily":
        startDate.setDate(now.getDate() - 1);
        break;
      case "weekly":
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
      default:
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    console.log(
      `✅ [homeController] Getting transactions for ${timeFilter} period: ${startDate.toISOString()} to ${now.toISOString()}`
    );

    // TODO: Implement new transaction service
    const transactions: HomeTransaction[] = []; // Tạm thời trả về mảng rỗng

    res.json(transactions);
  } catch (error) {
    console.error("🚨 [homeController] Error fetching transactions:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
