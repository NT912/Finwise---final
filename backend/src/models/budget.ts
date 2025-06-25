import mongoose, { Document, Schema } from "mongoose";

export interface IBudget extends Document {
  name: string;
  amount: number;
  currentAmount: number;
  startDate: Date;
  endDate: Date;
  categories: mongoose.Types.ObjectId[];
  userId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  isRecurring: boolean;
  status: "active" | "completed" | "overbudget";
  notificationThreshold: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Budget name is required"],
      trim: true,
      maxlength: [100, "Budget name cannot exceed 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: [0, "Budget amount must be positive"],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Current amount must be positive"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "At least one category is required"],
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "completed", "overbudget"],
      default: "active",
    },
    notificationThreshold: {
      type: Number,
      default: 80,
      min: [0, "Notification threshold must be between 0 and 100"],
      max: [100, "Notification threshold must be between 0 and 100"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for common query patterns
budgetSchema.index({ userId: 1, status: 1 });
budgetSchema.index({ userId: 1, walletId: 1 });
budgetSchema.index({ userId: 1, startDate: 1, endDate: 1 });
budgetSchema.index({ userId: 1, categories: 1 });

// Auto-populate referenced fields
budgetSchema.virtual("wallet", {
  ref: "Wallet",
  localField: "walletId",
  foreignField: "_id",
  justOne: true,
});

budgetSchema.virtual("categoriesList", {
  ref: "Category",
  localField: "categories",
  foreignField: "_id",
});

// Create the model from the schema
const Budget = mongoose.model<IBudget>("Budget", budgetSchema);

export default Budget;
