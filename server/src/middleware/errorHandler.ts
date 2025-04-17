import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err }
  error.message = err.message

  // Log the error
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack })

  // Handle specific error types
  if (err.name === "CastError") {
    const message = `Invalid ${(err as any).path}: ${(err as any).value}`
    error = new AppError(message, 400)
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(", ")
    error = new AppError(message, 400)
  }

  // Handle duplicate key errors
  if ((err as any).code === 11000) {
    const message = `Duplicate field value entered`
    error = new AppError(message, 400)
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again."
    error = new AppError(message, 401)
  }

  if (err.name === "TokenExpiredError") {
    const message = "Your token has expired. Please log in again."
    error = new AppError(message, 401)
  }

  // Send error response
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    })
  } else {
    // For unknown errors
    console.error("ERROR 💥", err)
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    })
  }
}
