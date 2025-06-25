import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "VND",
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    isIncludedInTotal: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo index cho các trường thường được query
walletSchema.index({ userId: 1 });
walletSchema.index({ isIncludedInTotal: 1 });
walletSchema.index({ isDefault: 1 });

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
