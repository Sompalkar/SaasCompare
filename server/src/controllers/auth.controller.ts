import type { Request, Response, NextFunction } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { PrismaClient, UserPlan } from "@prisma/client"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"

const prisma = new PrismaClient()

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  })
}

// Set token cookie
const sendTokenCookie = (res: Response, token: string) => {
  const cookieOptions = {
    expires: new Date(Date.now() + Number.parseInt(process.env.JWT_COOKIE_EXPIRES_IN || "7") * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  }

  res.cookie("token", token, cookieOptions)
}

// Register a new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return next(new AppError("User with this email already exists", 400))
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        plan: UserPlan.FREE,
      },
    })

    // Generate token
    const token = generateToken(newUser.id)

    // Send token as cookie
    sendTokenCookie(res, token)

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser

    res.status(201).json({
      status: "success",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    logger.error("Registration error:", error)
    next(error)
  }
}

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError("Invalid email or password", 401))
    }

    // Generate token
    const token = generateToken(user.id)

    // Send token as cookie
    sendTokenCookie(res, token)

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      status: "success",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    logger.error("Login error:", error)
    next(error)
  }
}

// Logout user
export const logout = (req: Request, res: Response) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.status(200).json({ status: "success" })
}

// Get current user
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // User is already attached to req by the authenticate middleware
    const user = req.user

    res.status(200).json({
      status: "success",
      user,
    })
  } catch (error) {
    logger.error("Get current user error:", error)
    next(error)
  }
}

// Refresh token
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie
    const token = req.cookies.token

    if (!token) {
      return next(new AppError("Not authenticated", 401))
    }

    // Verify token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    } catch (err) {
      return next(new AppError("Invalid or expired token", 401))
    }

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      return next(new AppError("User no longer exists", 401))
    }

    // Generate new token
    const newToken = generateToken(user.id)

    // Send new token as cookie
    sendTokenCookie(res, newToken)

    res.status(200).json({
      status: "success",
      token: newToken,
    })
  } catch (error) {
    logger.error("Refresh token error:", error)
    next(error)
  }
}

// Forgot password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return next(new AppError("No user found with that email address", 404))
    }

    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Save it to the database with an expiry
    // 3. Send an email with a reset link

    // For this demo, we'll just acknowledge the request
    res.status(200).json({
      status: "success",
      message: "Password reset instructions sent to email",
    })
  } catch (error) {
    logger.error("Forgot password error:", error)
    next(error)
  }
}

// Reset password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body

    // In a real application, you would:
    // 1. Verify the reset token
    // 2. Check if it's expired
    // 3. Update the user's password

    // For this demo, we'll just acknowledge the request
    res.status(200).json({
      status: "success",
      message: "Password has been reset successfully",
    })
  } catch (error) {
    logger.error("Reset password error:", error)
    next(error)
  }
}
