'use client' 

import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"
import ExcelJS from "exceljs"
import PptxGenJS from "pptxgenjs"

const prisma = new PrismaClient()

// Generate a report for a comparison
export const generateReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { comparisonId, format, includeCharts } = req.body
    const userId = req.user?.id

    // Check if comparison exists
    const comparison = await prisma.comparison.findUnique({
      where: { id: comparisonId },
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

    // Create a report record
    const report = await prisma.report.create({
      data: {
        name: `Comparison Report - ${new Date().toISOString().split("T")[0]}`,
        format,
        userId,
        comparison: { connect: { id: comparisonId } },
      },
    })

    // Generate the report file
    const reportFilePath = await generateReportFile(comparison, format, includeCharts, report.id)

    // Update the report record with the file path
    await prisma.report.update({
      where: { id: report.id },
      data: {
        filePath: reportFilePath,
      },
    })

    res.status(200).json({
      status: "success",
      data: {
        report,
        reportUrl: `/api/reports/${report.id}/download`,
      },
    })
  } catch (error) {
    logger.error("Generate report error:", error)
    next(error)
  }
}

// Get all reports for the current user
export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id

    const reports = await prisma.report.findMany({
      where: { userId },
      include: {
        comparison: {
          include: {
            tools: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.status(200).json({
      status: "success",
      results: reports.length,
      data: {
        reports,
      },
    })
  } catch (error) {
    logger.error("Get reports error:", error)
    next(error)
  }
}

// Get a report by ID
export const getReportById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        comparison: {
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
        },
      },
    })

    if (!report) {
      return next(new AppError("Report not found", 404))
    }

    // Check if the report belongs to the current user
    if (report.userId !== userId) {
      return next(new AppError("You do not have permission to access this report", 403))
    }

    res.status(200).json({
      status: "success",
      data: {
        report,
      },
    })
  } catch (error) {
    logger.error("Get report by ID error:", error)
    next(error)
  }
}

// Download a report
export const downloadReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const report = await prisma.report.findUnique({
      where: { id },
    })

    if (!report) {
      return next(new AppError("Report not found", 404))
    }

    // Check if the report belongs to the current user
    if (report.userId !== userId) {
      return next(new AppError("You do not have permission to access this report", 403))
    }

    // Check if the file exists
    if (!report.filePath || !fs.existsSync(report.filePath)) {
      return next(new AppError("Report file not found", 404))
    }

    // Set the appropriate content type based on the format
    let contentType = "application/pdf"
    if (report.format === "excel") {
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    } else if (report.format === "ppt") {
      contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    }

    // Set headers for file download
    res.setHeader("Content-Type", contentType)
    res.setHeader("Content-Disposition", `attachment; filename="report-${id}.${getFileExtension(report.format)}"`)

    // Stream the file to the response
    const fileStream = fs.createReadStream(report.filePath)
    fileStream.pipe(res)
  } catch (error) {
    logger.error("Download report error:", error)
    next(error)
  }
}

// Delete a report
export const deleteReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const report = await prisma.report.findUnique({
      where: { id },
    })

    if (!report) {
      return next(new AppError("Report not found", 404))
    }

    // Check if the report belongs to the current user
    if (report.userId !== userId) {
      return next(new AppError("You do not have permission to delete this report", 403))
    }

    // Delete the file if it exists
    if (report.filePath && fs.existsSync(report.filePath)) {
      fs.unlinkSync(report.filePath)
    }

    // Delete the report record
    await prisma.report.delete({
      where: { id },
    })

    res.status(200).json({
      status: "success",
      message: "Report deleted successfully",
    })
  } catch (error) {
    logger.error("Delete report error:", error)
    next(error)
  }
}

// Helper function to generate the report file
async function generateReportFile(comparison: any, format: string, includeCharts: boolean, reportId: string) {
  // Create the reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, "../../../reports")
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }

  const fileName = `report-${reportId}.${getFileExtension(format)}`
  const filePath = path.join(reportsDir, fileName)

  switch (format) {
    case "pdf":
      await generatePdfReport(comparison, filePath, includeCharts)
      break
    case "excel":
      await generateExcelReport(comparison, filePath)
      break
    case "ppt":
      await generatePptReport(comparison, filePath, includeCharts)
      break
    default:
      throw new AppError("Unsupported report format", 400)
  }

  return filePath
}

// Helper function to generate a PDF report
async function generatePdfReport(comparison: any, filePath: string, includeCharts: boolean) {
  return new Promise<void>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const stream = fs.createWriteStream(filePath)

      // Handle stream events
      stream.on("finish", () => resolve())
      stream.on("error", (err) => reject(err))

      // Pipe the PDF to the file
      doc.pipe(stream)

      // Add report title
      doc.fontSize(25).text("SaaS Comparison Report", { align: "center" })
      doc.moveDown()
      doc.fontSize(12).text(`Generated on ${new Date().toLocaleDateString()}`, { align: "center" })
      doc.moveDown(2)

      // Add tools being compared
      doc.fontSize(16).text("Tools Compared", { underline: true })
      doc.moveDown()

      comparison.tools.forEach((tool: any) => {
        doc.fontSize(14).text(tool.name)
        doc.fontSize(10).text(tool.description)
        doc.moveDown()
      })

      // Add features comparison
      doc.addPage()
      doc.fontSize(16).text("Feature Comparison", { underline: true })
      doc.moveDown()

      // Collect all unique features
      const allFeatures = new Set<string>()
      comparison.tools.forEach((tool: any) => {
        Object.values(tool.pricing).forEach((plan: any) => {
          if (plan && plan.features) {
            plan.features.forEach((feature: any) => {
              allFeatures.add(typeof feature === "string" ? feature : feature.name)
            })
          }
        })
      })

      // Create a feature comparison table
      const features = Array.from(allFeatures)
      const toolNames = comparison.tools.map((tool: any) => tool.name)

      // Table header
      doc.fontSize(12).text("Feature", 50, doc.y, { width: 200 })
      toolNames.forEach((name: string, index: number) => {
        doc.text(name, 250 + index * 100, doc.y, { width: 100 })
      })
      doc.moveDown()

      // Table rows
      features.forEach((feature) => {
        doc.fontSize(10).text(feature, 50, doc.y, { width: 200 })

        comparison.tools.forEach((tool: any, index: number) => {
          const hasFeature = Object.values(tool.pricing).some((plan: any) => {
            if (!plan || !plan.features) return false
            return plan.features.some((f: any) => {
              const featureName = typeof f === "string" ? f : f.name
              return featureName === feature
            })
          })

          doc.text(hasFeature ? "✓" : "✗", 250 + index * 100, doc.y, { width: 100 })
        })

        doc.moveDown()
      })

      // Add pricing comparison
      doc.addPage()
      doc.fontSize(16).text("Pricing Comparison", { underline: true })
      doc.moveDown()

      // Table header
      doc.fontSize(12).text("Plan", 50, doc.y, { width: 100 })
      toolNames.forEach((name: string, index: number) => {
        doc.text(name, 150 + index * 150, doc.y, { width: 150 })
      })
      doc.moveDown()

      // Table rows for each pricing tier
      const pricingTiers = ["free", "starter", "pro", "enterprise"]
      pricingTiers.forEach((tier) => {
        doc.fontSize(10).text(tier.charAt(0).toUpperCase() + tier.slice(1), 50, doc.y, { width: 100 })

        comparison.tools.forEach((tool: any, index: number) => {
          const plan = tool.pricing[tier]
          const priceText = plan ? (plan.isCustomPricing ? "Contact for pricing" : `$${plan.price}`) : "Not available"

          doc.text(priceText, 150 + index * 150, doc.y, { width: 150 })
        })

        doc.moveDown()
      })

      // Add recommendations
      doc.addPage()
      doc.fontSize(16).text("Recommendations", { underline: true })
      doc.moveDown()

      doc.fontSize(12).text("Best Overall")
      doc.fontSize(10).text(comparison.tools[0].name)
      doc.fontSize(10).text("Offers the most comprehensive feature set with competitive pricing")
      doc.moveDown()

      doc.fontSize(12).text("Best Value")
      doc.fontSize(10).text(comparison.tools[1].name)
      doc.fontSize(10).text("Provides essential features at the most affordable price point")
      doc.moveDown()

      // Finalize the PDF
      doc.end()
    } catch (error) {
      logger.error("Error generating PDF report:", error)
      throw error
    }
  })
}

// Helper function to generate an Excel report
async function generateExcelReport(comparison: any, filePath: string) {
  try {
    const workbook = new ExcelJS.Workbook()

    // Add overview sheet
    const overviewSheet = workbook.addWorksheet("Overview")

    // Add title
    overviewSheet.mergeCells("A1:D1")
    const titleCell = overviewSheet.getCell("A1")
    titleCell.value = "SaaS Comparison Report"
    titleCell.font = { size: 16, bold: true }
    titleCell.alignment = { horizontal: "center" }

    // Add date
    overviewSheet.mergeCells("A2:D2")
    const dateCell = overviewSheet.getCell("A2")
    dateCell.value = `Generated on ${new Date().toLocaleDateString()}`
    dateCell.alignment = { horizontal: "center" }

    // Add tools being compared
    overviewSheet.getCell("A4").value = "Tools Compared"
    overviewSheet.getCell("A4").font = { bold: true }

    let row = 5
    comparison.tools.forEach((tool: any, index: number) => {
      overviewSheet.getCell(`A${row}`).value = tool.name
      overviewSheet.getCell(`B${row}`).value = tool.description
      row++
    })

    // Add features sheet
    const featuresSheet = workbook.addWorksheet("Features")

    // Collect all unique features
    const allFeatures = new Set<string>()
    comparison.tools.forEach((tool: any) => {
      Object.values(tool.pricing).forEach((plan: any) => {
        if (plan && plan.features) {
          plan.features.forEach((feature: any) => {
            allFeatures.add(typeof feature === "string" ? feature : feature.name)
          })
        }
      })
    })

    // Add header row
    featuresSheet.getCell("A1").value = "Feature"
    comparison.tools.forEach((tool: any, index: number) => {
      featuresSheet.getCell(`${String.fromCharCode(66 + index)}1`).value = tool.name
    })

    // Add feature rows
    row = 2
    Array.from(allFeatures).forEach((feature) => {
      featuresSheet.getCell(`A${row}`).value = feature

      comparison.tools.forEach((tool: any, index: number) => {
        const hasFeature = Object.values(tool.pricing).some((plan: any) => {
          if (!plan || !plan.features) return false
          return plan.features.some((f: any) => {
            const featureName = typeof f === "string" ? f : f.name
            return featureName === feature
          })
        })

        featuresSheet.getCell(`${String.fromCharCode(66 + index)}${row}`).value = hasFeature ? "Yes" : "No"
      })

      row++
    })

    // Add pricing sheet
    const pricingSheet = workbook.addWorksheet("Pricing")

    // Add header row
    pricingSheet.getCell("A1").value = "Plan"
    comparison.tools.forEach((tool: any, index: number) => {
      pricingSheet.getCell(`${String.fromCharCode(66 + index)}1`).value = tool.name
    })

    // Add pricing rows
    const pricingTiers = ["free", "starter", "pro", "enterprise"]
    row = 2
    pricingTiers.forEach((tier) => {
      pricingSheet.getCell(`A${row}`).value = tier.charAt(0).toUpperCase() + tier.slice(1)

      comparison.tools.forEach((tool: any, index: number) => {
        const plan = tool.pricing[tier]
        const priceText = plan ? (plan.isCustomPricing ? "Contact for pricing" : `$${plan.price}`) : "Not available"

        pricingSheet.getCell(`${String.fromCharCode(66 + index)}${row}`).value = priceText
      })

      row++
    })

    // Add recommendations sheet
    const recommendationsSheet = workbook.addWorksheet("Recommendations")

    recommendationsSheet.getCell("A1").value = "Category"
    recommendationsSheet.getCell("B1").value = "Tool"
    recommendationsSheet.getCell("C1").value = "Reason"

    recommendationsSheet.getCell("A2").value = "Best Overall"
    recommendationsSheet.getCell("B2").value = comparison.tools[0].name
    recommendationsSheet.getCell("C2").value = "Offers the most comprehensive feature set with competitive pricing"

    recommendationsSheet.getCell("A3").value = "Best Value"
    recommendationsSheet.getCell("B3").value = comparison.tools[1].name
    recommendationsSheet.getCell("C3").value = "Provides essential features at the most affordable price point"

    // Save the workbook
    await workbook.xlsx.writeFile(filePath)
  } catch (error) {
    logger.error("Error generating Excel report:", error)
    throw error
  }
}

// Helper function to generate a PowerPoint report
async function generatePptReport(comparison: any, filePath: string, includeCharts: boolean) {
  try {
    const pres = new PptxGenJS()

    // Title slide
    const titleSlide = pres.addSlide()
    titleSlide.addText("SaaS Comparison Report", { x: 1, y: 1, w: 8, h: 1, fontSize: 24, bold: true, align: "center" })
    titleSlide.addText(`Generated on ${new Date().toLocaleDateString()}`, {
      x: 1,
      y: 2,
      w: 8,
      h: 0.5,
      fontSize: 14,
      align: "center",
    })

    // Tools overview slide
    const overviewSlide = pres.addSlide()
    overviewSlide.addText("Tools Compared", { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 18, bold: true })

    let y = 1.2
    comparison.tools.forEach((tool: any) => {
      overviewSlide.addText(tool.name, { x: 0.5, y, w: 9, h: 0.4, fontSize: 16, bold: true })
      overviewSlide.addText(tool.description, { x: 0.5, y: y + 0.4, w: 9, h: 0.4, fontSize: 12 })
      y += 1
    })

    // Features comparison slide
    const featuresSlide = pres.addSlide()
    featuresSlide.addText("Feature Comparison", { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 18, bold: true })

    // Collect all unique features
    const allFeatures = new Set<string>()
    comparison.tools.forEach((tool: any) => {
      Object.values(tool.pricing).forEach((plan: any) => {
        if (plan && plan.features) {
          plan.features.forEach((feature: any) => {
            allFeatures.add(typeof feature === "string" ? feature : feature.name)
          })
        }
      })
    })

    // Create table data
    const tableData = [["Feature", ...comparison.tools.map((tool: any) => tool.name)]]

    Array.from(allFeatures)
      .slice(0, 10)
      .forEach((feature) => {
        const row = [feature]

        comparison.tools.forEach((tool: any) => {
          const hasFeature = Object.values(tool.pricing).some((plan: any) => {
            if (!plan || !plan.features) return false
            return plan.features.some((f: any) => {
              const featureName = typeof f === "string" ? f : f.name
              return featureName === feature
            })
          })

          row.push(hasFeature ? "✓" : "✗")
        })

        tableData.push(row)
      })

    featuresSlide.addTable(tableData, { x: 0.5, y: 1.2, w: 9, h: 4 })

    // Pricing comparison slide
    const pricingSlide = pres.addSlide()
    pricingSlide.addText("Pricing Comparison", { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 18, bold: true })

    // Create pricing table data
    const pricingData = [["Plan", ...comparison.tools.map((tool: any) => tool.name)]]

    const pricingTiers = ["free", "starter", "pro", "enterprise"]
    pricingTiers.forEach((tier) => {
      const row = [tier.charAt(0).toUpperCase() + tier.slice(1)]

      comparison.tools.forEach((tool: any) => {
        const plan = tool.pricing[tier]
        const priceText = plan ? (plan.isCustomPricing ? "Contact for pricing" : `$${plan.price}`) : "Not available"

        row.push(priceText)
      })

      pricingData.push(row)
    })

    pricingSlide.addTable(pricingData, { x: 0.5, y: 1.2, w: 9, h: 3 })

    // Recommendations slide
    const recommendationsSlide = pres.addSlide()
    recommendationsSlide.addText("Recommendations", { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 18, bold: true })

    recommendationsSlide.addText("Best Overall", { x: 0.5, y: 1.2, w: 9, h: 0.4, fontSize: 16, bold: true })
    recommendationsSlide.addText(comparison.tools[0].name, { x: 0.5, y: 1.6, w: 9, h: 0.4, fontSize: 14 })
    recommendationsSlide.addText("Offers the most comprehensive feature set with competitive pricing", {
      x: 0.5,
      y: 2.0,
      w: 9,
      h: 0.4,
      fontSize: 12,
    })

    recommendationsSlide.addText("Best Value", { x: 0.5, y: 2.6, w: 9, h: 0.4, fontSize: 16, bold: true })
    recommendationsSlide.addText(comparison.tools[1].name, { x: 0.5, y: 3.0, w: 9, h: 0.4, fontSize: 14 })
    recommendationsSlide.addText("Provides essential features at the most affordable price point", {
      x: 0.5,
      y: 3.4,
      w: 9,
      h: 0.4,
      fontSize: 12,
    })

    // Save the presentation
    await pres.writeFile({ fileName: filePath })
  } catch (error) {
    logger.error("Error generating PowerPoint report:", error)
    throw error
  }
}

// Helper function to get the file extension based on format
function getFileExtension(format: string): string {
  switch (format) {
    case "pdf":
      return "pdf"
    case "excel":
      return "xlsx"
    case "ppt":
      return "pptx"
    default:
      return "pdf"
  }
}
