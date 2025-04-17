import { z } from "zod"

export const compareToolsSchema = z.object({
  body: z.object({
    toolIds: z.array(z.string()).min(2, "At least 2 tools must be selected for comparison"),
    features: z.array(z.string()).optional(),
  }),
})
