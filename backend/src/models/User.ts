import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  googleId?: string;
  facebookId?: string;
  avatar?: string;
  totalBalance: number;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  accountStatus: "active" | "deactivated";
  createdAt: Date;
  updatedAt: Date;
  resetPasswordCode?: string;
  resetPasswordExpires?: Date;
  userId?: string;
  transactionCount?: number;
  transactions?: mongoose.Types.ObjectId[];
  stats?: {
    totalIncome: number;
    totalExpense: number;
    avgMonthlyIncome?: number;
    avgMonthlyExpense?: number;
    lastUpdated?: Date;
  };
}

interface ValidationProps {
  value: any;
  path: string;
  kind: string;
}

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /^\+?[\d\s-]+$/.test(v);
        },
        message: function (props: ValidationProps) {
          return `${props.value} is not a valid phone number!`;
        },
      },
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (v: Date) {
          return v <= new Date();
        },
        message: function (props: ValidationProps) {
          return `Date of birth cannot be in the future!`;
        },
      },
    },
    googleId: { type: String },
    facebookId: { type: String },
    avatar: { type: String },
    totalBalance: { type: Number, default: 0 },
    notifications: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    accountStatus: {
      type: String,
      enum: ["active", "deactivated"],
      default: "active",
    },
    resetPasswordCode: { type: String },
    resetPasswordExpires: { type: Date },
    userId: { type: String },
    transactionCount: { type: Number, default: 0 },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    stats: {
      totalIncome: { type: Number, default: 0 },
      totalExpense: { type: Number, default: 0 },
      avgMonthlyIncome: { type: Number, default: 0 },
      avgMonthlyExpense: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// Add middleware to set userId before saving
userSchema.pre("save", function (next) {
  if (!this.userId && this._id) {
    this.userId = this._id.toString();
  }
  next();
});

export default mongoose.model<IUser>("User", userSchema);
