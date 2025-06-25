import mongoose from "mongoose";
import dotenv from "dotenv";
import CategoryModel from "../models/Category";
import { hardCodeDBString } from "../app";

// Load environment variables
dotenv.config();

// Định nghĩa dữ liệu categories mẫu
const categories = [
  {
    name: "Food",
    icon: "restaurant-outline",
    color: "#63B0FF",
    type: "expense",
    isDefault: true,
  },
  {
    name: "Transport",
    icon: "bus-outline",
    color: "#63B0FF",
    type: "expense",
    isDefault: true,
  },
  {
    name: "Medicine",
    icon: "medical-outline",
    color: "#63B0FF",
    type: "expense",
    isDefault: true,
  },
  {
    name: "Groceries",
    icon: "basket-outline",
    color: "#63B0FF",
    type: "expense",
    isDefault: true,
  },
  {
    name: "Rent",
    icon: "home-outline",
    color: "#63B0FF",
    type: "expense",
    isDefault: true,
  },
  {
    name: "Gifts",
    icon: "gift-outline",
    color: "#63B0FF",
    type: "expense",
    isDefault: true,
  },
  {
    name: "Savings",
    icon: "wallet-outline",
    color: "#63B0FF",
    type: "expense",
    isDefault: true,
  },
  {
    name: "Entertainment",
    icon: "ticket-outline",
    color: "#63B0FF",
    type: "expense",
    isDefault: true,
  },
  {
    name: "More",
    icon: "add-outline",
    color: "#63B0FF",
    type: "expense",
    isDefault: true,
  },
  {
    name: "Salary",
    icon: "cash-outline",
    color: "#63B0FF",
    type: "income",
    isDefault: true,
  },
  {
    name: "Bonus",
    icon: "trophy-outline",
    color: "#63B0FF",
    type: "income",
    isDefault: true,
  },
  {
    name: "Investment",
    icon: "trending-up-outline",
    color: "#63B0FF",
    type: "income",
    isDefault: true,
  },
];

// Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || hardCodeDBString);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Hàm chính để seed dữ liệu
const seedCategories = async () => {
  try {
    // Kiểm tra xem có userId được cung cấp không
    const userId = process.argv[2];
    if (!userId) {
      console.error(
        "Vui lòng cung cấp userId: npm run seed:categories <userId>"
      );
      process.exit(1);
    }

    // Xoá các categories mặc định cũ của user (nếu có)
    await CategoryModel.deleteMany({ userId, isDefault: true });

    // Thêm userId vào mỗi category
    const categoriesWithUserId = categories.map((category) => ({
      ...category,
      userId,
    }));

    // Thêm các categories mới
    await CategoryModel.insertMany(categoriesWithUserId);
    console.log(
      `Đã thêm ${categories.length} danh mục vào cơ sở dữ liệu cho userId: ${userId}`
    );

    // Kiểm tra categories đã được thêm
    const addedCategories = await CategoryModel.find({ userId });
    console.log("Các danh mục đã được thêm:", addedCategories);
  } catch (error) {
    console.error("Lỗi khi seed categories:", error);
  } finally {
    mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

// Kết nối và thực hiện seeding
connectDB().then(() => {
  seedCategories();
});
