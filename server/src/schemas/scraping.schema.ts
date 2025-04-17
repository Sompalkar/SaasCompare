import { z } from "zod"

export const createScrapingJobSchema = z.object({
  body: z.object({
    url: z.string().url("Must be a valid URL"),
    toolId: z.string().optional(),
    type: z.enum(["PRICING", "FEATURES", "INTEGRATIONS"]),
    schedule: z.enum(["ONCE", "DAILY", "WEEKLY", "MONTHLY"]).optional(),
  }),
})
