import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"
import { createObjectCsvWriter } from "csv-writer"
import ExcelJS from "exceljs"

const prisma = new PrismaClient()

// Generate a report
export const generateReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id
    const { comparisonId, format, includeCharts } = req.body

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

    // Check user's plan for report generation
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (user?.plan === "FREE" && format !== "PDF") {
      return next(new AppError("Your plan only allows PDF reports. Upgrade to access other formats.", 403))
    }

    // Generate a unique filename
    const filename = `report-${comparisonId}-${Date.now()}.${format.toLowerCase()}`
    const filePath = path.join(__dirname, "..", "..", "reports", filename)

    // Ensure reports directory exists
    if (!fs.existsSync(path.join(__dirname, "..", "..", "reports"))) {
      fs.mkdirSync(path.join(__dirname, "..", "..", "reports"), { recursive: true })
    }

    // Generate the report based on format
    let fileUrl = ""

    switch (format) {
      case "PDF":
        fileUrl = await generatePdfReport(comparison, filePath, includeCharts)
        break
      case "CSV":
        fileUrl = await generateCsvReport(comparison, filePath)
        break
      case "EXCEL":
        fileUrl = await generateExcelReport(comparison, filePath, includeCharts)
        break
      default:
        return next(new AppError("Unsupported report format", 400))
    }

    // Create a report record in the database
    const report = await prisma.report.create({
      data: {
        userId,
        comparisonId,
        format,
        fileUrl,
        filename,
      },
    })

    res.status(201).json({
      status: "success",
      data: {
        id: report.id,
        format: report.format,
        fileUrl: report.fileUrl,
        createdAt: report.createdAt,
      },
    })
  } catch (error) {
    logger.error("Generate report error:", error)
    next(error)
  }
}

// Get all reports for a user
export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id

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
      data: reports,
    })
  } catch (error) {
    logger.error("Get reports error:", error)
    next(error)
  }
}

// Get a specific report
export const getReportById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const report = await prisma.report.findFirst({
      where: {
        id,
        userId,
      },
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
    })

    if (!report) {
      return next(new AppError("Report not found", 404))
    }

    res.status(200).json({
      status: "success",
      data: report,
    })
  } catch (error) {
    logger.error("Get report by ID error:", error)
    next(error)
  }
}

// Download a report
export const downloadReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const report = await prisma.report.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!report) {
      return next(new AppError("Report not found", 404))
    }

    const filePath = path.join(__dirname, "..", "..", "reports", report.filename)

    if (!fs.existsSync(filePath)) {
      return next(new AppError("Report file not found", 404))
    }

    res.download(filePath, report.filename)
  } catch (error) {
    logger.error("Download report error:", error)
    next(error)
  }
}

// Helper function to generate PDF report
const generatePdfReport = async (comparison: any, filePath: string, includeCharts = false): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const writeStream = fs.createWriteStream(filePath)

      doc.pipe(writeStream)

      // Add title
      doc.fontSize(25).text("SaaS Pricing Comparison Report", { align: "center" })
      doc.moveDown()

      // Add date
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" })
      doc.moveDown(2)

      // Add tools being compared
      doc.fontSize(16).text("Tools Compared", { underline: true })
      doc.moveDown()

      comparison.tools.forEach((tool: any) => {
        doc.fontSize(14).text(tool.name)
        doc.fontSize(10).text(`Website: ${tool.website}`)
        doc.moveDown()
      })

      doc.moveDown()

      // Add pricing comparison table
      doc.fontSize(16).text("Pricing Comparison", { underline: true })
      doc.moveDown()

      // Table headers
      const tableTop = doc.y
      let tableLeft = 100

      doc.fontSize(10).text("Plan", 50, tableTop)

      comparison.tools.forEach((tool: any) => {
        doc.text(tool.name, tableLeft, tableTop)
        tableLeft += 150
      })

      doc.moveDown()

      // Get all unique plan names
      const planNames = new Set<string>()
      comparison.tools.forEach((tool: any) => {
        tool.pricingPlans.forEach((plan: any) => {
          planNames.add(plan.name)
        })
      })

      // Table rows
      let rowTop = doc.y

      Array.from(planNames).forEach((planName) => {
        tableLeft = 100
        doc.fontSize(10).text(planName, 50, rowTop)

        comparison.tools.forEach((tool: any) => {
          const plan = tool.pricingPlans.find((p: any) => p.name === planName)
          const priceText = plan ? (plan.isCustomPricing ? "Custom" : `$${plan.price || 0}`) : "N/A"

          doc.text(priceText, tableLeft, rowTop)
          tableLeft += 150
        })

        rowTop += 20

        // Check if we need a new page
        if (rowTop > doc.page.height - 100) {
          doc.addPage()
          rowTop = 50
        }
      })

      doc.moveDown(2)

      // Add features comparison
      doc.fontSize(16).text("Features Comparison", { underline: true })
      doc.moveDown()

      // Get all unique features
      const allFeatures = new Set<string>()
      comparison.tools.forEach((tool: any) => {
        tool.pricingPlans.forEach((plan: any) => {
          plan.features.forEach((feature: any) => {
            allFeatures.add(feature.name)
          })
        })
      })

      // Table headers for features
      tableLeft = 100
      const featureTableTop = doc.y

      doc.fontSize(10).text("Feature", 50, featureTableTop)

      comparison.tools.forEach((tool: any) => {
        doc.text(tool.name, tableLeft, featureTableTop)
        tableLeft += 150
      })

      doc.moveDown()

      // Table rows for features
      rowTop = doc.y

      Array.from(allFeatures).forEach((featureName) => {
        tableLeft = 100
        doc.fontSize(10).text(featureName, 50, rowTop)

        comparison.tools.forEach((tool: any) => {
          const hasFeature = tool.pricingPlans.some((plan: any) =>
            plan.features.some((feature: any) => feature.name === featureName),
          )

          doc.text(hasFeature ? "✓" : "✗", tableLeft, rowTop)
          tableLeft += 150
        })

        rowTop += 20

        // Check if we need a new page
        if (rowTop > doc.page.height - 100) {
          doc.addPage()
          rowTop = 50
        }
      })

      // Finalize the PDF
      doc.end()

      writeStream.on("finish", () => {
        const fileUrl = `/api/reports/${path.basename(filePath)}`
        resolve(fileUrl)
      })

      writeStream.on("error", (err) => {
        reject(err)
      })
    } catch (error) {
      reject(error)
    }
  })
}

// Helper function to generate CSV report
const generateCsvReport = async (comparison: any, filePath: string): Promise<string> => {
  try {
    // Get all unique plan names
    const planNames = new Set<string>()
    comparison.tools.forEach((tool: any) => {
      tool.pricingPlans.forEach((plan: any) => {
        planNames.add(plan.name)
      })
    })

    // Get all unique features
    const allFeatures = new Set<string>()
    comparison.tools.forEach((tool: any) => {
      tool.pricingPlans.forEach((plan: any) => {
        plan.features.forEach((feature: any) => {
          allFeatures.add(feature.name)
        })
      })
    })

    // Create CSV headers
    const headers = [
      { id: "category", title: "Category" },
      { id: "item", title: "Item" },
    ]

    comparison.tools.forEach((tool: any) => {
      headers.push({ id: tool.id, title: tool.name })
    })

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: headers,
    })

    // Prepare records for pricing
    const pricingRecords: any[] = []

    // Add header row for pricing
    pricingRecords.push({
      category: "Pricing",
      item: "",
      ...comparison.tools.reduce((acc: any, tool: any) => {
        acc[tool.id] = ""
        return acc
      }, {}),
    })

    // Add pricing rows
    Array.from(planNames).forEach((planName) => {
      const record: any = {
        category: "",
        item: planName,
      }

      comparison.tools.forEach((tool: any) => {
        const plan = tool.pricingPlans.find((p: any) => p.name === planName)
        record[tool.id] = plan ? (plan.isCustomPricing ? "Custom" : `$${plan.price || 0}`) : "N/A"
      })

      pricingRecords.push(record)
    })

    // Prepare records for features
    const featureRecords: any[] = []

    // Add header row for features
    featureRecords.push({
      category: "Features",
      item: "",
      ...comparison.tools.reduce((acc: any, tool: any) => {
        acc[tool.id] = ""
        return acc
      }, {}),
    })

    // Add feature rows
    Array.from(allFeatures).forEach((featureName) => {
      const record: any = {
        category: "",
        item: featureName,
      }

      comparison.tools.forEach((tool: any) => {
        const hasFeature = tool.pricingPlans.some((plan: any) =>
          plan.features.some((feature: any) => feature.name === featureName),
        )

        record[tool.id] = hasFeature ? "Yes" : "No"
      })

      featureRecords.push(record)
    })

    // Write all records
    await csvWriter.writeRecords([...pricingRecords, ...featureRecords])

    const fileUrl = `/api/reports/${path.basename(filePath)}`
    return fileUrl
  } catch (error) {
    throw error
  }
}

// Helper function to generate Excel report
const generateExcelReport = async (comparison: any, filePath: string, includeCharts = false): Promise<string> => {
  try {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "SaaS Pricing Comparison Engine"
    workbook.created = new Date()

    // Create pricing sheet
    const pricingSheet = workbook.addWorksheet("Pricing Comparison")

    // Add title
    pricingSheet.mergeCells("A1:E1")
    const titleCell = pricingSheet.getCell("A1")
    titleCell.value = "SaaS Pricing Comparison"
    titleCell.font = { size: 16, bold: true }
    titleCell.alignment = { horizontal: "center" }

    // Add date
    pricingSheet.mergeCells("A2:E2")
    const dateCell = pricingSheet.getCell("A2")
    dateCell.value = `Generated on: ${new Date().toLocaleDateString()}`
    dateCell.alignment = { horizontal: "center" }

    // Add headers
    const headers = ["Plan"]
    comparison.tools.forEach((tool: any) => {
      headers.push(tool.name)
    })
    pricingSheet.addRow(headers)

    // Style header row
    const headerRow = pricingSheet.getRow(3)
    headerRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      }
    })

    // Get all unique plan names
    const planNames = new Set<string>()
    comparison.tools.forEach((tool: any) => {
      tool.pricingPlans.forEach((plan: any) => {
        planNames.add(plan.name)
      })
    })

    // Add pricing rows
    Array.from(planNames).forEach((planName) => {
      const row: any[] = [planName]

      comparison.tools.forEach((tool: any) => {
        const plan = tool.pricingPlans.find((p: any) => p.name === planName)
        row.push(plan ? (plan.isCustomPricing ? "Custom" : `$${plan.price || 0}`) : "N/A")
      })

      pricingSheet.addRow(row)
    })

    // Auto-fit columns
    pricingSheet.columns.forEach((column) => {
      column.width = 20
    })

    // Create features sheet
    const featuresSheet = workbook.addWorksheet("Features Comparison")

    // Add title
    featuresSheet.mergeCells("A1:E1")
    const featuresTitleCell = featuresSheet.getCell("A1")
    featuresTitleCell.value = "SaaS Features Comparison"
    featuresTitleCell.font = { size: 16, bold: true }
    featuresTitleCell.alignment = { horizontal: "center" }

    // Add headers
    const featuresHeaders = ["Feature"]
    comparison.tools.forEach((tool: any) => {
      featuresHeaders.push(tool.name)
    })
    featuresSheet.addRow(featuresHeaders)

    // Style header row
    const featuresHeaderRow = featuresSheet.getRow(2)
    featuresHeaderRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      }
    })

    // Get all unique features
    const allFeatures = new Set<string>()
    comparison.tools.forEach((tool: any) => {
      tool.pricingPlans.forEach((plan: any) => {
        plan.features.forEach((feature: any) => {
          allFeatures.add(feature.name)
        })
      })
    })

    // Add feature rows
    Array.from(allFeatures).forEach((featureName) => {
      const row: any[] = [featureName]

      comparison.tools.forEach((tool: any) => {
        const hasFeature = tool.pricingPlans.some((plan: any) =>
          plan.features.some((feature: any) => feature.name === featureName),
        )

        row.push(hasFeature ? "Yes" : "No")
      })

      featuresSheet.addRow(row)
    })

    // Auto-fit columns
    featuresSheet.columns.forEach((column) => {
      column.width = 20
    })

    // Save workbook
    await workbook.xlsx.writeFile(filePath)

    const fileUrl = `/api/reports/${path.basename(filePath)}`
    return fileUrl
  } catch (error) {
    throw error
  }
}
