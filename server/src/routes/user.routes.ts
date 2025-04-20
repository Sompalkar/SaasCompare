import { Router } from "express"
import {
  getUserComparisons,
  getSavedComparisonById,
  saveComparison,
  deleteComparison,
  updateUserProfile,
  getUserReports,
} from "../controllers/user.controller"
import { validateRequest } from "../middleware/validateRequest"
import { saveComparisonSchema, updateProfileSchema } from "../schemas/user.schema"

const router = Router()

// Protected routes
router.get("/comparisons", getUserComparisons)
router.get("/comparisons/:id", getSavedComparisonById)
router.post("/comparisons", validateRequest(saveComparisonSchema), saveComparison)
router.delete("/comparisons/:id", deleteComparison)
router.get("/reports", getUserReports)
router.patch("/profile", validateRequest(updateProfileSchema), updateUserProfile)

export default router
