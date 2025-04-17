import { z } from "zod"

export const saveComparisonSchema = z.object({
  body: z.object({
    comparisonId: z.string(),
    name: z.string().min(1, "Comparison name is required"),
  }),
})

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address").optional(),
    company: z.string().optional(),
    jobTitle: z.string().optional(),
  }),
})
