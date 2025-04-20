import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/appError"
import { prisma } from "../utils/prisma"
import * as scrapingService from "../services/scraping.service"
import { logger } from "../utils/logger"

// Get all tools
export const getAllTools = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use the SaasTool model from Prisma
    const tools = await prisma.saasTool.findMany({
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

    // Format the response
    const formattedTools = tools.map((tool) => formatToolResponse(tool))

    res.status(200).json({
      status: "success",
      data: formattedTools,
    })
  } catch (error) {
    next(error)
  }
}

// Get tool by ID
export const getToolById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Use the SaasTool model from Prisma
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
    const formattedTool = formatToolResponse(tool)

    res.status(200).json({
      status: "success",
      data: formattedTool,
    })
  } catch (error) {
    next(error)
  }
}

// Create tool
export const createTool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, category, website, logo, pricingPlans, integrations } = req.body

    // Create the tool
    const tool = await prisma.saasTool.create({
      data: {
        name,
        description: description || "",
        category,
        website,
        logo: logo || "",
      },
    })

    // Create pricing plans
    if (pricingPlans && Array.isArray(pricingPlans)) {
      for (const plan of pricingPlans) {
        const { name, price, isCustomPricing, features, limitations } = plan

        const pricingPlan = await prisma.pricingPlan.create({
          data: {
            name,
            price: isCustomPricing ? null : price,
            isCustomPricing,
            saasToolId: tool.id,
          },
        })

        // Create features
        if (features && Array.isArray(features)) {
          await prisma.feature.createMany({
            data: features.map((feature: string) => ({
              name: feature,
              pricingPlanId: pricingPlan.id,
            })),
          })
        }

        // Create limitations
        if (limitations && Array.isArray(limitations)) {
          await prisma.limitation.createMany({
            data: limitations.map((limitation: string) => ({
              name: limitation,
              pricingPlanId: pricingPlan.id,
            })),
          })
        }
      }
    }

    // Create integrations
    if (integrations && Array.isArray(integrations)) {
      await prisma.integration.createMany({
        data: integrations.map((integration: string) => ({
          name: integration,
          saasToolId: tool.id,
        })),
        skipDuplicates: true,
      })
    }

    res.status(201).json({
      status: "success",
      data: {
        id: tool.id,
        name: tool.name,
        description: tool.description,
        category: tool.category,
        website: tool.website,
        logo: tool.logo,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Update tool
export const updateTool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { name, description, category, website, logo } = req.body

    // Check if tool exists
    const existingTool = await prisma.saasTool.findUnique({
      where: { id },
    })

    if (!existingTool) {
      return next(new AppError("Tool not found", 404))
    }

    // Update tool
    const updatedTool = await prisma.saasTool.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        category: category || undefined,
        website: website || undefined,
        logo: logo || undefined,
      },
    })

    res.status(200).json({
      status: "success",
      data: updatedTool,
    })
  } catch (error) {
    next(error)
  }
}

// Delete tool
export const deleteTool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Check if tool exists
    const existingTool = await prisma.saasTool.findUnique({
      where: { id },
    })

    if (!existingTool) {
      return next(new AppError("Tool not found", 404))
    }

    // Delete tool
    await prisma.saasTool.delete({
      where: { id },
    })

    res.status(204).json({
      status: "success",
      data: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Search tools based on various criteria
 */
export const searchTools = async (req: Request, res: Response) => {
  try {
    const { query, category, minPrice, maxPrice, integrations } = req.query;
    
    // Build the database query
    const dbQuery: any = {};
    
    // Text search if query is provided
    if (query) {
      dbQuery.OR = [
        { name: { contains: query as string, mode: 'insensitive' } },
        { description: { contains: query as string, mode: 'insensitive' } }
      ];
    }
    
    // Category filter
    if (category) {
      dbQuery.category = { equals: category as string };
    }
    
    // Price range filters - more complex and would require JOINs with pricing tables
    // This is simplified for demonstration
    
    // Integration filters - would require a JOIN with the integration tables
    // Also simplified here
    
    const tools = await prisma.saasTool.findMany({
      where: dbQuery,
      take: 10, // Limit to 10 results
      include: {
        pricingPlans: {
          include: {
            features: true,
            limitations: true,
          },
        },
        integrations: true,
      },
    });
    
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
        integrations: tool.integrations.map(integration => integration.name),
        lastUpdated: tool.updatedAt,
      };
    });
    
    return res.status(200).json({
      success: true,
      data: formattedTools
    });
  } catch (error) {
    logger.error('Error searching tools', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search tools'
    });
  }
};

/**
 * Get historical pricing data for a tool
 */
export const getToolHistoricalData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if tool exists
    const tool = await prisma.saasTool.findUnique({
      where: { id }
    });
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Tool not found'
      });
    }
    
    // Get historical pricing data
    const historicalData = await prisma.pricingHistory.findMany({
      where: {
        toolId: id
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
    
    // Format the data
    const formattedData = formatHistoricalData([id], historicalData);
    
    return res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    logger.error('Error getting historical data', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get historical data'
    });
  }
};

/**
 * Get featured tools
 */
export const getFeaturedTools = async (req: Request, res: Response) => {
  try {
    // In a real app, you'd have a featured flag or table
    // Here we just return some tools as featured
    const featuredTools = await prisma.saasTool.findMany({
      take: 6,
      include: {
        pricingPlans: {
          include: {
            features: true,
            limitations: true,
          },
        },
        integrations: true,
      },
    });
    
    // Format the response
    const formattedTools = featuredTools.map((tool) => {
      return {
        id: tool.id,
        name: tool.name,
        logo: tool.logo,
        description: tool.description,
        category: tool.category,
        website: tool.website,
        pricing: formatPricingPlans(tool.pricingPlans),
        integrations: tool.integrations.map(integration => integration.name),
        lastUpdated: tool.updatedAt,
      };
    });
    
    return res.status(200).json({
      success: true,
      data: formattedTools
    });
  } catch (error) {
    logger.error('Error getting featured tools', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get featured tools'
    });
  }
};

/**
 * Get popular tools
 */
export const getPopularTools = async (req: Request, res: Response) => {
  try {
    // In a real app, you'd determine popularity by usage metrics
    // Here we just return some tools as popular
    const popularTools = await prisma.saasTool.findMany({
      take: 6,
      orderBy: {
        createdAt: 'desc' // Just using recent tools as a proxy for popular
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
    });
    
    // Format the response
    const formattedTools = popularTools.map((tool) => {
      return {
        id: tool.id,
        name: tool.name,
        logo: tool.logo,
        description: tool.description,
        category: tool.category,
        website: tool.website,
        pricing: formatPricingPlans(tool.pricingPlans),
        integrations: tool.integrations.map(integration => integration.name),
        lastUpdated: tool.updatedAt,
      };
    });
    
    return res.status(200).json({
      success: true,
      data: formattedTools
    });
  } catch (error) {
    logger.error('Error getting popular tools', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get popular tools'
    });
  }
};

/**
 * Scrape tool data from a website
 */
export const scrapeToolData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url, toolId } = req.body;
    
    // Check if the URL is valid
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required for scraping'
      });
    }
    
    // If toolId is provided, check if it exists
    if (toolId) {
      const existingTool = await prisma.saasTool.findUnique({
        where: { id: toolId }
      });
      
      if (!existingTool) {
        return res.status(404).json({
          success: false,
          message: 'Tool not found'
        });
      }
    }
    
    // Create a scraping job
    const job = await prisma.scrapingJob.create({
      data: {
        url,
        toolId: toolId || null,
        type: 'PRICING',
        status: 'PENDING',
        schedule: 'ONCE',
        createdBy: req.user?.id as string
      }
    });
    
    // Start scraping process asynchronously
    scrapingService.scrapePricingPage(url)
      .then(async (data) => {
        // Update the tool if toolId was provided
        if (toolId) {
          // Update basic info
          await prisma.saasTool.update({
            where: { id: toolId },
            data: {
              description: data.description || undefined,
              website: data.website || undefined
            }
          });
          
          // Update or create pricing plans
          for (const plan of data.pricingPlans) {
            // Find existing plan with the same name or create a new one
            const existingPlan = await prisma.pricingPlan.findFirst({
              where: {
                saasToolId: toolId,
                name: plan.name
              }
            });
            
            if (existingPlan) {
              // Update existing plan
              await prisma.pricingPlan.update({
                where: { id: existingPlan.id },
                data: {
                  price: plan.price,
                  isCustomPricing: plan.price === null
                }
              });
              
              // Update features
              if (plan.features.length > 0) {
                // Delete existing features
                await prisma.feature.deleteMany({
                  where: { pricingPlanId: existingPlan.id }
                });
                
                // Create new features
                await prisma.feature.createMany({
                  data: plan.features.map(feature => ({
                    name: feature,
                    pricingPlanId: existingPlan.id
                  }))
                });
              }
              
              // Update limitations
              if (plan.limitations.length > 0) {
                // Delete existing limitations
                await prisma.limitation.deleteMany({
                  where: { pricingPlanId: existingPlan.id }
                });
                
                // Create new limitations
                await prisma.limitation.createMany({
                  data: plan.limitations.map(limitation => ({
                    name: limitation,
                    pricingPlanId: existingPlan.id
                  }))
                });
              }
            } else {
              // Create new plan
              const newPlan = await prisma.pricingPlan.create({
                data: {
                  name: plan.name,
                  price: plan.price,
                  isCustomPricing: plan.price === null,
                  saasToolId: toolId
                }
              });
              
              // Create features
              if (plan.features.length > 0) {
                await prisma.feature.createMany({
                  data: plan.features.map(feature => ({
                    name: feature,
                    pricingPlanId: newPlan.id
                  }))
                });
              }
              
              // Create limitations
              if (plan.limitations.length > 0) {
                await prisma.limitation.createMany({
                  data: plan.limitations.map(limitation => ({
                    name: limitation,
                    pricingPlanId: newPlan.id
                  }))
                });
              }
            }
          }
          
          // Update integrations
          for (const integration of data.integrations) {
            // Find or create integration
            let integrationRecord = await prisma.integration.findUnique({
              where: { name: integration }
            });
            
            if (!integrationRecord) {
              integrationRecord = await prisma.integration.create({
                data: { name: integration }
              });
            }
            
            // Connect integration to tool if not already connected
            const existingConnection = await prisma.$queryRaw`
              SELECT * FROM "_IntegrationToSaasTool" 
              WHERE "A" = ${integrationRecord.id} AND "B" = ${toolId}
            `;
            
            if (Array.isArray(existingConnection) && !existingConnection.length) {
              await prisma.$executeRaw`
                INSERT INTO "_IntegrationToSaasTool" ("A", "B") 
                VALUES (${integrationRecord.id}, ${toolId})
              `;
            }
          }
        }
        
        // Update the job with success result
        await prisma.scrapingJob.update({
          where: { id: job.id },
          data: {
            status: 'COMPLETED',
            result: JSON.stringify(data),
            completedAt: new Date()
          }
        });
      })
      .catch(async (error) => {
        // Update the job with error
        await prisma.scrapingJob.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            error: error instanceof Error ? error.message : String(error),
            completedAt: new Date()
          }
        });
      });
    
    return res.status(202).json({
      success: true,
      message: 'Scraping job created and started',
      data: {
        jobId: job.id,
        status: job.status
      }
    });
  } catch (error) {
    logger.error('Error initiating scraping job:', error);
    return next(error);
  }
};

// Helper function to format tool response
const formatToolResponse = (tool: any) => {
  return {
    id: tool.id,
    name: tool.name,
    logo: tool.logo,
    description: tool.description,
    category: tool.category,
    website: tool.website,
    pricing: formatPricingPlans(tool.pricingPlans),
    integrations: tool.integrations.map((integration: any) => integration.name),
    lastUpdated: tool.updatedAt,
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

// Helper function to format historical data
function formatHistoricalData(toolIds: string[], historicalData: any[]) {
  // Get unique dates
  const dates = [...new Set(historicalData.map(item => item.timestamp.toISOString().split('T')[0]))];
  
  // Create a map of tool pricing data
  const prices: any = {};
  
  toolIds.forEach(toolId => {
    prices[toolId] = {
      free: { monthly: [], annually: [] },
      starter: { monthly: [], annually: [] },
      professional: { monthly: [], annually: [] },
      enterprise: { monthly: [], annually: [] }
    };
  });
  
  // Populate the prices data
  historicalData.forEach(item => {
    const date = item.timestamp.toISOString().split('T')[0];
    const dateIndex = dates.indexOf(date);
    
    if (dateIndex >= 0 && prices[item.toolId]) {
      // Make sure the tier and plan exist in our structure
      if (prices[item.toolId][item.tier] && prices[item.toolId][item.tier][item.plan]) {
        prices[item.toolId][item.tier][item.plan][dateIndex] = item.price;
      }
    }
  });
  
  return { dates, prices };
}

/**
 * Get tools by category
 */
export const getToolsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    // Validate the category parameter
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }
    
    const tools = await prisma.saasTool.findMany({
      where: {
        category
      },
      include: {
        pricingPlans: {
          include: {
            features: true,
            limitations: true
          }
        },
        integrations: true
      }
    });
    
    // Format the tools for the response
    const formattedTools = tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      logo: tool.logo,
      website: tool.website,
      category: tool.category,
      pricing: formatPricingPlans(tool.pricingPlans),
      integrations: tool.integrations.map(integration => integration.name),
      lastUpdated: tool.updatedAt
    }));
    
    return res.status(200).json({
      success: true,
      data: formattedTools
    });
  } catch (error) {
    logger.error('Error getting tools by category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tools by category'
    });
  }
};

/**
 * Get distinct tool categories
 */
export const getToolCategories = async (req: Request, res: Response) => {
  try {
    // Using Prisma's findMany with distinct to get unique categories
    const categories = await prisma.saasTool.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    });
    
    // Extract the category names
    const categoryNames = categories.map(c => c.category);
    
    return res.status(200).json({
      success: true,
      data: categoryNames
    });
  } catch (error) {
    logger.error('Error getting tool categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tool categories'
    });
  }
};

// Get tool alternatives
export const getToolAlternatives = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // First, get the tool to check its category
    const tool = await prisma.saasTool.findUnique({
      where: { id }
    });
    
    if (!tool) {
      return next(new AppError("Tool not found", 404));
    }
    
    // Then get other tools in the same category
    const alternatives = await prisma.saasTool.findMany({
      where: {
        category: tool.category,
        id: { not: id }  // Exclude the current tool
      },
      include: {
        pricingPlans: {
          include: {
            features: true,
            limitations: true,
          },
        },
      },
      take: 6  // Limit to 6 alternatives
    });
    
    const formattedAlternatives = alternatives.map(alt => formatToolResponse(alt));
    
    res.status(200).json({
      status: "success",
      results: alternatives.length,
      data: formattedAlternatives
    });
  } catch (error) {
    next(error);
  }
};

// Get tool integrations
export const getToolIntegrations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Get the tool with its integrations
    const tool = await prisma.saasTool.findUnique({
      where: { id },
      include: {
        integrations: true
      }
    });
    
    if (!tool) {
      return next(new AppError("Tool not found", 404));
    }
    
    res.status(200).json({
      status: "success",
      results: tool.integrations.length,
      data: tool.integrations
    });
  } catch (error) {
    next(error);
  }
};

// Get tool pricing history
export const getToolPricingHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if tool exists
    const tool = await prisma.saasTool.findUnique({
      where: { id }
    });
    
    if (!tool) {
      return next(new AppError("Tool not found", 404));
    }
    
    // Get pricing history for the tool
    const pricingHistory = await prisma.pricingHistory.findMany({
      where: { toolId: id },
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    // Group by tier and plan for easier consumption
    const groupedHistory = pricingHistory.reduce((acc: any, item) => {
      const key = `${item.tier}_${item.plan}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({
        price: item.price,
        timestamp: item.timestamp,
        isLatest: item.isLatest
      });
      return acc;
    }, {});
    
    res.status(200).json({
      status: "success",
      data: {
        tool: {
          id: tool.id,
          name: tool.name
        },
        pricingHistory: groupedHistory
      }
    });
  } catch (error) {
    next(error);
  }
};

// Track a tool for a user
export const trackTool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { toolId } = req.body;
    const userId = req.user.id;
    
    if (!toolId) {
      return next(new AppError("Tool ID is required", 400));
    }
    
    // Check if tool exists
    const tool = await prisma.saasTool.findUnique({
      where: { id: toolId }
    });
    
    if (!tool) {
      return next(new AppError("Tool not found", 404));
    }
    
    // Check if already tracking
    const existingSubscription = await prisma.toolSubscription.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId
        }
      }
    });
    
    if (existingSubscription) {
      return next(new AppError("Already tracking this tool", 400));
    }
    
    // Create new tracking subscription
    await prisma.toolSubscription.create({
      data: {
        userId,
        toolId
      }
    });
    
    res.status(201).json({
      status: "success",
      message: "Now tracking tool"
    });
  } catch (error) {
    next(error);
  }
};

// Get user tracked tools
export const getUserTrackedTools = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    // Get all tools the user is tracking
    const subscriptions = await prisma.toolSubscription.findMany({
      where: { userId },
      include: {
        tool: {
          include: {
            pricingPlans: {
              include: {
                features: true,
                limitations: true
              }
            },
            integrations: true
          }
        }
      }
    });
    
    const tools = subscriptions.map(sub => formatToolResponse(sub.tool));
    
    res.status(200).json({
      status: "success",
      results: tools.length,
      data: tools
    });
  } catch (error) {
    next(error);
  }
};

// Untrack a tool
export const untrackTool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if subscription exists
    const subscription = await prisma.toolSubscription.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId: id
        }
      }
    });
    
    if (!subscription) {
      return next(new AppError("Not tracking this tool", 404));
    }
    
    // Remove subscription
    await prisma.toolSubscription.delete({
      where: {
        userId_toolId: {
          userId,
          toolId: id
        }
      }
    });
    
    res.status(200).json({
      status: "success",
      message: "Tool tracking removed"
    });
  } catch (error) {
    next(error);
  }
};
