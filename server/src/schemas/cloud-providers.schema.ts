import { z } from "zod"

// Compare providers schema
export const compareProvidersSchema = z.object({
  body: z.object({
    providers: z.array(z.string()).min(1, "At least one provider is required"),
    serviceTypes: z.array(z.string()).min(1, "At least one service type is required"),
  }),
})

// Save comparison schema
export const saveComparisonSchema = z.object({
  body: z.object({
    id: z.string().min(1, "Comparison ID is required"),
    name: z.string().min(1, "Name is required"),
  }),
})

// Export all schemas
export const cloudProvidersSchema = {
  compareProviders: compareProvidersSchema,
  saveComparison: saveComparisonSchema,
}
