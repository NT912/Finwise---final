import mongoose, { Schema, Document } from "mongoose";

export interface IBudget extends Document {
  name: string;
  amount: number;
  currentAmount?: number;
  startDate: Date;
  endDate: Date;
  categories: string[];
  userId: mongoose.Types.ObjectId;
  walletId?: mongoose.Types.ObjectId;
  isRecurring: boolean;
  recurringFrequency?: "weekly" | "monthly" | "yearly";
  status: "active" | "expired" | "completed";
  notificationThreshold?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    categories: {
      type: [String],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ["weekly", "monthly", "yearly"],
    },
    status: {
      type: String,
      enum: ["active", "expired", "completed"],
      default: "active",
    },
    notificationThreshold: {
      type: Number,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Tạo index để cải thiện hiệu suất truy vấn
budgetSchema.index({ userId: 1, status: 1 });
budgetSchema.index({ endDate: 1 });
budgetSchema.index({ categories: 1 });

export default mongoose.model<IBudget>("Budget", budgetSchema);
