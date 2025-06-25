import express from "express";
import { authenticateJWT } from "../../middleware/authMiddleware";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../controllers/new-controllers/CategoryController";

const router = express.Router();

// Get all categories with filter
router.get("/", authenticateJWT, getCategories);

// Get category by ID
router.get("/:id", authenticateJWT, getCategoryById);

// Create new category
router.post("/", authenticateJWT, createCategory);

// Update category
router.put("/:id", authenticateJWT, updateCategory);

// Delete category
router.delete("/:id", authenticateJWT, deleteCategory);

export default router;
