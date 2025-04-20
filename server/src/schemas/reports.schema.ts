import { z } from "zod"

export const generateReportSchema = z.object({
  body: z.object({
    comparisonId: z.string(),
    format: z.enum(["pdf", "excel", "ppt"], {
      errorMap: () => ({ message: "Format must be pdf, excel, or ppt" }),
    }),
    includeCharts: z.boolean().optional().default(false),
  }),
})
