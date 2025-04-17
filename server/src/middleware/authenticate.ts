import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import { AppError } from "../utils/appError"

const prisma = new PrismaClient()

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token

    // Check if token exists in headers or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    } else if (req.cookies.token) {
      token = req.cookies.token
    }

    if (!token) {
      return next(new AppError("You are not logged in. Please log in to get access.", 401))
    }

    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "")

    // Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (!currentUser) {
      return next(new AppError("The user belonging to this token no longer exists.", 401))
    }

    // Grant access to protected route
    req.user = currentUser
    next()
  } catch (error) {
    next(new AppError("Authentication failed. Please log in again.", 401))
  }
}
