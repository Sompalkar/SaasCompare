import { z } from "zod"

export const searchToolsSchema = z.object({
  query: z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    integrations: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
})
