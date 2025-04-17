import { z } from "zod"

export const createCheckoutSessionSchema = z.object({
  body: z.object({
    planId: z.string(),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
  }),
})
