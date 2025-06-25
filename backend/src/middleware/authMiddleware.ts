import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { env_dev } from "../config/configApp";

// ✅ Định nghĩa kiểu mở rộng cho Request
export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

// ✅ Middleware xác thực JWT
export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      console.log("❌ No Authorization header found");
      res.status(401).json({ message: "Unauthorized - No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("❌ No token in Authorization header");
      res.status(401).json({ message: "Unauthorized - Invalid token format" });
      return;
    }

    // Check if JWT_SECRET exists
    if (!env_dev.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, env_dev.JWT_SECRET) as {
      userId: string;
    };

    if (!decoded || !decoded.userId) {
      console.log(
        "❌ Invalid token or missing userId in token payload:",
        decoded
      );
      res.status(401).json({ message: "Unauthorized - Invalid token" });
      return;
    }

    console.log(`✅ Token verified successfully. UserId: ${decoded.userId}`);

    // Find user in DB
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log(`❌ User not found in database for ID: ${decoded.userId}`);
      res.status(401).json({ message: "Unauthorized - User not found" });
      return;
    }

    console.log(`✅ User found in database: ${user.email}`);

    // Set user info in request object
    req.user = { userId: decoded.userId };
    console.log(`✅ Set req.user to:`, req.user);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res
      .status(401)
      .json({ message: "Unauthorized - Token verification failed" });
  }
};
