import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      success: false,
    });
  } else {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
  next();
};
