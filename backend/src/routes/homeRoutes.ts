import express from "express";
import {
  getHomeData,
  getHomeTransactions,
} from "../controllers/homeController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

// Get home page data with user info, balances and statistics
router.get("/home", authenticateJWT, getHomeData);

// Get transactions for home screen based on time filter
router.get("/transactions", authenticateJWT, getHomeTransactions);

export default router;
