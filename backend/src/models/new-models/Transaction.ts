import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  amount: number;
  description: string;
  date: Date;
  type: "income" | "expense" | "transfer";
  category: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  toWalletId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  paymentMethod?: string;
  location?: string;
  tags?: string[];
  attachments?: string[];
  isRecurring: boolean;
  recurringDetails?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    toWalletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    attachments: [
      {
        type: String,
      },
    ],
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDetails: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
      },
      interval: {
        type: Number,
        min: 1,
      },
      endDate: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

// Tạo index để cải thiện hiệu suất truy vấn
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, walletId: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({
  description: "text",
  tags: "text",
});

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
