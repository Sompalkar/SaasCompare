import { z } from "zod"

// Create tool schema
const createToolSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    website: z.string().url("Website must be a valid URL"),
    logo: z.string().optional(),
    pricingPlans: z
      .array(
        z.object({
          name: z.string().min(1, "Plan name is required"),
          price: z.number().nullable(),
          isCustomPricing: z.boolean().default(false),
          features: z.array(z.string()).optional(),
          limitations: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    integrations: z.array(z.string()).optional(),
  }),
})

// Update tool schema
const updateToolSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required").optional(),
    website: z.string().url("Website must be a valid URL").optional(),
    logo: z.string().optional(),
    pricingPlans: z
      .array(
        z.object({
          name: z.string().min(1, "Plan name is required"),
          price: z.number().nullable(),
          isCustomPricing: z.boolean().default(false),
          features: z.array(z.string()).optional(),
          limitations: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    integrations: z.array(z.string()).optional(),
  }),
})

// Search tools schema
const searchToolsSchema = z.object({
  query: z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    integrations: z.string().optional(),
  }),
})

// Scrape tool data schema
const scrapeToolDataSchema = z.object({
  body: z.object({
    url: z.string().url("URL must be valid"),
    toolId: z.string().uuid("Tool ID must be a valid UUID").optional(),
  }),
})

// Export all schemas
export const toolsSchema = {
  createTool: createToolSchema,
  updateTool: updateToolSchema,
  searchTools: searchToolsSchema,
  scrapeToolData: scrapeToolDataSchema,
}
