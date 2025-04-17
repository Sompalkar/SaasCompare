import { Router } from "express"
import {
  getCurrentSubscription,
  createCheckoutSession,
  cancelSubscription,
  handleWebhook,
  updateSubscription,
} from "../controllers/subscription.controller"
import { validateRequest } from "../middleware/validateRequest"
import { createCheckoutSessionSchema } from "../schemas/subscription.schema"

const router = Router()

// Protected routes
router.get("/", getCurrentSubscription)
router.post("/checkout", validateRequest(createCheckoutSessionSchema), createCheckoutSession)
router.post("/cancel", cancelSubscription)
router.patch("/", updateSubscription)

// Webhook route (public)
router.post("/webhook", handleWebhook)

export default router
