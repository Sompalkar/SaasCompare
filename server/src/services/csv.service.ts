import fs from "fs"
import path from "path"
import { stringify } from "csv-stringify"
import type { ComparisonData } from "./ai/gemini.service"

export const generateCSVReport = async (comparison: ComparisonData, outputDir: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create filename and path
      const filename = `comparison-report-${Date.now()}.csv`
      const filePath = path.join(outputDir, filename)

      // Prepare data for CSV
      const headers = ["Feature", ...comparison.tools.map((tool) => tool.name)]
      const rows = [headers]

      // Add feature rows
      comparison.features.forEach((feature) => {
        const row = [feature]
        comparison.tools.forEach((tool) => {
          const hasFeature = tool.features.includes(feature)
          row.push(hasFeature ? "Yes" : "No")
        })
        rows.push(row)
      })

      // Add pricing rows
      rows.push(["", ""])
      rows.push(["Pricing Plans", ""])

      // Find the maximum number of pricing plans
      const maxPlans = Math.max(...comparison.tools.map((tool) => tool.pricingPlans.length))

      for (let i = 0; i < maxPlans; i++) {
        const planRow = [`Plan ${i + 1}`]
        comparison.tools.forEach((tool) => {
          const plan = tool.pricingPlans[i]
          planRow.push(plan ? `${plan.name}: ${plan.price !== null ? `$${plan.price}` : "Custom"}` : "")
        })
        rows.push(planRow)
      }

      // Write to CSV file
      stringify(rows, (err, output) => {
        if (err) {
          reject(err)
          return
        }

        fs.writeFile(filePath, output, (err) => {
          if (err) {
            reject(err)
            return
          }

          resolve(filePath)
        })
      })
    } catch (error) {
      reject(error)
    }
  })
}
