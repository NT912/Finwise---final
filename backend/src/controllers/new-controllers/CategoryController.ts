import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import Category, { ICategory } from "../../models/Category";
import mongoose from "mongoose";
import { createLogger } from "../../utils/logger";

const logger = createLogger("CategoryController");

/**
 * Get all categories
 * Features:
 * - Filter categories by type (expense/income)
 * - Show default and custom categories for the user
 */
export const getCategories = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get query parameters
    const { type } = req.query;

    // Build filter condition
    const filter: any = {
      $or: [
        { userId: new mongoose.Types.ObjectId(userId) },
        { isDefault: true },
      ],
      isActive: true,
    };

    // Add type filter if provided
    if (type && ["expense", "income", "debt_loan"].includes(type as string)) {
      filter.type = type;
    }

    // Fetch categories from database
    const categories = await Category.find(filter).sort({
      isDefault: -1,
      name: 1,
    });

    // Log categories for debugging
    console.log(`Found ${categories.length} categories for user ${userId}`);

    // Group categories by type for easier display
    const categoriesByType = {
      expense: categories.filter((c) => c.type === "expense"),
      income: categories.filter((c) => c.type === "income"),
      debt_loan: categories.filter((c) => c.type === "debt_loan"),
    };

    // Format categories to match frontend expectations
    const formattedCategories = categories.map((category: ICategory) => ({
      _id: category._id.toString(),
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      parent: category.parent,
      isDefault: category.isDefault,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    res.json(formattedCategories);
  } catch (error) {
    logger.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

/**
 * Get category details by ID
 */
export const getCategoryById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const categoryId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!categoryId) {
      res.status(400).json({ message: "Category ID is required" });
      return;
    }

    // Find category in database
    const category = await Category.findOne({
      _id: categoryId,
      $or: [
        { userId: new mongoose.Types.ObjectId(userId) },
        { isDefault: true },
      ],
      isActive: true,
    });

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.json({
      _id: category._id.toString(),
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      parent: category.parent,
      isDefault: category.isDefault,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  } catch (error) {
    logger.error(`Error fetching category ${req.params.id}:`, error);
    res.status(500).json({ message: "Error fetching category" });
  }
};

/**
 * Create a new custom category
 */
export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { name, icon, color, type, parent } = req.body;

    // Validate required fields
    if (!name || !icon || !color || !type) {
      res
        .status(400)
        .json({ message: "Name, icon, color, and type are required" });
      return;
    }

    // Validate type
    if (!["expense", "income", "debt_loan"].includes(type)) {
      res
        .status(400)
        .json({ message: "Type must be 'expense', 'income', or 'debt_loan'" });
      return;
    }

    // Check if category with same name already exists for this user
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") }, // Case insensitive match
      type,
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    });

    if (existingCategory) {
      res
        .status(400)
        .json({ message: "A category with this name already exists" });
      return;
    }

    // Create new category
    const newCategory = new Category({
      name,
      icon,
      color,
      type,
      userId: new mongoose.Types.ObjectId(userId),
      isDefault: false,
      isActive: true,
      parent: parent || null, // Set parent if provided
    });

    // Save to database
    const savedCategory = await newCategory.save();

    res.status(201).json({
      _id: savedCategory._id.toString(),
      name: savedCategory.name,
      icon: savedCategory.icon,
      color: savedCategory.color,
      type: savedCategory.type,
      parent: savedCategory.parent,
      isDefault: savedCategory.isDefault,
      createdAt: savedCategory.createdAt,
      updatedAt: savedCategory.updatedAt,
    });
  } catch (error) {
    logger.error("Error creating category:", error);
    res.status(500).json({ message: "Error creating category" });
  }
};

/**
 * Update an existing category
 */
export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const categoryId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Find the category
    const category = await Category.findById(categoryId);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    // Check if user owns this category or if it's a default category
    if (!category.isDefault && category.userId.toString() !== userId) {
      res
        .status(403)
        .json({ message: "You don't have permission to update this category" });
      return;
    }

    // Check if it's a default category (cannot be modified)
    if (category.isDefault) {
      res
        .status(403)
        .json({ message: "Default categories cannot be modified" });
      return;
    }

    const { name, icon, color } = req.body;

    // Validate at least one field to update
    if (!name && !icon && !color) {
      res
        .status(400)
        .json({ message: "At least one field is required for update" });
      return;
    }

    // Check if category with same name already exists (for different category)
    if (name) {
      const existingCategory = await Category.findOne({
        _id: { $ne: categoryId }, // Not the current category
        name: { $regex: new RegExp(`^${name}$`, "i") }, // Case insensitive
        type: category.type,
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true,
      });

      if (existingCategory) {
        res
          .status(400)
          .json({ message: "A category with this name already exists" });
        return;
      }
    }

    // Update category
    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (color) category.color = color;

    // Save to database
    const updatedCategory = await category.save();

    res.json({
      _id: updatedCategory._id.toString(),
      name: updatedCategory.name,
      icon: updatedCategory.icon,
      color: updatedCategory.color,
      type: updatedCategory.type,
      isDefault: updatedCategory.isDefault,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt,
    });
  } catch (error) {
    logger.error(`Error updating category ${req.params.id}:`, error);
    res.status(500).json({ message: "Error updating category" });
  }
};

/**
 * Delete a category (soft delete by marking as inactive)
 */
export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const categoryId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Find the category
    const category = await Category.findById(categoryId);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    // Check if user owns this category
    if (category.userId.toString() !== userId) {
      res
        .status(403)
        .json({ message: "You don't have permission to delete this category" });
      return;
    }

    // Check if it's a default category (cannot be deleted)
    if (category.isDefault) {
      res.status(403).json({ message: "Default categories cannot be deleted" });
      return;
    }

    // Soft delete by marking as inactive
    category.isActive = false;
    await category.save();

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting category ${req.params.id}:`, error);
    res.status(500).json({ message: "Error deleting category" });
  }
};

// Create initial default categories for new users
export const createDefaultCategories = async (
  userId: string
): Promise<void> => {
  try {
    const defaultCategories = [
      // Expense categories
      {
        name: "Bills & Utilities",
        icon: "receipt-outline",
        color: "#3D5A80",
        type: "expense",
        isDefault: true,
      },
      {
        name: "Shopping",
        icon: "cart-outline",
        color: "#3D5A80",
        type: "expense",
        isDefault: true,
      },
      {
        name: "Family",
        icon: "people-outline",
        color: "#3D5A80",
        type: "expense",
        isDefault: true,
      },
      {
        name: "Transportation",
        icon: "car-outline",
        color: "#3D5A80",
        type: "expense",
        isDefault: true,
      },
      {
        name: "Health & Fitness",
        icon: "fitness-outline",
        color: "#3D5A80",
        type: "expense",
        isDefault: true,
      },
      {
        name: "Education",
        icon: "school-outline",
        color: "#3D5A80",
        type: "expense",
        isDefault: true,
      },
      {
        name: "Entertainment",
        icon: "game-controller-outline",
        color: "#3D5A80",
        type: "expense",
        isDefault: true,
      },
      {
        name: "Gifts & Donations",
        icon: "gift-outline",
        color: "#3D5A80",
        type: "expense",
        isDefault: true,
      },
      {
        name: "Other Expense",
        icon: "cube-outline",
        color: "#3D5A80",
        type: "expense",
        isDefault: true,
      },

      // Income categories
      {
        name: "Salary",
        icon: "cash-outline",
        color: "#4CAF50",
        type: "income",
        isDefault: true,
      },
      {
        name: "Other Income",
        icon: "cube-outline",
        color: "#4CAF50",
        type: "income",
        isDefault: true,
      },
    ];

    // Check if there are already default categories
    const existingDefaultCategories = await Category.find({ isDefault: true });

    if (existingDefaultCategories.length === 0) {
      // Create default categories
      await Category.insertMany(defaultCategories);
    }

    // Also create user specific categories (copying from defaults)
    const userDefaultCategories = defaultCategories.map((cat) => ({
      ...cat,
      isDefault: false,
      userId: new mongoose.Types.ObjectId(userId),
    }));

    // Check if user already has categories
    const existingUserCategories = await Category.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (existingUserCategories.length === 0) {
      // Create user-specific categories
      await Category.insertMany(userDefaultCategories);
    }
  } catch (error) {
    logger.error("Error creating default categories:", error);
    throw error;
  }
};
