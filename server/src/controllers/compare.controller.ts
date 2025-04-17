import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"

const prisma = new PrismaClient()

// Compare tools
export const compareTools = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { toolIds, features } = req.body

    // Get tools with their pricing plans and features
    const tools = await prisma.saasTool.findMany({
      where: {
        id: {
          in: toolIds,
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

    if (tools.length !== toolIds.length) {
      return next(new AppError("One or more tools not found", 404))
    }

    // Create a comparison record
    const comparison = await prisma.comparison.create({
      data: {
        userId: req.user?.id, // Optional, will be null for anonymous comparisons
        tools: {
          connect: toolIds.map((id: string) => ({ id })),
        },
        features: features || [],
      },
    })

    // Format the response
    const formattedTools = tools.map((tool) => {
      return {
        id: tool.id,
        name: tool.name,
        logo: tool.logo,
        description: tool.description,
        category: tool.category,
        website: tool.website,
        pricing: formatPricingPlans(tool.pricingPlans),
        integrations: tool.integrations.map((integration) => integration.name),
        lastUpdated: tool.updatedAt,
      }
    })

    res.status(200).json({
      status: "success",
      data: {
        id: comparison.id,
        tools: formattedTools,
        features: comparison.features,
        createdAt: comparison.createdAt,
      },
    })
  } catch (error) {
    logger.error("Compare tools error:", error)
    next(error)
  }
}

// Get comparison by ID
export const getComparisonById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const comparison = await prisma.comparison.findUnique({
      where: { id },
      include: {
        tools: {
          include: {
            pricingPlans: {
              include: {
                features: true,
                limitations: true,
              },
            },
            integrations: true,
          },
        },
      },
    })

    if (!comparison) {
      return next(new AppError("Comparison not found", 404))
    }

    // Format the response
    const formattedTools = comparison.tools.map((tool) => {
      return {
        id: tool.id,
        name: tool.name,
        logo: tool.logo,
        description: tool.description,
        category: tool.category,
        website: tool.website,
        pricing: formatPricingPlans(tool.pricingPlans),
        integrations: tool.integrations.map((integration) => integration.name),
        lastUpdated: tool.updatedAt,
      }
    })

    res.status(200).json({
      status: "success",
      data: {
        id: comparison.id,
        tools: formattedTools,
        features: comparison.features,
        createdAt: comparison.createdAt,
        userId: comparison.userId,
      },
    })
  } catch (error) {
    logger.error("Get comparison by ID error:", error)
    next(error)
  }
}

// Helper function to format pricing plans
const formatPricingPlans = (pricingPlans: any[]) => {
  const result: any = {}

  pricingPlans.forEach((plan) => {
    const planName = plan.name.toLowerCase()
    result[planName] = {
      price: plan.isCustomPricing ? "Contact for pricing" : plan.price,
      features: plan.features.map((feature: any) => feature.name),
      limitations: plan.limitations.map((limitation: any) => limitation.name),
    }
  })

  return result
}
