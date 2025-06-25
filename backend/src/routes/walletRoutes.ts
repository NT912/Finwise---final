import express from "express";
import {
  getWallets,
  getWallet,
  createWallet,
  updateWallet,
  deleteWallet,
  getTotalBalance,
} from "../controllers/walletController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Wallet routes
router
  .route("/")
  .get(getWallets as any)
  .post(createWallet as any);

router.route("/total-balance").get(getTotalBalance as any);

router
  .route("/:id")
  .get(getWallet as any)
  .put(updateWallet as any)
  .delete(deleteWallet as any);

export default router;
