import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense" | "debt_loan";
  userId: mongoose.Types.ObjectId;
  parent?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    icon: {
      type: String,
      required: [true, "Category icon is required"],
      default: "tag",
    },
    color: {
      type: String,
      required: [true, "Category color is required"],
      default: "#6B7280",
    },
    type: {
      type: String,
      enum: ["income", "expense", "debt_loan"],
      required: [true, "Category type is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    parent: {
      type: String,
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add composite indexes for common query patterns
categorySchema.index({ userId: 1, type: 1 });
categorySchema.index({ userId: 1, isDefault: 1 });
categorySchema.index({ userId: 1, isActive: 1 });
categorySchema.index({ parent: 1 });

// Create the model from the schema
const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
