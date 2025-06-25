import jwt from "jsonwebtoken";
import { Request } from "express";
import { env_dev } from "../config/configApp";

export const getUserIdFromToken = async (req: Request): Promise<string> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new Error("No token provided");
  }

  const decoded = jwt.verify(token, env_dev.JWT_SECRET) as { userId: string };
  return decoded.userId;
};
