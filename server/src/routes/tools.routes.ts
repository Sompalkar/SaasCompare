import { Router } from "express"
import {
  getAllTools,
  getToolById,
  searchTools,
  createTool,
  updateTool,
  deleteTool,
  getFeaturedTools,
  getPopularTools,
  getToolHistoricalData,
  getToolCategories,
  getToolsByCategory,
  getToolAlternatives,
  getToolIntegrations,
  getToolPricingHistory,
  trackTool,
  getUserTrackedTools,
  untrackTool,
} from "../controllers/tools.controller"
import { authenticate } from "../middleware/authenticate"
import { isAdmin } from "../middleware/isAdmin"
import { validateRequest } from "../middleware/validateRequest"
import { createToolSchema, updateToolSchema } from "../schemas/admin.schema"

const router = Router()

// Public routes
router.get("/", getAllTools)
router.get("/search", searchTools)
router.get("/featured", getFeaturedTools)
router.get("/popular", getPopularTools)
router.get("/historical", getToolHistoricalData)
router.get("/categories", getToolCategories)
router.get("/category/:category", getToolsByCategory)

// Tool specific routes - these need to be after other routes to avoid conflict with :id
router.get("/:id", getToolById)
router.get("/:id/alternatives", getToolAlternatives)
router.get("/:id/integrations", getToolIntegrations)
router.get("/:id/history", getToolPricingHistory)

// Protected routes
router.post("/track", authenticate, trackTool)
router.get("/user/tracked", authenticate, getUserTrackedTools)
router.delete("/track/:id", authenticate, untrackTool)

// Admin routes
router.post("/", isAdmin, validateRequest(createToolSchema), createTool)
router.patch("/:id", isAdmin, validateRequest(updateToolSchema), updateTool)
router.delete("/:id", isAdmin, deleteTool)

export default router
