import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"

const prisma = new PrismaClient()

// Get all tools with optional pagination
export const getAllTools = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await prisma.saasTool.count()

    // Get tools with pagination
    const tools = await prisma.saasTool.findMany({
      skip,
      take: limit,
      include: {
        pricingPlans: {
          include: {
            features: true,
            limitations: true,
          },
        },
        integrations: true,
      },
      orderBy: {
        name: "asc",
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
      results: tools.length,
      pagination: {
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit),
        limit,
      },
      data: formattedTools,
    })
  } catch (error) {
    logger.error("Get all tools error:", error)
    next(error)
  }
}

// Get tool by ID
export const getToolById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

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

    // Format the response
    const formattedTool = {
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

    res.status(200).json({
      status: "success",
      data: formattedTool,
    })
  } catch (error) {
    logger.error("Get tool by ID error:", error)
    next(error)
  }
}

// Get tools by category
export const getToolsByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.params
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await prisma.saasTool.count({
      where: { category },
    })

    // Get tools by category with pagination
    const tools = await prisma.saasTool.findMany({
      where: { category },
      skip,
      take: limit,
      include: {
        pricingPlans: {
          include: {
            features: true,
            limitations: true,
          },
        },
        integrations: true,
      },
      orderBy: {
        name: "asc",
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
      results: tools.length,
      pagination: {
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit),
        limit,
      },
      data: formattedTools,
    })
  } catch (error) {
    logger.error("Get tools by category error:", error)
    next(error)
  }
}

// Search tools
export const searchTools = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, category, minPrice, maxPrice, integrations } = req.query
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    // Build the where clause
    const where: any = {}

    // Search by name or description
    if (query) {
      where.OR = [
        { name: { contains: query as string, mode: "insensitive" } },
        { description: { contains: query as string, mode: "insensitive" } },
      ]
    }

    // Filter by category
    if (category) {
      where.category = category as string
    }

    // Get tools with filters
    const tools = await prisma.saasTool.findMany({
      where,
      skip,
      take: limit,
      include: {
        pricingPlans: {
          include: {
            features: true,
            limitations: true,
          },
        },
        integrations: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    // Apply price and integration filters in memory (since they require joins)
    let filteredTools = tools

    // Filter by price range
    if (minPrice || maxPrice) {
      filteredTools = filteredTools.filter((tool) => {
        const min = minPrice ? Number.parseFloat(minPrice as string) : 0
        const max = maxPrice ? Number.parseFloat(maxPrice as string) : Number.POSITIVE_INFINITY

        // Check if any pricing plan falls within the range
        return tool.pricingPlans.some((plan) => {
          if (plan.price === null) return false
          return plan.price >= min && plan.price <= max
        })
      })
    }

    // Filter by integrations
    if (integrations) {
      const requiredIntegrations = (integrations as string).split(",")
      filteredTools = filteredTools.filter((tool) => {
        const toolIntegrations = tool.integrations.map((i) => i.name.toLowerCase())
        return requiredIntegrations.every((integration) => toolIntegrations.includes(integration.toLowerCase()))
      })
    }

    // Get total count for pagination (after filtering)
    const totalCount = filteredTools.length

    // Format the response
    const formattedTools = filteredTools.map((tool) => {
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
      results: formattedTools.length,
      pagination: {
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit),
        limit,
      },
      data: formattedTools,
    })
  } catch (error) {
    logger.error("Search tools error:", error)
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
