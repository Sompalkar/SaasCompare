import { z } from "zod"

export const createToolSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Tool name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    logo: z.string().url("Logo must be a valid URL"),
    website: z.string().url("Website must be a valid URL"),
    category: z.string(),
    pricingPlans: z.array(
      z.object({
        name: z.string(),
        price: z.number().nullable(),
        isCustomPricing: z.boolean().optional(),
        features: z.array(z.string()),
        limitations: z.array(z.string()).optional(),
      }),
    ),
    integrations: z.array(z.string()).optional(),
  }),
})

export const updateToolSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Tool name must be at least 2 characters").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    logo: z.string().url("Logo must be a valid URL").optional(),
    website: z.string().url("Website must be a valid URL").optional(),
    category: z.string().optional(),
    pricingPlans: z
      .array(
        z.object({
          id: z.string().optional(),
          name: z.string(),
          price: z.number().nullable(),
          isCustomPricing: z.boolean().optional(),
          features: z.array(z.string()),
          limitations: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    integrations: z.array(z.string()).optional(),
  }),
})

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address").optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
    plan: z.enum(["FREE", "PRO", "ENTERPRISE"]).optional(),
    isActive: z.boolean().optional(),
  }),
})
