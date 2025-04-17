import { z } from "zod"

export const generateReportSchema = z.object({
  body: z.object({
    comparisonId: z.string(),
    format: z.enum(["PDF", "CSV", "EXCEL"]),
    includeCharts: z.boolean().optional(),
  }),
})
