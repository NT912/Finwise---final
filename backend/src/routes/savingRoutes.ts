import express from "express";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authenticateJWT);

// Các routes sẽ được thêm sau
router.get("/", (req, res) => {
  res.json({ message: "Savings API" });
});

export default router;
