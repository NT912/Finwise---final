import express from "express";
import multer from "multer";
import path from "path";
import {
  getProfile,
  updateProfile,
  changePassword,
  updateNotifications,
  deleteAccount,
  uploadAvatar,
  sendPasswordChangeCode,
  scanReceipt,
} from "../controllers/userController";
import { authenticateJWT } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

const router = express.Router();

// Cấu hình multer để upload avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "avatar-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (ext && mimetype) {
      return cb(null, true);
    }

    cb(new Error("Only images are allowed"));
  },
});

// Routes
router.get("/profile", authenticateJWT, getProfile);

router.put("/profile/update", authenticateJWT, updateProfile);
router.post("/profile/change-password", authenticateJWT, changePassword);
router.post(
  "/profile/send-password-change-code",
  authenticateJWT,
  sendPasswordChangeCode
);
router.put("/profile/notifications", authenticateJWT, updateNotifications);
router.delete("/profile/delete", authenticateJWT, deleteAccount);
router.post(
  "/profile/upload-avatar",
  authenticateJWT,
  upload.single("avatar"),
  uploadAvatar
);

// Add a receipt scan route
router.post("/receipts/scan", upload.single("receipt"), scanReceipt);

// Thêm validate-token endpoint
router.get(
  "/validate-token",
  authenticateJWT,
  (req: AuthenticatedRequest, res) => {
    res.status(200).json({
      valid: true,
      message: "Token is valid",
      user: req.user,
    });
  }
);

export default router;
