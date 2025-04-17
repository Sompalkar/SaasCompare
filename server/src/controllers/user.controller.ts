import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"

const prisma = new PrismaClient()

// Get user's saved comparisons
export const getUserComparisons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id

    const savedComparisons = await prisma.savedComparison.findMany({
      where: { userId },
      include: {
        comparison: {
          include: {
            tools: {
              select: {
                id: true,
                name: true,
                logo: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.status(200).json({
      status: "success",
      results: savedComparisons.length,
      data: savedComparisons,
    })
  } catch (error) {
    logger.error("Get user comparisons error:", error)
    next(error)
  }
}

// Save a comparison
export const saveComparison = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id
    const { comparisonId, name } = req.body

    // Check if comparison exists
    const comparison = await prisma.comparison.findUnique({
      where: { id: comparisonId },
    })

    if (!comparison) {
      return next(new AppError("Comparison not found", 404))
    }

    // Check if user has already saved this comparison
    const existingSaved = await prisma.savedComparison.findFirst({
      where: {
        userId,
        comparisonId,
      },
    })

    if (existingSaved) {
      return next(new AppError("You have already saved this comparison", 400))
    }

    // Save the comparison
    const savedComparison = await prisma.savedComparison.create({
      data: {
        name,
        userId,
        comparisonId,
      },
      include: {
        comparison: {
          include: {
            tools: {
              select: {
                id: true,
                name: true,
                logo: true,
                category: true,
              },
            },
          },
        },
      },
    })

    res.status(201).json({
      status: "success",
      data: savedComparison,
    })
  } catch (error) {
    logger.error("Save comparison error:", error)
    next(error)
  }
}

// Delete a saved comparison
export const deleteComparison = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    // Check if saved comparison exists and belongs to user
    const savedComparison = await prisma.savedComparison.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!savedComparison) {
      return next(new AppError("Saved comparison not found", 404))
    }

    // Delete the saved comparison
    await prisma.savedComparison.delete({
      where: { id },
    })

    res.status(204).json({
      status: "success",
      data: null,
    })
  } catch (error) {
    logger.error("Delete comparison error:", error)
    next(error)
  }
}

// Update user profile
export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id
    const { name, email, company, jobTitle } = req.body

    // Check if email is already taken
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return next(new AppError("Email is already taken", 400))
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined,
        company: company || undefined,
        jobTitle: jobTitle || undefined,
      },
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser

    res.status(200).json({
      status: "success",
      data: userWithoutPassword,
    })
  } catch (error) {
    logger.error("Update user profile error:", error)
    next(error)
  }
}

// Get user reports
export const getUserReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id

    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.status(200).json({
      status: "success",
      results: reports.length,
      data: reports,
    })
  } catch (error) {
    logger.error("Get user reports error:", error)
    next(error)
  }
}
