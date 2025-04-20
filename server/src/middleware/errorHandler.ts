import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.path} - ${err.message}`)

  // Check if it's an operational error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })
  }

  // For JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token. Please log in again.",
    })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "fail",
      message: "Your token has expired. Please log in again.",
    })
  }

  // For Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({
      status: "fail",
      message: "Database error. Please try again later.",
    })
  }

  // For validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }

  // For all other errors
  console.error("ERROR 💥", err)

  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  })
}
