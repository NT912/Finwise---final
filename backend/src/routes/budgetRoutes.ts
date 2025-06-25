import express from "express";
import { authenticateJWT } from "../middleware/authMiddleware";
import {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetReport,
} from "../controllers/new-controllers/BudgetController";

const router = express.Router();

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authenticateJWT);

// Lấy danh sách ngân sách với các bộ lọc
router.get("/", getBudgets);

// Lấy báo cáo tổng hợp ngân sách theo tháng
router.get("/report", getBudgetReport);

// Lấy chi tiết một ngân sách
router.get("/:id", getBudgetById);

// Tạo ngân sách mới
router.post("/", createBudget);

// Cập nhật thông tin ngân sách
router.put("/:id", updateBudget);

// Xóa ngân sách
router.delete("/:id", deleteBudget);

export default router;
