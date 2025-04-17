import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"

const prisma = new PrismaClient()

// Get all cloud providers
export const getAllProviders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await prisma.cloudProvider.count()

    // Get providers with pagination
    const providers = await prisma.cloudProvider.findMany({
      skip,
      take: limit,
      include: {
        services: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    // Format the response
    const formattedProviders = providers.map((provider) => {
      return {
        id: provider.id,
        name: provider.name,
        logo: provider.logo,
        description: provider.description,
        website: provider.website,
        services: provider.services.map((service) => ({
          id: service.id,
          name: service.name,
          type: service.type,
          description: service.description,
          pricing: {
            free: service.freePrice
              ? {
                  price: service.freePrice,
                  features: service.freeFeatures,
                  limitations: service.freeLimitations,
                }
              : null,
            basic: service.basicPrice
              ? {
                  price: service.basicPrice,
                  features: service.basicFeatures,
                  limitations: service.basicLimitations,
                }
              : null,
            standard: service.standardPrice
              ? {
                  price: service.standardPrice,
                  features: service.standardFeatures,
                  limitations: service.standardLimitations,
                }
              : null,
            premium: service.premiumPrice
              ? {
                  price: service.premiumPrice,
                  features: service.premiumFeatures,
                  limitations: service.premiumLimitations,
                }
              : null,
            enterprise: service.enterprisePrice
              ? {
                  price: service.enterprisePrice,
                  features: service.enterpriseFeatures,
                  limitations: service.enterpriseLimitations,
                }
              : null,
          },
        })),
        lastUpdated: provider.updatedAt,
      }
    })

    res.status(200).json({
      status: "success",
      results: providers.length,
      pagination: {
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit),
        limit,
      },
      data: formattedProviders,
    })
  } catch (error) {
    logger.error("Get all cloud providers error:", error)
    next(error)
  }
}

// Get cloud provider by ID
export const getProviderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const provider = await prisma.cloudProvider.findUnique({
      where: { id },
      include: {
        services: true,
      },
    })

    if (!provider) {
      return next(new AppError("Cloud provider not found", 404))
    }

    // Format the response
    const formattedProvider = {
      id: provider.id,
      name: provider.name,
      logo: provider.logo,
      description: provider.description,
      website: provider.website,
      services: provider.services.map((service) => ({
        id: service.id,
        name: service.name,
        type: service.type,
        description: service.description,
        pricing: {
          free: service.freePrice
            ? {
                price: service.freePrice,
                features: service.freeFeatures,
                limitations: service.freeLimitations,
              }
            : null,
          basic: service.basicPrice
            ? {
                price: service.basicPrice,
                features: service.basicFeatures,
                limitations: service.basicLimitations,
              }
            : null,
          standard: service.standardPrice
            ? {
                price: service.standardPrice,
                features: service.standardFeatures,
                limitations: service.standardLimitations,
              }
            : null,
          premium: service.premiumPrice
            ? {
                price: service.premiumPrice,
                features: service.premiumFeatures,
                limitations: service.premiumLimitations,
              }
            : null,
          enterprise: service.enterprisePrice
            ? {
                price: service.enterprisePrice,
                features: service.enterpriseFeatures,
                limitations: service.enterpriseLimitations,
              }
            : null,
        },
      })),
      lastUpdated: provider.updatedAt,
    }

    res.status(200).json({
      status: "success",
      data: formattedProvider,
    })
  } catch (error) {
    logger.error("Get cloud provider by ID error:", error)
    next(error)
  }
}

// Compare cloud providers
export const compareProviders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { providerIds, serviceTypes } = req.body

    // Get providers with their services
    const providers = await prisma.cloudProvider.findMany({
      where: {
        id: {
          in: providerIds,
        },
      },
      include: {
        services: {
          where: serviceTypes
            ? {
                type: {
                  in: serviceTypes,
                },
              }
            : undefined,
        },
      },
    })

    if (providers.length !== providerIds.length) {
      return next(new AppError("One or more cloud providers not found", 404))
    }

    // Create a comparison record
    const comparison = await prisma.comparison.create({
      data: {
        userId: req.user?.id, // Optional, will be null for anonymous comparisons
        tools: {
          connect: [], // Cloud providers are not tools, so we leave this empty
        },
        features: serviceTypes || [],
        metadata: {
          type: "CLOUD_PROVIDER",
          providerIds,
        },
      },
    })

    // Format the response
    const formattedProviders = providers.map((provider) => {
      return {
        id: provider.id,
        name: provider.name,
        logo: provider.logo,
        description: provider.description,
        website: provider.website,
        services: provider.services.map((service) => ({
          id: service.id,
          name: service.name,
          type: service.type,
          description: service.description,
          pricing: {
            free: service.freePrice
              ? {
                  price: service.freePrice,
                  features: service.freeFeatures,
                  limitations: service.freeLimitations,
                }
              : null,
            basic: service.basicPrice
              ? {
                  price: service.basicPrice,
                  features: service.basicFeatures,
                  limitations: service.basicLimitations,
                }
              : null,
            standard: service.standardPrice
              ? {
                  price: service.standardPrice,
                  features: service.standardFeatures,
                  limitations: service.standardLimitations,
                }
              : null,
            premium: service.premiumPrice
              ? {
                  price: service.premiumPrice,
                  features: service.premiumFeatures,
                  limitations: service.premiumLimitations,
                }
              : null,
            enterprise: service.enterprisePrice
              ? {
                  price: service.enterprisePrice,
                  features: service.enterpriseFeatures,
                  limitations: service.enterpriseLimitations,
                }
              : null,
          },
        })),
        lastUpdated: provider.updatedAt,
      }
    })

    res.status(200).json({
      status: "success",
      data: {
        id: comparison.id,
        providers: formattedProviders,
        serviceTypes: serviceTypes || [],
        createdAt: comparison.createdAt,
      },
    })
  } catch (error) {
    logger.error("Compare cloud providers error:", error)
    next(error)
  }
}

// Get service types
export const getServiceTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all unique service types
    const services = await prisma.cloudService.findMany({
      select: {
        type: true,
      },
      distinct: ["type"],
      orderBy: {
        type: "asc",
      },
    })

    const serviceTypes = services.map((service) => service.type)

    res.status(200).json({
      status: "success",
      data: serviceTypes,
    })
  } catch (error) {
    logger.error("Get service types error:", error)
    next(error)
  }
}
