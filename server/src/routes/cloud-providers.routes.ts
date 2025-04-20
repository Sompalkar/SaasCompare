import { Router } from "express"
import {
  getAllCloudProviders,
  getCloudProviderById,
  compareCloudProviders,
  getComparisonById,
  getAllComparisons,
  updateComparisonName,
  deleteComparison,
} from "../controllers/cloud-providers.controller"
import { authenticate } from "../middleware/authenticate"

const router = Router()

// Public routes
router.get("/", getAllCloudProviders)
router.get("/:id", getCloudProviderById)
router.post("/compare", compareCloudProviders)
router.get("/comparison/:id", getComparisonById)

// Protected routes
router.use(authenticate)
router.get("/comparisons/all", getAllComparisons)
router.put("/comparison/:id/name", updateComparisonName)
router.delete("/comparison/:id", deleteComparison)

export default router
