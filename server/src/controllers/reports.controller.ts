import type { Request, Response } from "express"
import fs from "fs"
import path from "path"
import { z } from "zod"
import { AIReportGenerator } from "../services/ai/report-generator.service"
import { logger } from "../utils/logger"
import { prisma } from "../utils/prisma"

const REPORTS_DIR = path.join(__dirname, "../../reports")

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true })
}

// Initialize AI report generator
const geminiApiKey = process.env.GEMINI_API_KEY || ""
const aiReportGenerator = new AIReportGenerator(geminiApiKey, REPORTS_DIR)

// Get all reports for a user
export const getUserReports = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id

    const reports = await prisma.report.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        comparison: true,
      },
    })

    return res.status(200).json({ success: true, data: reports })
  } catch (error) {
    logger.error("Error fetching reports:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch reports" })
  }
}

// Get report by ID
export const getReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const report = await prisma.report.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        comparison: true,
      },
    })

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" })
    }

    return res.status(200).json({ success: true, data: report })
  } catch (error) {
    logger.error("Error fetching report:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch report" })
  }
}

// Generate a report
export const generateReport = async (req: Request, res: Response) => {
  try {
    const { comparisonId, format, includeAIInsights } = req.body
    const userId = req.user.id

    // Validate input
    const schema = z.object({
      comparisonId: z.string().uuid("Invalid comparison ID"),
      format: z.enum(["PDF", "EXCEL", "CSV"]),
      includeAIInsights: z.boolean().optional().default(false),
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

    // For mock implementation, we'll create a simple file
    const timestamp = new Date().getTime()
    const filename = `report_${timestamp}.${format.toLowerCase()}`
    const filePath = path.join(REPORTS_DIR, filename)
    
    // Create mock content
    const mockContent = `This is a mock ${format} report for comparison ${comparisonId}`
    fs.writeFileSync(filePath, mockContent)
    
    // Save report in database
    const report = await prisma.report.create({
      data: {
        userId,
        comparisonId,
        format: format as any,
        fileUrl: `/api/reports/${filename}`,
        filename,
        metadata: { filePath }
      }
    })

    // Return response with downloadUrl
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000'
    const downloadUrl = `${baseUrl}/api/reports/${report.id}/download`

    return res.status(201).json({
      success: true,
      data: {
        id: report.id,
        format,
        fileUrl: report.fileUrl,
        downloadUrl
      },
    })
  } catch (error) {
    logger.error("Error generating report:", error)
    return res.status(500).json({ success: false, message: "Failed to generate report" })
  }
}

// Download a report
export const downloadReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const report = await prisma.report.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" })
    }

    // Get file path from metadata
    const metadata = (report.metadata as any) || {}
    const filePath = metadata.filePath

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Report file not found" })
    }

    // Set content type based on format
    let contentType = "application/octet-stream"
    if (report.format === "PDF") {
      contentType = "application/pdf"
    } else if (report.format === "EXCEL") {
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    } else if (report.format === "CSV") {
      contentType = "text/csv"
    }

    res.setHeader("Content-Type", contentType)
    res.setHeader("Content-Disposition", `attachment; filename="${report.filename}"`)

    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
  } catch (error) {
    logger.error("Error downloading report:", error)
    return res.status(500).json({ success: false, message: "Failed to download report" })
  }
}

// Delete a report
export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const report = await prisma.report.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" })
    }

    // Get file path from metadata
    const metadata = (report.metadata as any) || {}
    const filePath = metadata.filePath

    // Delete file if it exists
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Delete report from database
    await prisma.report.delete({
      where: { id },
    })

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    })
  } catch (error) {
    logger.error("Error deleting report:", error)
    return res.status(500).json({ success: false, message: "Failed to delete report" })
  }
}
