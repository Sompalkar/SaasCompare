import { Router } from "express"
import {
  createTool,
  updateTool,
  deleteTool,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats
} from "../controllers/admin.controller"
import { validateRequest } from "../middleware/validateRequest"
import { createToolSchema, updateToolSchema, updateUserSchema } from "../schemas/admin.schema"
import { isAdmin } from "../middleware/isAdmin"
import { runSeed } from "../utils/seed-data"
import { seedCloudData } from "../utils/cloud-provider-seed"
import { logger } from "../utils/logger"
import { getAllTools, getToolById } from "../controllers/tools.controller"

const router = Router()

// Admin routes (all protected by isAdmin middleware)
router.use(isAdmin)

// Admin dashboard stats
router.get("/dashboard", getDashboardStats)

// Tools management
router.get("/tools", getAllTools)
router.get("/tools/:id", getToolById)
router.post("/tools", validateRequest(createToolSchema), createTool)
router.patch("/tools/:id", validateRequest(updateToolSchema), updateTool)
router.delete("/tools/:id", deleteTool)

// User management
router.get("/users", getAllUsers)
router.get("/users/:id", getUserById)
router.patch("/users/:id", validateRequest(updateUserSchema), updateUser)
router.delete("/users/:id", deleteUser)

// Seed data for SaaS tools
router.post("/seed", async (req, res) => {
  try {
    const result = await runSeed()
    return res.status(result.success ? 200 : 500).json(result)
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error seeding database',
      error: String(error)
    })
  }
})

// Seed data for cloud providers
router.post("/seed-cloud", async (req, res) => {
  try {
    logger.info("Starting cloud data seeding via API...")
    await seedCloudData()
    return res.status(200).json({
      success: true,
      message: 'Cloud data seeded successfully'
    })
  } catch (error) {
    logger.error("Error seeding cloud data:", error)
    return res.status(500).json({
      success: false,
      message: 'Error seeding cloud data',
      error: String(error)
    })
  }
})

export default router
