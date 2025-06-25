import { Request, Response } from "express";
import Notification, { INotification } from "../models/Notification";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

// Tạo notification mới
export const createNotification = async (
  userId: mongoose.Types.ObjectId,
  title: string,
  message: string,
  type: "transaction" | "budget" | "wallet",
  referenceId: mongoose.Types.ObjectId
) => {
  try {
    const notification = new Notification({
      userId: userId.toString(),
      title,
      message,
      type,
      referenceId,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Lấy danh sách notifications của user
export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.authenticatedUser?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ userId });
    const unreadCount = await Notification.countDocuments({
      userId: userId,
      isRead: false,
    });

    res.json({
      notifications,
      total,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ message: "Error getting notifications" });
  }
};

// Đánh dấu notification là đã đọc
export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { notificationIds } = req.body;
    const userId = req.authenticatedUser?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!Array.isArray(notificationIds)) {
      res.status(400).json({ message: "notificationIds must be an array" });
      return;
    }

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId: userId.toString(),
      },
      { $set: { isRead: true } }
    );

    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Error marking notifications as read" });
  }
};

// Đánh dấu tất cả là đã đọc
export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.authenticatedUser?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    await Notification.updateMany(
      { userId: userId },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res
      .status(500)
      .json({ message: "Error marking all notifications as read" });
  }
};

// Đánh dấu notification là chưa đọc
export const markAsUnread = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { notificationIds } = req.body;
    const userId = req.authenticatedUser?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!Array.isArray(notificationIds)) {
      res.status(400).json({ message: "notificationIds must be an array" });
      return;
    }

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId: userId.toString(),
      },
      { $set: { isRead: false } }
    );

    res.json({ message: "Notifications marked as unread" });
  } catch (error) {
    console.error("Error marking notifications as unread:", error);
    res.status(500).json({ message: "Error marking notifications as unread" });
  }
};

// Đánh dấu tất cả là chưa đọc
export const markAllAsUnread = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.authenticatedUser?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    await Notification.updateMany(
      { userId: userId },
      { $set: { isRead: false } }
    );

    res.json({ message: "All notifications marked as unread" });
  } catch (error) {
    console.error("Error marking all notifications as unread:", error);
    res
      .status(500)
      .json({ message: "Error marking all notifications as unread" });
  }
};

// Xóa notification
export const deleteNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { notificationIds } = req.body;
    const userId = req.authenticatedUser?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!Array.isArray(notificationIds)) {
      res.status(400).json({ message: "notificationIds must be an array" });
      return;
    }

    await Notification.deleteMany({
      _id: { $in: notificationIds },
      userId: userId.toString(),
    });

    res.json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    res.status(500).json({ message: "Error deleting notifications" });
  }
};

// Lấy số lượng thông báo chưa đọc
export const getUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.authenticatedUser?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const count = await Notification.countDocuments({
      userId: userId,
      isRead: false,
    });
    res.json({ unreadCount: count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Error getting unread count" });
  }
};

// Xóa tất cả thông báo của user
export const deleteAllNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.authenticatedUser?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    await Notification.deleteMany({ userId: userId });
    res.json({ message: "All notifications deleted successfully" });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ message: "Error deleting all notifications" });
  }
};
