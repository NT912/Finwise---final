import { Response } from "express";
import { ApiError } from "./ApiError";

export const handleApiError = (error: any, res: Response) => {
  console.error("Error:", error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
