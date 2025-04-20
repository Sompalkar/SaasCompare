import ExcelJS from "exceljs"
import path from "path"
import type { ComparisonData } from "./ai/gemini.service"
import type { AIGeneratedReport } from "./ai/gemini.service"

export const generateExcelReport = async (
  comparison: ComparisonData,
  outputDir: string,
  aiInsights?: AIGeneratedReport | null,
): Promise<string> => {
  try {
    // Create filename and path
    const filename = `comparison-report-${Date.now()}.xlsx`
    const filePath = path.join(outputDir, filename)

    // Create workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "SaaS Pricing Engine"
    workbook.lastModifiedBy = "SaaS Pricing Engine"
    workbook.created = new Date()
    workbook.modified = new Date()

    // Add summary sheet
    const summarySheet = workbook.addWorksheet("Summary")

    // Add title
    summarySheet.mergeCells("A1:F1")
    const titleCell = summarySheet.getCell("A1")
    titleCell.value = "SaaS Comparison Report"
    titleCell.font = { size: 16, bold: true }
    titleCell.alignment = { horizontal: "center" }

    // Add date
    summarySheet.mergeCells("A2:F2")
    const dateCell = summarySheet.getCell("A2")
    dateCell.value = `Generated on: ${new Date().toLocaleDateString()}`
    dateCell.alignment = { horizontal: "center" }

    // Add tools list
    summarySheet.getCell("A4").value = "Compared Tools:"
    summarySheet.getCell("A4").font = { bold: true }

    comparison.tools.forEach((tool, index) => {
      summarySheet.getCell(`A${5 + index}`).value = tool.name
    })

    // Add executive summary if available
    if (aiInsights?.executiveSummary) {
      summarySheet.getCell("A8").value = "Executive Summary"
      summarySheet.getCell("A8").font = { size: 14, bold: true }

      summarySheet.mergeCells("A9:F20")
      const summaryCell = summarySheet.getCell("A9")
      summaryCell.value = aiInsights.executiveSummary
      summaryCell.alignment = { wrapText: true, vertical: "top" }
    }

    // Add feature comparison sheet
    const featureSheet = workbook.addWorksheet("Feature Comparison")

    // Add header row
    const headerRow = ["Feature", ...comparison.tools.map((tool) => tool.name)]
    featureSheet.addRow(headerRow)

    // Style header row
    featureSheet.getRow(1).font = { bold: true }
    featureSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    }

    // Add feature rows
    comparison.features.forEach((feature) => {
      const row = [feature]
      comparison.tools.forEach((tool) => {
        const hasFeature = tool.features.includes(feature)
        row.push(hasFeature ? "Yes" : "No")
      })
      featureSheet.addRow(row)
    })

    // Auto-fit columns - with safety check for undefined
    featureSheet.columns.forEach((column) => {
      if (column && typeof column.eachCell === "function") {
        let maxLength = 0
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10
          if (columnLength > maxLength) {
            maxLength = columnLength
          }
        })
        column.width = maxLength < 10 ? 10 : maxLength + 2
      }
    })

    // Add pricing sheet
    const pricingSheet = workbook.addWorksheet("Pricing Plans")

    // Add header
    pricingSheet.getCell("A1").value = "Tool"
    pricingSheet.getCell("B1").value = "Plan"
    pricingSheet.getCell("C1").value = "Price"
    pricingSheet.getCell("D1").value = "Features"
    pricingSheet.getCell("E1").value = "Limitations"

    // Style header
    pricingSheet.getRow(1).font = { bold: true }
    pricingSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    }

    // Add pricing data
    let rowIndex = 2
    comparison.tools.forEach((tool) => {
      tool.pricingPlans.forEach((plan) => {
        pricingSheet.getCell(`A${rowIndex}`).value = tool.name
        pricingSheet.getCell(`B${rowIndex}`).value = plan.name
        pricingSheet.getCell(`C${rowIndex}`).value = plan.price !== null ? `${plan.price}` : "Custom pricing"
        pricingSheet.getCell(`D${rowIndex}`).value = plan.features.join(", ")
        pricingSheet.getCell(`E${rowIndex}`).value = plan.limitations.join(", ")
        rowIndex++
      })
    })

    // Auto-fit columns - with safety check for undefined
    pricingSheet.columns.forEach((column) => {
      if (column && typeof column.eachCell === "function") {
        let maxLength = 0
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10
          if (columnLength > maxLength) {
            maxLength = columnLength
          }
        })
        column.width = maxLength < 10 ? 10 : maxLength + 2
      }
    })

    // Add AI insights sheets if available
    if (aiInsights) {
      if (aiInsights.detailedAnalysis) {
        const analysisSheet = workbook.addWorksheet("Detailed Analysis")
        analysisSheet.getCell("A1").value = "Detailed Analysis"
        analysisSheet.getCell("A1").font = { size: 14, bold: true }
        analysisSheet.mergeCells("A2:F30")
        analysisSheet.getCell("A2").value = aiInsights.detailedAnalysis
        analysisSheet.getCell("A2").alignment = { wrapText: true, vertical: "top" }
      }

      if (aiInsights.recommendations) {
        const recommendationsSheet = workbook.addWorksheet("Recommendations")
        recommendationsSheet.getCell("A1").value = "Recommendations"
        recommendationsSheet.getCell("A1").font = { size: 14, bold: true }
        recommendationsSheet.mergeCells("A2:F30")
        recommendationsSheet.getCell("A2").value = aiInsights.recommendations
        recommendationsSheet.getCell("A2").alignment = { wrapText: true, vertical: "top" }
      }

      if (aiInsights.pricingAnalysis) {
        const pricingAnalysisSheet = workbook.addWorksheet("Pricing Analysis")
        pricingAnalysisSheet.getCell("A1").value = "Pricing Analysis"
        pricingAnalysisSheet.getCell("A1").font = { size: 14, bold: true }
        pricingAnalysisSheet.mergeCells("A2:F30")
        pricingAnalysisSheet.getCell("A2").value = aiInsights.pricingAnalysis
        pricingAnalysisSheet.getCell("A2").alignment = { wrapText: true, vertical: "top" }
      }

      if (aiInsights.marketPositioning) {
        const positioningSheet = workbook.addWorksheet("Market Positioning")
        positioningSheet.getCell("A1").value = "Market Positioning"
        positioningSheet.getCell("A1").font = { size: 14, bold: true }
        positioningSheet.mergeCells("A2:F30")
        positioningSheet.getCell("A2").value = aiInsights.marketPositioning
        positioningSheet.getCell("A2").alignment = { wrapText: true, vertical: "top" }
      }
    }

    // Write to file
    await workbook.xlsx.writeFile(filePath)

    return filePath
  } catch (error) {
    console.error("Error generating Excel report:", error)
    throw new Error(`Failed to generate Excel report: ${error instanceof Error ? error.message : String(error)}`)
  }
}
