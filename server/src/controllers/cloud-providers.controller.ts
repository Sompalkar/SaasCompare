import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Get all cloud providers
export const getAllCloudProviders = async (req: Request, res: Response) => {
  try {
    const providers = await prisma.cloudProvider.findMany({
      include: {
        services: true,
      },
    })

    return res.status(200).json({ success: true, data: providers })
  } catch (error) {
    console.error("Error fetching cloud providers:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch cloud providers" })
  }
}

// Get cloud provider by ID
export const getCloudProviderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const provider = await prisma.cloudProvider.findUnique({
      where: { id },
      include: {
        services: true,
      },
    })

    if (!provider) {
      return res.status(404).json({ success: false, message: "Cloud provider not found" })
    }

    return res.status(200).json({ success: true, data: provider })
  } catch (error) {
    console.error("Error fetching cloud provider:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch cloud provider" })
  }
}

// Compare cloud providers
export const compareCloudProviders = async (req: Request, res: Response) => {
  try {
    const { providerIds, serviceTypes } = req.body
    const userId = req.user?.id // Optional, user might not be logged in

    // Validate input
    const schema = z.object({
      providerIds: z.array(z.string()).min(1, "At least one provider ID is required"),
      serviceTypes: z.array(z.string()).optional(),
    })

    const validation = schema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors,
      })
    }

    // Get providers with services
    const providers = await prisma.cloudProvider.findMany({
      where: {
        id: {
          in: providerIds,
        },
      },
      include: {
        services: serviceTypes?.length
          ? {
              where: {
                type: {
                  in: serviceTypes,
                },
              },
            }
          : true,
      },
    })

    if (providers.length === 0) {
      return res.status(404).json({ success: false, message: "No cloud providers found" })
    }

    // Extract all service types for comparison
    const allServiceTypes = new Set<string>()
    providers.forEach((provider) => {
      provider.services.forEach((service) => {
        allServiceTypes.add(service.type)
      })
    })

    // Create comparison data
    const comparisonData = {
      providers: providers.map((provider) => ({
        id: provider.id,
        name: provider.name,
        logo: provider.logo,
        services: provider.services.map((service) => ({
          id: service.id,
          name: service.name,
          type: service.type,
          description: service.description,
          pricing: {
            free: service.freePrice,
            basic: service.basicPrice,
            standard: service.standardPrice,
            premium: service.premiumPrice,
            enterprise: service.enterprisePrice,
          },
          features: {
            free: service.freeFeatures,
            basic: service.basicFeatures,
            standard: service.standardFeatures,
            premium: service.premiumFeatures,
            enterprise: service.enterpriseFeatures,
          },
          limitations: {
            free: service.freeLimitations,
            basic: service.basicLimitations,
            standard: service.standardLimitations,
            premium: service.premiumLimitations,
            enterprise: service.enterpriseLimitations,
          },
        })),
      })),
      serviceTypes: Array.from(allServiceTypes),
    }

    // Save comparison if user is logged in
    let savedComparison = null
    if (userId) {
      const comparison = await prisma.comparison.create({
        data: {
          userId,
          features: Array.from(allServiceTypes),
          metadata: {
            type: "CLOUD_PROVIDER",
            providerIds,
            serviceTypes: Array.from(allServiceTypes),
            comparisonData,
          },
        },
      })

      savedComparison = comparison.id
    }

    return res.status(200).json({
      success: true,
      data: {
        comparison: comparisonData,
        savedComparisonId: savedComparison,
      },
    })
  } catch (error) {
    console.error("Error comparing cloud providers:", error)
    return res.status(500).json({ success: false, message: "Failed to compare cloud providers" })
  }
}

// Get comparison by ID
export const getComparisonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const comparison = await prisma.comparison.findUnique({
      where: { id },
    })

    if (!comparison) {
      return res.status(404).json({ success: false, message: "Comparison not found" })
    }

    // Parse metadata to get comparison data
    const metadata = comparison.metadata as any
    const comparisonData = metadata?.comparisonData || {}

    return res.status(200).json({
      success: true,
      data: {
        id: comparison.id,
        features: comparison.features,
        comparisonData,
        createdAt: comparison.createdAt,
      },
    })
  } catch (error) {
    console.error("Error fetching comparison:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch comparison" })
  }
}

// Get all comparisons for a user
export const getAllComparisons = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id

    const comparisons = await prisma.comparison.findMany({
      where: {
        userId,
        metadata: {
          path: ["type"],
          equals: "CLOUD_PROVIDER",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Format response
    const formattedComparisons = comparisons.map((comparison) => {
      const metadata = comparison.metadata as any
      return {
        id: comparison.id,
        features: comparison.features,
        providerIds: metadata?.providerIds || [],
        serviceTypes: metadata?.serviceTypes || [],
        createdAt: comparison.createdAt,
      }
    })

    return res.status(200).json({ success: true, data: formattedComparisons })
  } catch (error) {
    console.error("Error fetching comparisons:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch comparisons" })
  }
}

// Update comparison name
export const updateComparisonName = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name } = req.body
    const userId = req.user.id

    // Validate input
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" })
    }

    // Check if comparison exists and belongs to user
    const existingComparison = await prisma.comparison.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingComparison) {
      return res.status(404).json({ success: false, message: "Comparison not found or not owned by user" })
    }

    // Update metadata with name
    const metadata = (existingComparison.metadata as any) || {}
    metadata.name = name

    // Update comparison
    const updatedComparison = await prisma.comparison.update({
      where: { id },
      data: {
        metadata,
      },
    })

    return res.status(200).json({
      success: true,
      data: {
        id: updatedComparison.id,
        name,
        features: updatedComparison.features,
        metadata: updatedComparison.metadata,
        createdAt: updatedComparison.createdAt,
      },
    })
  } catch (error) {
    console.error("Error updating comparison name:", error)
    return res.status(500).json({ success: false, message: "Failed to update comparison name" })
  }
}

// Delete comparison
export const deleteComparison = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Check if comparison exists and belongs to user
    const existingComparison = await prisma.comparison.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingComparison) {
      return res.status(404).json({ success: false, message: "Comparison not found or not owned by user" })
    }

    // Delete comparison
    await prisma.comparison.delete({
      where: { id },
    })

    return res.status(200).json({
      success: true,
      message: "Comparison deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting comparison:", error)
    return res.status(500).json({ success: false, message: "Failed to delete comparison" })
  }
}
