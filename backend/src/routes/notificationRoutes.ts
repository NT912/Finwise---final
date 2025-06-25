import express from "express";
import { authenticateJWT } from "../middleware/authMiddleware";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  markAsUnread,
  markAllAsUnread,
  deleteNotifications,
  getUnreadCount,
  deleteAllNotifications,
} from "../controllers/NotificationController";

const router = express.Router();

// Lấy danh sách thông báo
router.get("/", authenticateJWT, getNotifications);

// Lấy số lượng thông báo chưa đọc
router.get("/unread-count", authenticateJWT, getUnreadCount);

// Đánh dấu thông báo đã đọc
router.post("/mark-read", authenticateJWT, markAsRead);

// Đánh dấu tất cả thông báo đã đọc
router.post("/mark-all-read", authenticateJWT, markAllAsRead);

// Đánh dấu thông báo chưa đọc
router.post("/mark-unread", authenticateJWT, markAsUnread);

// Đánh dấu tất cả thông báo chưa đọc
router.post("/mark-all-unread", authenticateJWT, markAllAsUnread);

// Xóa thông báo được chọn
router.delete("/", authenticateJWT, deleteNotifications);

// Xóa tất cả thông báo
router.delete("/all", authenticateJWT, deleteAllNotifications);

export default router;
