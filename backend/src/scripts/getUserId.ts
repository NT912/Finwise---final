import mongoose from "mongoose";
import dotenv from "dotenv";
import UserModel from "../models/User";
import { hardCodeDBString } from "../app";

// Load environment variables
dotenv.config();

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

// Hàm chính để tìm userId bằng email
const findUserId = async () => {
  try {
    // Kiểm tra xem có email được cung cấp không
    const email = process.argv[2];
    if (!email) {
      console.error("Vui lòng cung cấp email: npm run find:userId <email>");
      process.exit(1);
    }

    // Tìm người dùng theo email
    const user = await UserModel.findOne({ email });

    if (!user) {
      console.error(`Không tìm thấy người dùng với email: ${email}`);
      process.exit(1);
    }

    // Hiển thị thông tin người dùng
    console.log("Thông tin người dùng:");
    console.log(`ID: ${user._id}`);
    console.log(`Tên: ${user.fullName}`);
    console.log(`Email: ${user.email}`);
    console.log("\nĐể thêm danh mục mặc định cho người dùng này, hãy chạy:");
    console.log(`npm run seed:categories ${user._id}`);
  } catch (error) {
    console.error("Lỗi khi tìm userId:", error);
  } finally {
    mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

// Kết nối và thực hiện tìm kiếm
connectDB().then(() => {
  findUserId();
});
