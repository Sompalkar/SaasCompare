import fs from "fs"
import path from "path"
import { GeminiAIService, type ComparisonData, type UserRequirements, type AIGeneratedReport } from "./gemini.service"
import { generatePDFReport } from "../pdf.service"
import { generateExcelReport } from "../excel.service"
import { generateCSVReport } from "../csv.service"
import { logger } from "../../utils/logger"
import { prisma } from "../../utils/prisma"

export interface ReportGenerationOptions {
  format: "PDF" | "EXCEL" | "CSV"
  includeAIInsights: boolean
  sections?: string[]
  userRequirements?: UserRequirements
}

export class AIReportGenerator {
  private geminiService: GeminiAIService
  private reportsDir: string

  constructor(geminiApiKey: string, reportsDir: string) {
    this.geminiService = new GeminiAIService({
      apiKey: geminiApiKey,
    })
    this.reportsDir = reportsDir

    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true })
    }
  }

  /**
   * Generate a report for a comparison
   */
  async generateReport(
    comparisonId: string,
    userId: string,
    options: ReportGenerationOptions,
  ): Promise<{ id: string; filePath: string; fileUrl: string }> {
    try {
      // Get comparison data
      const comparison = await prisma.comparison.findFirst({
        where: {
          id: comparisonId,
          userId,
        },
      })

      if (!comparison) {
        throw new Error("Comparison not found")
      }

      // Parse comparison data
      const metadata = comparison.metadata as any
      const comparisonData = metadata?.comparisonData as ComparisonData

      if (!comparisonData) {
        throw new Error("Invalid comparison data")
      }

      // Generate AI insights if requested
      let aiInsights: AIGeneratedReport | null = null
      if (options.includeAIInsights) {
        aiInsights = await this.geminiService.generateCompleteReport(comparisonData, options.userRequirements)
      }

      // Generate report file based on format
      let filePath = ""
      let filename = `comparison-report-${Date.now()}`

      if (options.format === "PDF") {
        filePath = await generatePDFReport(comparisonData, this.reportsDir, aiInsights)
        filename += ".pdf"
      } else if (options.format === "EXCEL") {
        filePath = await generateExcelReport(comparisonData, this.reportsDir, aiInsights)
        filename += ".xlsx"
      } else if (options.format === "CSV") {
        filePath = await generateCSVReport(comparisonData, this.reportsDir)
        filename += ".csv"
      }

      // Create report record in database with metadata
      const report = await prisma.report.create({
        data: {
          userId,
          comparisonId,
          format: options.format,
          filename,
          fileUrl: `/reports/${path.basename(filePath)}`,
          metadata: {
            filePath,
            includesAI: options.includeAIInsights,
            generatedAt: new Date().toISOString(),
            sections: options.sections || [],
          },
        },
      })

      return {
        id: report.id,
        filePath,
        fileUrl: `/reports/${path.basename(filePath)}`,
      }
    } catch (error) {
      logger.error("Error generating report:", error)
      throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Generate custom report sections
   */
  async generateCustomReportSections(
    comparisonId: string,
    userId: string,
    sections: string[],
  ): Promise<Record<string, string>> {
    try {
      // Get comparison data
      const comparison = await prisma.comparison.findFirst({
        where: {
          id: comparisonId,
          userId,
        },
      })

      if (!comparison) {
        throw new Error("Comparison not found")
      }

      // Parse comparison data
      const metadata = comparison.metadata as any
      const comparisonData = metadata?.comparisonData as ComparisonData

      if (!comparisonData) {
        throw new Error("Invalid comparison data")
      }

      // Generate requested sections
      const reportSections: Record<string, string> = {}

      for (const section of sections) {
        switch (section) {
          case "executiveSummary":
            reportSections.executiveSummary = await this.geminiService.generateExecutiveSummary(comparisonData)
            break
          case "detailedAnalysis":
            reportSections.detailedAnalysis = await this.geminiService.generateComparisonInsights(comparisonData)
            break
          case "pricingAnalysis":
            reportSections.pricingAnalysis = await this.geminiService.generatePricingAnalysis(comparisonData)
            break
          case "featureComparison":
            reportSections.featureComparison = await this.geminiService.generateFeatureComparison(comparisonData)
            break
          case "marketPositioning":
            reportSections.marketPositioning = await this.geminiService.generateMarketPositioning(comparisonData)
            break
          case "futureTrends":
            reportSections.futureTrends = await this.geminiService.generateFutureTrends(comparisonData)
            break
        }
      }

      return reportSections
    } catch (error) {
      logger.error("Error generating custom report sections:", error)
      throw new Error(
        `Failed to generate custom report sections: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Extract data from a pricing page screenshot
   */
  async extractDataFromScreenshot(imageBase64: string): Promise<any> {
    try {
      return await this.geminiService.extractDataFromScreenshot(imageBase64)
    } catch (error) {
      logger.error("Error extracting data from screenshot:", error)
      throw new Error(
        `Failed to extract data from screenshot: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Extract data from a PDF document
   */
  async extractDataFromPDF(pdfText: string): Promise<any> {
    try {
      return await this.geminiService.extractDataFromPDF(pdfText)
    } catch (error) {
      logger.error("Error extracting data from PDF:", error)
      throw new Error(`Failed to extract data from PDF: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
