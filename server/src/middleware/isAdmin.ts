import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/appError"

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("You do not have permission to perform this action", 403))
  }
  next()
}
