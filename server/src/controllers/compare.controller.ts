import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import path from "path"
import fs from "fs"

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

/**
 * Export a comparison to PDF, Excel, or PowerPoint
 */
export const exportComparison = async (req: Request, res: Response) => {
  try {
    const { format, tools, comparisonId } = req.body;
    
    if (!format || !tools || !Array.isArray(tools) || tools.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid format or tools data provided'
      });
    }
    
    // Format validation
    if (!['pdf', 'excel', 'ppt'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported export format'
      });
    }
    
    // Ensure reports directory exists
    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const filename = `comparison_${timestamp}`;
    
    let outputPath = '';
    let mimeType = '';
    
    // Generate export based on format
    switch (format) {
      case 'pdf':
        outputPath = await generatePDFExport(filename, tools);
        mimeType = 'application/pdf';
        break;
      case 'excel':
        outputPath = await generateExcelExport(filename, tools);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'ppt':
        outputPath = await generatePPTExport(filename, tools);
        mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
    }
    
    // Store the export in the report table
    await prisma.report.create({
      data: {
        userId: req.user?.id,
        comparisonId: comparisonId || undefined,
        fileUrl: outputPath,
        filename: path.basename(outputPath),
        format: format === 'pdf' ? 'PDF' : format === 'excel' ? 'EXCEL' : 'PDF',
        metadata: {
          toolCount: tools.length,
          exportedAt: new Date().toISOString()
        }
      }
    });
    
    // Return the file URL for download
    // In a production app, this would use a proper file storage service with signed URLs
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const downloadUrl = `${baseUrl}/exports/${outputPath}`;
    
    return res.status(200).json({
      success: true,
      data: {
        url: downloadUrl,
        format,
        filename: outputPath
      }
    });
  } catch (error) {
    logger.error('Error exporting comparison', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export comparison'
    });
  }
};

/**
 * Get historical pricing data for tools
 */
export const getHistoricalData = async (req: Request, res: Response) => {
  try {
    const { toolIds } = req.body;
    
    if (!toolIds || !Array.isArray(toolIds) || toolIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tool IDs are required'
      });
    }
    
    // Get historical pricing data for the tools
    const historicalData = await prisma.pricingHistory.findMany({
      where: {
        toolId: {
          in: toolIds
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
    
    // Format the data for the client
    const formattedData = formatHistoricalData(historicalData, toolIds);
    
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

// Helper functions for export generation
async function generatePDFExport(filename: string, tools: any[]): Promise<string> {
  // Mock implementation - in a real app, this would generate a PDF
  const filePath = path.join(__dirname, '../../reports', `${filename}.pdf`);
  
  // Create a simple file to simulate PDF creation
  fs.writeFileSync(filePath, 'This is a mock PDF file for the comparison report');
  
  return `${filename}.pdf`;
}

async function generateExcelExport(filename: string, tools: any[]): Promise<string> {
  // Mock implementation - in a real app, this would generate an Excel file
  const filePath = path.join(__dirname, '../../reports', `${filename}.xlsx`);
  
  // Create a simple file to simulate Excel creation
  fs.writeFileSync(filePath, 'This is a mock Excel file for the comparison report');
  
  return `${filename}.xlsx`;
}

async function generatePPTExport(filename: string, tools: any[]): Promise<string> {
  // Mock implementation - in a real app, this would generate a PowerPoint file
  const filePath = path.join(__dirname, '../../reports', `${filename}.pptx`);
  
  // Create a simple file to simulate PowerPoint creation
  fs.writeFileSync(filePath, 'This is a mock PowerPoint file for the comparison report');
  
  return `${filename}.pptx`;
}

// Helper function to format historical pricing data
function formatHistoricalData(historicalData: any[], toolIds: string[]) {
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

// Save a comparison
export const saveComparison = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, tools } = req.body;

    if (!name || !tools || !Array.isArray(tools) || tools.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comparison data provided'
      });
    }

    // Get user ID from auth
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // First verify that all tools exist
    const existingTools = await prisma.saasTool.findMany({
      where: {
        id: {
          in: tools
        }
      },
      select: {
        id: true,
        name: true,
        logo: true
      }
    });

    if (existingTools.length !== tools.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more tool IDs are invalid'
      });
    }

    // Create comparison record
    const comparison = await prisma.comparison.create({
      data: {
        userId,
        features: [],
        tools: {
          connect: existingTools.map(tool => ({ id: tool.id }))
        }
      }
    });

    // Then create the saved comparison that references it
    const savedComparison = await prisma.savedComparison.create({
      data: {
        name,
        userId,
        comparisonId: comparison.id
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        id: savedComparison.id,
        name: savedComparison.name,
        comparisonId: comparison.id,
        tools: existingTools
      }
    });
  } catch (error) {
    logger.error('Error saving comparison', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save comparison'
    });
  }
};

// Get user's saved comparisons
export const getSavedComparisons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const savedComparisons = await prisma.savedComparison.findMany({
      where: {
        userId
      },
      include: {
        comparison: {
          include: {
            tools: {
              select: {
                id: true,
                name: true,
                logo: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response to make it more user-friendly
    const formattedComparisons = savedComparisons.map(comp => ({
      id: comp.id,
      name: comp.name,
      comparisonId: comp.comparisonId,
      createdAt: comp.createdAt,
      updatedAt: comp.updatedAt,
      tools: comp.comparison.tools
    }));

    return res.status(200).json({
      success: true,
      data: formattedComparisons
    });
  } catch (error) {
    logger.error('Error getting saved comparisons', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get saved comparisons'
    });
  }
};

// Delete a saved comparison
export const deleteComparison = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // First check if the comparison exists and belongs to the user
    const comparison = await prisma.savedComparison.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: 'Comparison not found or you don\'t have permission to delete it'
      });
    }

    // Delete the comparison
    await prisma.savedComparison.delete({
      where: {
        id
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Comparison deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting comparison', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete comparison'
    });
  }
};
