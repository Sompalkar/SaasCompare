import type { Request, Response } from "express"
import { z } from "zod"
import { GeminiAIService } from "../services/ai/gemini.service"
import { AIReportGenerator } from "../services/ai/report-generator.service"
import path from "path"
import { logger } from "../utils/logger"
// import { prisma } from "../utils/prisma"
import { prisma } from "../utils/prisma"
import { aiService } from '../services/ai.service'

// Initialize AI services
const geminiApiKey = process.env.GEMINI_API_KEY || ""
const reportsDir = path.join(__dirname, "../../reports")
const aiReportGenerator = new AIReportGenerator(geminiApiKey, reportsDir)
const geminiService = new GeminiAIService({ apiKey: geminiApiKey })

// Generate AI insights for a comparison
export const generateAIInsights = async (req: Request, res: Response) => {
  try {
    const { comparisonId } = req.params
    const userId = req.user.id

    // Validate input
    const schema = z.object({
      sections: z.array(z.string()).optional(),
      userRequirements: z
        .object({
          budget: z.number().optional(),
          mustHaveFeatures: z.array(z.string()).optional(),
          niceToHaveFeatures: z.array(z.string()).optional(),
          industry: z.string().optional(),
          companySize: z.string().optional(),
          useCase: z.string().optional(),
        })
        .optional(),
    })

    const validation = schema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors,
      })
    }

    const { sections, userRequirements } = req.body

    // Generate insights
    let insights
    if (sections && sections.length > 0) {
      insights = await aiReportGenerator.generateCustomReportSections(comparisonId, userId, sections)
    } else {
      // Get comparison data
      const comparison = await prisma.comparison.findFirst({
        where: {
          id: comparisonId,
          userId,
        },
      })

      if (!comparison) {
        return res.status(404).json({ success: false, message: "Comparison not found" })
      }

      // Parse comparison data
      const metadata = comparison.metadata as any
      const comparisonData = metadata?.comparisonData

      if (!comparisonData) {
        return res.status(400).json({ success: false, message: "Invalid comparison data" })
      }

      insights = await geminiService.generateCompleteReport(comparisonData, userRequirements)
    }

    return res.status(200).json({
      success: true,
      data: insights,
    })
  } catch (error) {
    logger.error("Error generating AI insights:", error)
    return res.status(500).json({
      success: false,
      message: `Failed to generate AI insights: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}

// Generate AI-powered report
export const generateAIReport = async (req: Request, res: Response) => {
  try {
    const { comparisonId } = req.params
    const userId = req.user.id

    // Validate input
    const schema = z.object({
      format: z.enum(["PDF", "EXCEL", "CSV"]),
      includeAIInsights: z.boolean().default(true),
      sections: z.array(z.string()).optional(),
      userRequirements: z
        .object({
          budget: z.number().optional(),
          mustHaveFeatures: z.array(z.string()).optional(),
          niceToHaveFeatures: z.array(z.string()).optional(),
          industry: z.string().optional(),
          companySize: z.string().optional(),
          useCase: z.string().optional(),
        })
        .optional(),
    })

    const validation = schema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors,
      })
    }

    const { format, includeAIInsights, sections, userRequirements } = req.body

    // Generate report
    const report = await aiReportGenerator.generateReport(comparisonId, userId, {
      format,
      includeAIInsights,
      sections,
      userRequirements,
    })

    return res.status(201).json({
      success: true,
      data: {
        id: report.id,
        fileUrl: report.fileUrl,
        format,
      },
    })
  } catch (error) {
    logger.error("Error generating AI report:", error)
    return res.status(500).json({
      success: false,
      message: `Failed to generate AI report: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}

// Extract data from screenshot
export const extractDataFromScreenshot = async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body

    // Validate input
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: "Image data is required" })
    }

    // Extract data
    const extractedData = await aiReportGenerator.extractDataFromScreenshot(imageBase64)

    return res.status(200).json({
      success: true,
      data: extractedData,
    })
  } catch (error) {
    logger.error("Error extracting data from screenshot:", error)
    return res.status(500).json({
      success: false,
      message: `Failed to extract data from screenshot: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}

// Extract data from PDF
export const extractDataFromPDF = async (req: Request, res: Response) => {
  try {
    const { pdfText } = req.body

    // Validate input
    if (!pdfText) {
      return res.status(400).json({ success: false, message: "PDF text is required" })
    }

    // Extract data
    const extractedData = await aiReportGenerator.extractDataFromPDF(pdfText)

    return res.status(200).json({
      success: true,
      data: extractedData,
    })
  } catch (error) {
    logger.error("Error extracting data from PDF:", error)
    return res.status(500).json({
      success: false,
      message: `Failed to extract data from PDF: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userRequirements = req.body;
    const result = await aiService.getRecommendations(userRequirements);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }
    
    return res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    logger.error('Error in AI recommendations controller', error);
    return res.status(500).json({ success: false, message: 'Failed to get AI recommendations' });
  }
};

export const compareTools = async (req: Request, res: Response) => {
  try {
    const { tools } = req.body;
    
    if (!tools || !Array.isArray(tools) || tools.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide at least two tools to compare' 
      });
    }
    
    const result = await aiService.compareTools(tools);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }
    
    return res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    logger.error('Error in AI comparison controller', error);
    return res.status(500).json({ success: false, message: 'Failed to get AI comparison' });
  }
};

export const analyzePricingTrends = async (req: Request, res: Response) => {
  try {
    const { tool, historicalData } = req.body;
    
    if (!tool) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide tool data for analysis' 
      });
    }
    
    const result = await aiService.analyzePricingTrends(tool, historicalData || []);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }
    
    return res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    logger.error('Error in pricing analysis controller', error);
    return res.status(500).json({ success: false, message: 'Failed to analyze pricing trends' });
  }
};
