import { createNotification } from "../controllers/NotificationController";
import { ITransaction } from "../models/new-models/Transaction";
import { IBudget } from "../models/budget";
import Wallet from "../models/Wallet";
import mongoose from "mongoose";

// Định nghĩa interface IWallet
interface IWallet extends mongoose.Document {
  name: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isIncludedInTotal: boolean;
  isDefault: boolean;
  userId: mongoose.Types.ObjectId;
  _id: mongoose.Types.ObjectId;
}

export const createTransactionNotification = async (
  userId: mongoose.Types.ObjectId,
  transaction: ITransaction,
  action: "create" | "update" | "delete"
) => {
  let title = "";
  let message = "";

  const amount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(transaction.amount);

  switch (action) {
    case "create":
      title = "Giao dịch mới";
      message = `Bạn đã tạo một giao dịch ${
        transaction.type === "expense" ? "chi" : "thu"
      } ${amount}`;
      break;
    case "update":
      title = "Cập nhật giao dịch";
      message = `Giao dịch ${
        transaction.type === "expense" ? "chi" : "thu"
      } ${amount} đã được cập nhật`;
      break;
    case "delete":
      title = "Xóa giao dịch";
      message = `Giao dịch ${
        transaction.type === "expense" ? "chi" : "thu"
      } ${amount} đã bị xóa`;
      break;
  }

  await createNotification(
    userId,
    title,
    message,
    "transaction",
    transaction._id as mongoose.Types.ObjectId
  );
};

export const createBudgetNotification = async (
  userId: mongoose.Types.ObjectId,
  budget: IBudget,
  action: "create" | "update" | "delete" | "warning"
) => {
  let title = "";
  let message = "";

  const amount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(budget.amount);

  switch (action) {
    case "create":
      title = "Ngân sách mới";
      message = `Bạn đã tạo một ngân sách mới với hạn mức ${amount}`;
      break;
    case "update":
      title = "Cập nhật ngân sách";
      message = `Ngân sách đã được cập nhật thành ${amount}`;
      break;
    case "delete":
      title = "Xóa ngân sách";
      message = `Ngân sách ${amount} đã bị xóa`;
      break;
    case "warning":
      title = "Cảnh báo ngân sách";
      message = `Ngân sách của bạn đã sử dụng gần hết. Hạn mức còn lại: ${amount}`;
      break;
  }

  await createNotification(
    userId,
    title,
    message,
    "budget",
    budget._id as mongoose.Types.ObjectId
  );
};

export const createWalletNotification = async (
  userId: mongoose.Types.ObjectId,
  wallet: IWallet,
  action: "create" | "update" | "delete" | "low_balance"
) => {
  let title = "";
  let message = "";

  const balance = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(wallet.balance);

  switch (action) {
    case "create":
      title = "Ví mới";
      message = `Bạn đã tạo một ví mới "${wallet.name}" với số dư ${balance}`;
      break;
    case "update":
      title = "Cập nhật ví";
      message = `Ví "${wallet.name}" đã được cập nhật. Số dư hiện tại: ${balance}`;
      break;
    case "delete":
      title = "Xóa ví";
      message = `Ví "${wallet.name}" đã bị xóa`;
      break;
    case "low_balance":
      title = "Cảnh báo số dư";
      message = `Số dư trong ví "${wallet.name}" đang thấp: ${balance}`;
      break;
  }

  await createNotification(
    userId,
    title,
    message,
    "wallet",
    wallet._id as mongoose.Types.ObjectId
  );
};
