import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense" | "transfer";
  userId: mongoose.Types.ObjectId;
  parentCategory?: mongoose.Types.ObjectId;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
      default: "#6200EE",
    },
    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Tạo index để cải thiện hiệu suất truy vấn
categorySchema.index({ userId: 1, type: 1 });
categorySchema.index({ isDefault: 1 });

export default mongoose.model<ICategory>("Category", categorySchema);
