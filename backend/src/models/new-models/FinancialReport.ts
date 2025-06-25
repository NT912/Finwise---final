import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface IFinancialReport extends Document {
  userId: mongoose.Types.ObjectId;
  period: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  incomeByCategory: ICategoryBreakdown[];
  expenseByCategory: ICategoryBreakdown[];
  walletBalances: {
    walletId: mongoose.Types.ObjectId;
    balance: number;
    previousBalance: number;
    change: number;
  }[];
  budgetStatus: {
    budgetId: mongoose.Types.ObjectId;
    name: string;
    progress: number;
    status: "under" | "over" | "on-track";
  }[];
  savingsGoalProgress: {
    goalId: mongoose.Types.ObjectId;
    name: string;
    progress: number;
    remainingAmount: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const financialReportSchema = new Schema<IFinancialReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", "custom"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalIncome: {
      type: Number,
      required: true,
      default: 0,
    },
    totalExpense: {
      type: Number,
      required: true,
      default: 0,
    },
    netSavings: {
      type: Number,
      required: true,
      default: 0,
    },
    savingsRate: {
      type: Number,
      required: true,
      default: 0,
    },
    incomeByCategory: [
      {
        category: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        percentage: {
          type: Number,
          required: true,
        },
      },
    ],
    expenseByCategory: [
      {
        category: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        percentage: {
          type: Number,
          required: true,
        },
      },
    ],
    walletBalances: [
      {
        walletId: {
          type: Schema.Types.ObjectId,
          ref: "Wallet",
          required: true,
        },
        balance: {
          type: Number,
          required: true,
        },
        previousBalance: {
          type: Number,
          required: true,
        },
        change: {
          type: Number,
          required: true,
        },
      },
    ],
    budgetStatus: [
      {
        budgetId: {
          type: Schema.Types.ObjectId,
          ref: "Budget",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        progress: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["under", "over", "on-track"],
          required: true,
        },
      },
    ],
    savingsGoalProgress: [
      {
        goalId: {
          type: Schema.Types.ObjectId,
          ref: "SavingGoal",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        progress: {
          type: Number,
          required: true,
        },
        remainingAmount: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Tạo index để cải thiện hiệu suất truy vấn
financialReportSchema.index({ userId: 1, period: 1 });
financialReportSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model<IFinancialReport>(
  "FinancialReport",
  financialReportSchema
);
