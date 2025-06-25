import User from "../models/User";
import mongoose from "mongoose";

export const getHomeDataService = async (
  userId: string,
  timeFilter: string
) => {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  console.log(
    `✅ [homeService] Lấy dữ liệu Home cho userId: ${userId}, filter: ${timeFilter}`
  );

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  console.log(
    `🔹 [homeService] User: ${user.fullName}, Avatar: ${user.avatar}`
  );

  // Sample data since we've removed the transaction models
  const responseData = {
    userName: user.fullName,
    userAvatar: user.avatar || "",
    totalBalance: 5000000,
    totalExpense: 2000000,
    savingsOnGoals: 1000000,
    goalPercentage: 40,
    revenueLostWeek: 500000,
    foodLastWeek: 300000,
    transactions: [],
  };

  console.log(
    `✅ [homeService] Trả về dữ liệu sample do cấu trúc dữ liệu đã thay đổi`
  );

  return responseData;
};
