import mongoose, { Schema, Document } from "mongoose";

export interface ISavingGoal extends Document {
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate: Date;
  userId: mongoose.Types.ObjectId;
  walletId?: mongoose.Types.ObjectId;
  icon?: string;
  color?: string;
  description?: string;
  status: "active" | "completed" | "cancelled";
  progress: number;
  contributions?: {
    date: Date;
    amount: number;
    description?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const savingGoalSchema = new Schema<ISavingGoal>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    targetDate: {
      type: Date,
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
    icon: {
      type: String,
      default: "piggy-bank",
    },
    color: {
      type: String,
      default: "#4CAF50",
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    contributions: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        amount: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

// Cập nhật tiến độ khi save
savingGoalSchema.pre("save", function (next) {
  if (this.targetAmount > 0) {
    this.progress = Math.min(
      100,
      Math.round((this.currentAmount / this.targetAmount) * 100)
    );

    // Tự động cập nhật trạng thái khi đạt được mục tiêu
    if (this.currentAmount >= this.targetAmount) {
      this.status = "completed";
    }
  }
  next();
});

// Tạo index để cải thiện hiệu suất truy vấn
savingGoalSchema.index({ userId: 1, status: 1 });
savingGoalSchema.index({ targetDate: 1 });

export default mongoose.model<ISavingGoal>("SavingGoal", savingGoalSchema);
