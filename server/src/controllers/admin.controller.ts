import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"

const prisma = new PrismaClient()

// Create a new tool
export const createTool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, logo, website, category, pricingPlans, integrations } = req.body

    // Check if tool with same name already exists
    const existingTool = await prisma.saasTool.findFirst({
      where: { name },
    })

    if (existingTool) {
      return next(new AppError("A tool with this name already exists", 400))
    }

    // Create the tool with pricing plans and integrations
    const newTool = await prisma.saasTool.create({
      data: {
        name,
        description,
        logo,
        website,
        category,
        pricingPlans: {
          create: pricingPlans.map((plan: any) => ({
            name: plan.name,
            price: plan.price,
            isCustomPricing: plan.isCustomPricing || false,
            features: {
              create: plan.features.map((feature: string) => ({
                name: feature,
              })),
            },
            limitations: {
              create: (plan.limitations || []).map((limitation: string) => ({
                name: limitation,
              })),
            },
          })),
        },
        integrations: {
          connectOrCreate: (integrations || []).map((integration: string) => ({
            where: { name: integration },
            create: { name: integration },
          })),
        },
      },
      include: {
        pricingPlans: {
          include: {
            features: true,
            limitations: true,
          },
        },
        integrations: true,
      },
    })

    res.status(201).json({
      status: "success",
      data: newTool,
    })
  } catch (error) {
    logger.error("Create tool error:", error)
    next(error)
  }
}

// Update a tool
export const updateTool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { name, description, logo, website, category, pricingPlans, integrations } = req.body

    // Check if tool exists
    const tool = await prisma.saasTool.findUnique({
      where: { id },
      include: {
        pricingPlans: {
          include: {
            features: true,
            limitations: true,
          },
        },
        integrations: true,
      },
    })

    if (!tool) {
      return next(new AppError("Tool not found", 404))
    }

    // Update the tool
    const updatedTool = await prisma.saasTool.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        logo: logo || undefined,
        website: website || undefined,
        category: category || undefined,
      },
      include: {
        pricingPlans: {
          include: {
            features: true,
            limitations: true,
          },
        },
        integrations: true,
      },
    })

    // Update pricing plans if provided
    if (pricingPlans) {
      // Delete existing pricing plans
      await prisma.pricingPlan.deleteMany({
        where: { saasToolId: id },
      })

      // Create new pricing plans
      for (const plan of pricingPlans) {
        await prisma.pricingPlan.create({
          data: {
            name: plan.name,
            price: plan.price,
            isCustomPricing: plan.isCustomPricing || false,
            saasToolId: id,
            features: {
              create: plan.features.map((feature: string) => ({
                name: feature,
              })),
            },
            limitations: {
              create: (plan.limitations || []).map((limitation: string) => ({
                name: limitation,
              })),
            },
          },
        })
      }
    }

    // Update integrations if provided
    if (integrations) {
      // Remove existing integrations
      await prisma.saasTool.update({
        where: { id },
        data: {
          integrations: {
            set: [],
          },
        },
      })

      // Add new integrations
      await prisma.saasTool.update({
        where: { id },
        data: {
          integrations: {
            connectOrCreate: integrations.map((integration: string) => ({
              where: { name: integration },
              create: { name: integration },
            })),
          },
        },
      })
    }

    // Get the updated tool with all relations
    const refreshedTool = await prisma.saasTool.findUnique({
      where: { id },
      include: {
        pricingPlans: {
          include: {
            features: true,
            limitations: true,
          },
        },
        integrations: true,
      },
    })

    res.status(200).json({
      status: "success",
      data: refreshedTool,
    })
  } catch (error) {
    logger.error("Update tool error:", error)
    next(error)
  }
}

// Delete a tool
export const deleteTool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Check if tool exists
    const tool = await prisma.saasTool.findUnique({
      where: { id },
    })

    if (!tool) {
      return next(new AppError("Tool not found", 404))
    }

    // Delete the tool (cascade delete will handle related records)
    await prisma.saasTool.delete({
      where: { id },
    })

    res.status(204).json({
      status: "success",
      data: null,
    })
  } catch (error) {
    logger.error("Delete tool error:", error)
    next(error)
  }
}

// Get all users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.status(200).json({
      status: "success",
      results: users.length,
      data: users,
    })
  } catch (error) {
    logger.error("Get all users error:", error)
    next(error)
  }
}

// Get user by ID
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        company: true,
        jobTitle: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    })

    if (!user) {
      return next(new AppError("User not found", 404))
    }

    res.status(200).json({
      status: "success",
      data: user,
    })
  } catch (error) {
    logger.error("Get user by ID error:", error)
    next(error)
  }
}

// Update user
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { name, email, role, plan, isActive } = req.body

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return next(new AppError("User not found", 404))
    }

    // Check if email is already taken
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return next(new AppError("Email is already taken", 400))
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name || undefined,
        email: email || undefined,
        role: role || undefined,
        plan: plan || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    })

    res.status(200).json({
      status: "success",
      data: updatedUser,
    })
  } catch (error) {
    logger.error("Update user error:", error)
    next(error)
  }
}

// Delete user
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return next(new AppError("User not found", 404))
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    })

    res.status(204).json({
      status: "success",
      data: null,
    })
  } catch (error) {
    logger.error("Delete user error:", error)
    next(error)
  }
}

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get counts of various entities
    const [
      totalUsers,
      totalTools,
      totalComparisons,
      totalReports,
      usersByPlan,
      toolsByCategory
    ] = await Promise.all([
      prisma.user.count(),
      prisma.saasTool.count(),
      prisma.comparison.count(),
      prisma.report.count(),
      prisma.user.groupBy({
        by: ['plan'],
        _count: true
      }),
      prisma.saasTool.groupBy({
        by: ['category'],
        _count: true
      })
    ])

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Get recent tools
    const recentTools = await prisma.saasTool.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Return all stats
    res.status(200).json({
      status: "success",
      data: {
        counts: {
          users: totalUsers,
          tools: totalTools,
          comparisons: totalComparisons,
          reports: totalReports
        },
        usersByPlan,
        toolsByCategory,
        recentUsers,
        recentTools
      }
    })
  } catch (error) {
    logger.error("Get dashboard stats error:", error)
    next(error)
  }
}
