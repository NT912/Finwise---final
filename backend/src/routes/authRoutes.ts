import express, { RequestHandler } from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyResetCode,
} from "../controllers/authController";
import { Router } from "express";
import { authenticateJWT } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

const router = express.Router();

// @ts-ignore
router.post("/register", register as RequestHandler);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
// @ts-ignore
router.post("/login", login as RequestHandler);
// @ts-ignore
router.post("/forgot-password", forgotPassword as RequestHandler);
// @ts-ignore
router.post("/reset-password", resetPassword as RequestHandler);
// @ts-ignore
router.post("/verify-reset-code", verifyResetCode as RequestHandler);

// Thêm route để xác thực token
router.get("/verify", authenticateJWT, (req: AuthenticatedRequest, res) => {
  res.status(200).json({
    valid: true,
    message: "Token is valid",
    user: req.user,
  });
});

export default router;
