import express from "express";
import { authenticateJWT } from "../../middleware/authMiddleware";
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
  getTransactionsByDateRange,
  getMonthlyReport,
} from "../../controllers/new-controllers/TransactionController";

const router = express.Router();

// Get all transactions with filter
router.get("/", authenticateJWT, getTransactions);

// Get transaction statistics (like Money Lover)
router.get("/stats", authenticateJWT, getTransactionStats);

// Get transactions by date range
router.get("/date-range", authenticateJWT, getTransactionsByDateRange);

// Get detailed monthly report for report screen
router.get("/report", authenticateJWT, getMonthlyReport);

// Get transaction by ID - IMPORTANT: This must come after other specific routes
router.get("/:id", authenticateJWT, getTransactionById);

// Create new transaction
router.post("/", authenticateJWT, createTransaction);

// Update transaction
router.put("/:id", authenticateJWT, updateTransaction);

// Delete transaction
router.delete("/:id", authenticateJWT, deleteTransaction);

export default router;
