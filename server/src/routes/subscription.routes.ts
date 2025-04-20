import { Router } from "express"
import {
  getPlans,
  getUserSubscription,
  createCheckoutSession,
  createPortalSession,
  handleStripeWebhook,
  cancelSubscription,
  resumeSubscription,
  getSubscriptionDetails,
} from "../controllers/subscription.controller"
import { authenticate } from "../middleware/authenticate"
import express from "express"

const router = Router()

// Webhook route - needs raw body
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook)

// Public routes
router.get("/plans", getPlans)

// Protected routes
router.use(authenticate)
router.get("/", getUserSubscription)
router.post("/checkout", createCheckoutSession)
router.post("/portal", createPortalSession)
router.post("/cancel", cancelSubscription)
router.post("/resume", resumeSubscription)
router.get("/:id", getSubscriptionDetails)

export default router
