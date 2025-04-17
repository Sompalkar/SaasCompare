import { Router } from "express"
import { compareTools, getComparisonById } from "../controllers/compare.controller"
import { validateRequest } from "../middleware/validateRequest"
import { compareToolsSchema } from "../schemas/compare.schema"

const router = Router()

// Public routes
router.post("/", validateRequest(compareToolsSchema), compareTools)
router.get("/:id", getComparisonById)

export default router
