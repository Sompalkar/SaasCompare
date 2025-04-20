import { z } from "zod"

export const createScrapingJobSchema = z.object({
  body: z.object({
    url: z.string().url("Invalid URL format"),
    type: z.enum(["PRICING", "FEATURES", "INTEGRATIONS"], {
      errorMap: () => ({ message: "Type must be PRICING, FEATURES, or INTEGRATIONS" }),
    }),
    toolId: z.string().optional(),
  }),
})

export const bulkCreateScrapingJobsSchema = z.object({
  body: z.object({
    toolId: z.string(),
    urls: z.array(z.string().url("Invalid URL format")).min(1, "At least one URL is required"),
  }),
})
