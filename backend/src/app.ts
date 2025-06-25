import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import walletRoutes from "./routes/walletRoutes";
import { errorHandler } from "./middleware/errorHandler";
export const hardCodeDBString =
  "mongodb+srv://tt912002:truong912002@finwise.fjrw7.mongodb.net/?retryWrites=true&w=majority&appName=FinWise";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/wallets", walletRoutes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || hardCodeDBString)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
  });

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
